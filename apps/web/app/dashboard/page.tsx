"use client";

import { useState } from "react";
import ChartComponent from "../../components/Chart";
import { Assets, Duration } from "../../utils/constant";

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

    return (
        <div className="min-h-screen bg-neutral-950 overflow-hidden flex flex-col gap-2">
            <div className="flex gap-20">
                <div className="flex gap-2">
                    {ASSETS.map((a) => {
                        const isActive = asset === a;
                        return (
                            <button
                                key={a}
                                className={`px-4 py-2 rounded-md transition-all ${isActive
                                    ? "bg-[#158BF9]/10 text-[#158BF9] border border-[#158BF9]/30"
                                    : "text-neutral-50 hover:bg-neutral-800/50 border border-neutral-600/50"
                                    }`}
                                disabled={isActive}
                                onClick={() => setAsset(a)}
                            >
                                <span className="font-medium text-sm">{a}</span>
                            </button>
                        )
                    })}
                </div>
                <div className="flex gap-2">
                    {DURATION.map((d) => {
                        const isActive = duration === d;
                        return (
                            <button
                                key={d}
                                className={`px-4 py-2 rounded-md transition-all ${isActive
                                    ? "bg-[#158BF9]/10 text-[#158BF9] border border-[#158BF9]/30"
                                    : "text-neutral-50 hover:bg-neutral-800/50 border border-neutral-600/50"
                                    }`}
                                disabled={isActive}
                                onClick={() => setDuration(d)}
                            >
                                <span className="font-medium text-sm">{d}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
            <ChartComponent duration={duration} asset={asset} onPriceUpdate={setPrices} />
        </div>
    )
}