import { prismaClient as prisma } from "@repo/db/client";
import { Router } from "express";

export const candleRouter = Router()

const TIMEFRAME_VIEW_MAP: Record<number, string> = {
    60: "candle_1m",
    300: "candle_5m",
    900: "candle_15m",
    3600: "candle_1h",
    14400: "candle_4h",
    86400: "candle_1d",
    604800: "candle_1w",
};

candleRouter.get("/", async (req, res) => {
    try {
        const asset = req.query.asset as string;
        const ts = Number(req.query.ts);
        const startTime = Number(req.query.startTime);
        const endTime = Number(req.query.endTime);

        if (!asset || !ts || !startTime || !endTime) {
            return res.status(400).json({
                error: "asset, time, startTime, endTime are required"
            })
        }

        const viewName = TIMEFRAME_VIEW_MAP[ts];
        if (!viewName) {
            return res.status(400).json({ error: "Unsupported Timeframe" });
        }

        const candles = await prisma.$queryRawUnsafe<
            {
                bucket: Date;
                open: bigint;
                high: bigint;
                low: bigint;
                close: bigint;
            }[]
        >(`
            SELECT bucket, open, high, low, close
            FROM ${viewName}
            WHERE asset = $1
              AND bucket >= to_timestamp($2 / 1000.0)
              AND bucket <= to_timestamp($3 / 1000.0)
            ORDER BY bucket ASC
            `, asset, startTime, endTime);

            return res.json({
                candles: candles.map((c) => ({
                    timestamp : c.bucket.getTime(),
                    open: Number(c.open),
                    high: Number(c.high),
                    low : Number(c.low),
                    close:Number(c.close),
                    decimal: 2
                }))
            })
    } catch (error) {
        console.error("Candle route error: ", error);
        return res.status(400).json({error: "Internal server error"})
    }
})