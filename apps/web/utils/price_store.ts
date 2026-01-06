import { Assets } from "./constant";
import { SignalingManager } from "./subscription_manager";

export type BaseSymbol = "BTC" | "ETH" | "SOL";
export interface LivePrice {
    bid: number,
    ask: number
}

export type LivePrices = Record<BaseSymbol, LivePrice>;

type Listener = (prices: LivePrices) => void;

let latestPrices: LivePrices = {
    BTC: { bid: 0, ask: 0 },
    ETH: { bid: 0, ask: 0 },
    SOL: { bid: 0, ask: 0 },
};

const listeners = new Set<Listener>();
let initialized = false;

function emit() {
    listeners.forEach((fn) => fn(latestPrices))
}

function ensureInitialized() {
    if (initialized) return;
    initialized = true;
    const signaling = SignalingManager.getInstance();

    const handler = (raw: any) => {

        const updates = Array.isArray(raw) ? raw : [raw];

        let next = { ...latestPrices }

        updates.forEach((t: any) => {
            const base = String(t.asset || "").replace("USDT", "") as BaseSymbol;
            if (!(base in next)) return;

            next[base] = {
                bid: t.bidPrice !== undefined
                    ? Number(t.bidPrice.toFixed(t.decimals ?? 2))
                    : next[base].bid,
                ask: t.askPrice !== undefined
                    ? Number(t.askPrice.toFixed(t.decimals ?? 2))
                    : next[base].ask,
            }
        })

        latestPrices = next;
        emit()
    }

    signaling.watch(Assets.SOLUSDT, handler)
    signaling.watch(Assets.ETHUSDT, handler)
    signaling.watch(Assets.BTCUSDT, handler)
}

export function subscribePrices(listener: Listener): () => void {
    ensureInitialized()
    listeners.add(listener);
    listener(latestPrices)
    return () => {
        listeners.delete(listener)
    }
}