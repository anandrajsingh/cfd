import { Asset, OrderType, TradeType } from "@prisma/client"

const latestPrice = new Map<Asset, number>();

export function setLatestPrice(asset: Asset, price: number) {
  latestPrice.set(asset, price);
}

export function getLatestPrice(asset: Asset): number | undefined {
  return latestPrice.get(asset);
}

export interface Order {
    id: string;
    userId: string;
    asset: Asset;
    side: TradeType;
    orderType: OrderType;
    limitPrice?: number;
    margin: number;
    leverage: number;
    takeProfit?: number;
    stopLoss?: number;
}

export const marketOrderByAsset = new Map<Asset, Order[]>();

export const limitOrderByAsset = new Map<
    Asset,
    {
        longs: Order[],
        shorts: Order[]
    }
>();

export interface Position {
  id: string;
  userId: string;
  asset: Asset;
  side: TradeType;
  entryPrice: number;
  positionSize: number;
  liquidationPrice: number;
  takeProfit?: number;
  stopLoss?: number;
}

export const positionsByAsset = new Map<Asset, Set<Position>>();