import "dotenv/config";
import { prismaClient as prisma } from "./src/index.js";

type interval = {
    candle: string;
    bucket: string;
    start: string;
    end: string;
    schedule: string;
}

const intervals: interval[] = [
    { candle: "candle_1m", bucket: "1 minute", start: "1 day", end: "10 seconds", schedule: "10 seconds" },
    { candle: "candle_5m", bucket: "5 minutes", start: "1 day", end: "3 minutes", schedule: "3 minutes" },
    { candle: "candle_15m", bucket: "15 minutes", start: "1 day", end: "5 minutes", schedule: "5 minutes" },
    { candle: "candle_1h", bucket: "1 hour", start: "7 days", end: "30 minutes", schedule: "10 minutes" },
    { candle: "candle_4h", bucket: "4 hours", start: "30 days", end: "30 minutes", schedule: "30 minutes" },
    { candle: "candle_1d", bucket: "1 day", start: "60 days", end: "1 hour", schedule: "1 hour" },
    { candle: "candle_1w", bucket: "1 week", start: "180 days", end: "1 day", schedule: "1 day" },
];

async function policyExists(viewName: string) {
  const result = await prisma.$queryRawUnsafe<
    { exists: number }[]
  >(`
    SELECT 1 AS exists
    FROM timescaledb_information.jobs
    WHERE hypertable_name = '${viewName}'
    LIMIT 1;
  `);

  return result.length > 0;
}

async function run(query: string) {
    await prisma.$executeRawUnsafe(query);
}

async function main() {
    console.log("Setting up TimescaleDB...")

    await run(`
    CREATE EXTENSION IF NOT EXISTS timescaledb;
  `);

    await run(`
        SELECT create_hypertable(
        '"PriceTick"'::regclass,
        'time',
        partitioning_column => 'asset',
        number_partitions => 3,
        if_not_exists => true
        );
        `)

    await run(`
        ALTER TABLE "PriceTick"
        SET (
            timescaledb.compress,
            timescaledb.compress_segmentby = 'asset'
        );
        `)

    await run(`
        SELECT add_compression_policy(
        '"PriceTick"'::regclass,
        INTERVAL '7 days'
        );
        `);

    await run(`
        SELECT add_retention_policy(
        '"PriceTick"'::regclass,
        INTERVAL '30 days'
        );
        `);

    for (const interval of intervals) {
        await run(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS ${interval.candle}
            WITH (timescaledb.continuous) AS
            SELECT
            time_bucket('${interval.bucket}', time) AS bucket,
            asset,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close
            FROM "PriceTick"
            GROUP BY bucket, asset;
            `);

        const exists = await policyExists(interval.candle);

        if(!exists){
            await run(`
            SELECT add_continuous_aggregate_policy(
            '${interval.candle}',
            start_offset => INTERVAL '${interval.start}',
            end_offset => INTERVAL '${interval.end}',
            schedule_interval => INTERVAL '${interval.schedule}'
            );
            `)
        }else{
            console.log(`Policy already exists for ${interval.candle}`)
        }
    }
    console.log("TimescaleDB setup completed.")
}

main()
    .catch((e) => {
        console.error("Setup failed", e)
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })