import { type CandlestickData, type UTCTimestamp } from "lightweight-charts";
import { Assets, Duration, RealtimeUpdate } from "./constant";
import { toDisplayPriceUSD } from "./utils";

type ChartCandle = {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
};

type KlineApiResponse = {
    candles: {
        timestamp: number;
        open: number;
        high: number;
        low: number;
        close: number;
        decimal: number;
    }[]
}

function getBucketSize(duration: Duration) {
    switch (duration) {
        case "1m":
            return 60;
        case "5m":
            return 300;
        case "15m":
            return 900;
        case "1h":
            return 3600;
        case "4h":
            return 14400;
        case "1d":
            return 86400;
        case "1w":
            return 604800;
        default:
            console.warn("Invalid Duration: ", duration)
            return 0;
    }
}

const lastCandles: Record<string, ChartCandle | null> = {};

function key(asset: Assets, duration: Duration) {
    return `${asset}_${duration}`
}

export function processRealUpdate(
    trade: RealtimeUpdate,
    duration: Duration
): CandlestickData {
    const k = key(trade.asset, duration);
    let lastCandle = lastCandles[k];

    const price = toDisplayPriceUSD(trade.bidPrice);

    const bucketSize = getBucketSize(duration);
    const tradeTimeSec = Math.floor(trade.time / 1000)
    const bucketTime = Math.floor(tradeTimeSec / bucketSize) * bucketSize;

    let next: ChartCandle;

    if (!lastCandle || bucketTime > Math.floor(lastCandle.timestamp / 1000)) {
        next = {
            timestamp: bucketTime * 1000,
            open: price,
            high: price,
            low: price,
            close: price
        }
    } else {
        next = {
            timestamp: lastCandle.timestamp,
            open: lastCandle.open,
            high: Math.max(lastCandle.high, price),
            low: Math.min(lastCandle.low, price),
            close: price
        }
    }
    lastCandles[k] = next;
    return {
        time: (next.timestamp /1000) as UTCTimestamp,
        open: next.open,
        high: next.high,
        low: next.low,
        close: next.close,
    };
}

export function initLastCandle(
    asset: Assets,
    duration: Duration,
    data: ChartCandle[],
) {
    const k = key(asset, duration);
    //@ts-ignore
    lastCandles[k] = data.length > 0 ? data[data.length - 1] : null;
}

export async function getChartData(asset: Assets, duration: Duration) {
    const candles = await getKlineData(asset, duration);
    
    initLastCandle(asset, duration, candles)
    return candles.map((c) => ({
        time: (c.timestamp / 1000) as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
    }));;
}

export function resetLastCandle(asset: Assets, duration: Duration){
    delete lastCandles[key(asset, duration)]
}

async function getKlineData(
    asset: Assets,
    duration: Duration,
    startTime?: number,
    endTime?: number,
) {
    const durationSeconds = getBucketSize(duration)
    const currentTimeSec = Math.floor(Date.now() / 1000)

    const startTimeStamp = startTime ? Number(startTime) : currentTimeSec - 3600 * 1000;
    const endTimeStamp = endTime ? Number(endTime) : currentTimeSec;

    const alignedEndSec = Math.floor(currentTimeSec / durationSeconds) * durationSeconds;
    const alignedStartSec = startTime ? Math.floor(Number(startTime)/1000/durationSeconds) * durationSeconds : alignedEndSec - durationSeconds * 100;

    const startTimeMs = alignedStartSec * 1000;
    const endTimeMs = alignedEndSec * 1000;

    const url = new URL("http://localhost:3001/api/v1/candle");
    url.searchParams.set("asset", asset)
    url.searchParams.set("ts", durationSeconds.toString())
    url.searchParams.set("startTime", startTimeMs.toString())
    url.searchParams.set("endTime", endTimeMs.toString())

    const res = await fetch(url.toString(), {
        method: "GET",
        cache: "no-store"
    })
    
    if (!res.ok) {
        throw new Error(`Failed to fetch candles: ${res.status}`);
    }
    
    const data: KlineApiResponse = await res.json();

    return (data.candles ?? []).map((candle) => ({
        timestamp: candle.timestamp,
        open: toDisplayPriceUSD(candle.open),
        high: toDisplayPriceUSD(candle.high),
        low: toDisplayPriceUSD(candle.low),
        close: toDisplayPriceUSD(candle.close),
    }));
}