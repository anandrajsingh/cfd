"use client";

import { useState } from "react";
import ChartComponent from "../../components/Chart";
import { Assets, Duration } from "../../utils/constant";
import AskBids from "../../components/AskBids";
import BuySell from "../../components/BuySell";
import { toDisplayPriceUSD } from "../../utils/utils";
import OrdersPanel from "../../components/OrdersPanel";

const ASSETS = [
    Assets.SOLUSDT,
    Assets.ETHUSDT,
    Assets.BTCUSDT
]

const DURATION = [
    Duration.candles_1m,
    Duration.candles_5m,
    Duration.candles_15m,
    Duration.candles_1h,
    Duration.candles_4h,
    Duration.candles_1d,
    Duration.candles_1w
]

export default function Dashboard() {
    const [duration, setDuration] = useState<Duration>(Duration.candles_1m);
    const [asset, setAsset] = useState<Assets>(Assets.SOLUSDT);
    const [prices, setPrices] = useState({ askPrice: 0, bidPrice: 0 });

    const handleAssetChange = (a: Assets) => {
        setAsset(a);
        setPrices({ askPrice: 0, bidPrice: 0 });
    };

    return (
        <div className="h-screen bg-neutral-950 overflow-hidden flex  gap-2">
            <div className="flex flex-col gap-2 w-3/4">
                <div className="flex flex-1 gap-2">
                    <AskBids asset={asset} onAssetChange={handleAssetChange} />
                    <ChartComponent duration={duration} onDurationChange={setDuration} asset={asset} onPriceUpdate={setPrices} />
                </div>
                <OrdersPanel />
            </div>
            <BuySell asset={asset} askPrice={toDisplayPriceUSD(prices.askPrice)} bidPrice={toDisplayPriceUSD(prices.bidPrice)} />
        </div>
    )
}