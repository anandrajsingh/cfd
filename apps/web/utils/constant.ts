export const Duration = {
    candles_1m : "1m",
    candles_5m : "5m",
    candles_15m: "15m",
    candles_1h : "1h",
    candles_4h : "4h",
    candles_1d : "1d",
    candles_1w : "1w"
} as const;

export type Duration = (typeof Duration)[keyof typeof Duration];

export const Assets = {
    SOLUSDT : "SOL",
    ETHUSDT : "ETH",
    BTCUSDT : "BTC",
} as const;

export type Assets = (typeof Assets)[keyof typeof Assets];

export interface Trade {
  bidPrice: number;
  askPrice: number;
  asset: Assets;
}

export interface RealtimeUpdate {
  asset: Assets;
  bidPrice: number;
  askPrice: number;
  time: number;
}
