import "dotenv/config";
import { createClient } from "redis";
import { Asset } from "@prisma/client"
import { prismaClient as prisma } from "@repo/db/client"

const redisClient = createClient({ url: "redis://localhost:6379" });

const STREAM_KEY = "price_stream";
const GROUP_NAME = "price_uploaders";
const CONSUMER_NAME = `worker-${process.pid}`;

const BUFFER_SIZE = 500;
const FLUSH_INTERVAL_MS = 3000;

type RedisStreamMessage = {
    id: string;
    message: Record<string, string>;
};

type RedisStream = {
    name: string;
    messages: RedisStreamMessage[];
};

type PriceTickBuffer = {
    id: string;
    time: Date;
    asset: Asset;
    price: bigint;
}

let buffer: PriceTickBuffer[] = [];

async function initRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect()
            console.log("Redis Connected.")
        }
    } catch (err) {
        console.log("Error connecting Redis", err)
    }
}

async function ensureConsumerGroup() {
    try {
        await redisClient.xGroupCreate(
            STREAM_KEY, GROUP_NAME, "$", { MKSTREAM: true }
        )
        console.log("Consumer group created.")
    } catch (err: any) {
        if (err?.message?.includes("BUSYGROUP")) {
            console.log("Consumer group already exists.")
        } else {
            throw err;
        }
    }
}

function parseAsset(market: string): Asset | null {
    switch (market) {
        case "BTC":
            return Asset.BTC;
        case "ETH":
            return Asset.ETH;
        case "SOL":
            return Asset.SOL;
        default:
            return null;
    }
}


async function getRedisData() {
    await ensureConsumerGroup();
    while (true) {
        const response = await redisClient.xReadGroup(
            GROUP_NAME,
            CONSUMER_NAME,
            [{ key: STREAM_KEY, id: ">" }],
            { BLOCK: 5000, COUNT: 100 }
        )

        if (!Array.isArray(response)) continue;

        for (const rawStream of response) {
            if (typeof rawStream !== "object" || rawStream === null) {
                continue;
            }
            const stream = rawStream as RedisStream
            for (const msg of stream.messages) {
                const { market, price, timestamp } = msg.message;
                if (!market || !price || !timestamp) continue;
                const asset = parseAsset(market);
                if (!asset) {
                    console.warn("Unknown asset received:", market);
                    continue;
                }
                buffer.push({
                    id: msg.id,
                    time: new Date(Number(timestamp)),
                    asset,
                    price: BigInt(price)
                })
            }
        }
    }
}

async function flushToDB() {
    if (buffer.length === 0) return;

    const batch = buffer.slice(0, BUFFER_SIZE);

    try {
        await prisma.priceTick.createMany({
            data: batch.map(b => ({
                time: b.time,
                asset: b.asset,
                price: b.price,
            })),
            skipDuplicates: true
        })

        await redisClient.xAck(
            STREAM_KEY,
            GROUP_NAME,
            batch.map(b => b.id)
        )
        buffer.splice(0, batch.length)
        console.log(`Inserted and ACKed ${batch.length} ticks.`)
    } catch (err) {
        console.log("DB insert failed, retrying", err)
    }
}

async function main() {
    await initRedis()
    setInterval(() => {
        flushToDB().catch(console.error)
    }, FLUSH_INTERVAL_MS)
    await getRedisData()
}

main()

process.on("SIGINT", async () => {
    console.log("Shutting Down...")
    await prisma.$disconnect();
    await redisClient.quit()
    process.exit(0)
})