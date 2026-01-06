"use client";

import { useState } from "react";
import ChartComponent from "../../components/Chart";
import { Assets, Duration } from "../../utils/constant";

export default function Dashboard(){
    const [duration, setDuration] = useState<Duration>(Duration.candles_1m);
    const [asset, setAsset] = useState<Assets>(Assets.SOLUSDT);
    const [prices, setPrices] = useState({askPrice: 0, bidPrice: 0});
    
    return (
        <div className="min-h-screen bg-neutral-950 overflow-hidden flex flex-col">
            <ChartComponent duration={duration} asset={asset} onPriceUpdate={setPrices}/>
        </div>
    )
}