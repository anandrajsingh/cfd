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

 const assetDetails = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      decimals: 4,
      imageUrl:
        "https://i.postimg.cc/TPh0K530/87496d50-2408-43e1-ad4c-78b47b448a6a.png",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 4,
      imageUrl:
        "https://i.postimg.cc/gcKhPkY2/3a8c9fe6-2a76-4ace-aa07-415d994de6f0.png",
    },
    {
      name: "Solana",
      symbol: "SOL",
      decimals: 4,
      imageUrl:
        "https://i.postimg.cc/9MhDvsK9/b2f0c70f-4fb2-4472-9fe7-480ad1592421.png",
    },
  ];