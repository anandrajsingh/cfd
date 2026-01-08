import { useEffect, useState } from "react";
import { Assets } from "../utils/constant";
import { LivePrices, subscribePrices } from "../utils/price_store";
import { toDisplayPrice, toDisplayPriceUSD } from "../utils/utils";

const imageUrl = {
    SOL: "https://i.postimg.cc/9MhDvsK9/b2f0c70f-4fb2-4472-9fe7-480ad1592421.png",
    ETH: "https://i.postimg.cc/gcKhPkY2/3a8c9fe6-2a76-4ace-aa07-415d994de6f0.png",
    BTC: "https://i.postimg.cc/TPh0K530/87496d50-2408-43e1-ad4c-78b47b448a6a.png",
};

export default function AskBids({ asset }: { asset: Assets }) {
    const [bid_asks, setBidsAsks] = useState({
        SOL: {
            bids: 0,
            asks: 0,
            asset: "SOL",
        },
        ETH: {
            bids: 0,
            asks: 0,
            asset: "ETH",
        },
        BTC: {
            bids: 0,
            asks: 0,
            asset: "BTC",
        },
    });

    useEffect(() => {
        const unsubscribe = subscribePrices((prices: LivePrices) => {
            setBidsAsks({
                BTC: { bids: toDisplayPriceUSD(prices.BTC.ask), asks: toDisplayPriceUSD(prices.BTC.bid), asset: "BTC" },
                ETH: { bids: toDisplayPriceUSD(prices.ETH.ask), asks: toDisplayPriceUSD(prices.ETH.bid), asset: "ETH" },
                SOL: { bids: toDisplayPriceUSD(prices.SOL.ask), asks: toDisplayPriceUSD(prices.SOL.bid), asset: "SOL" },
            })
        })
        return () => unsubscribe();
    },[])

    return (
        <div className="w-1/4">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs text-neutral-400 border-b border-neutral-600/40">
                        <th className="py-3 text-left font-medium">Symbol</th>
                        <th className="py-3 text-right font-medium">Bid</th>
                        <th className="py-3 text-right font-medium">Ask</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-600/20">
                    {Object.values(bid_asks).map((item) => (
                        <tr key={item.asset}
                            className={`hover:bg-neutral-800/50 transition-colors ${asset === `${item.asset}` ? "bg-neutral-800/30" : ""
                                }`}
                        >
                            <th className="py-4 text-left font-medium text-neutral-50">
                                <div className="flex items-center">
                                    <img
                                        src={imageUrl[item.asset as keyof typeof imageUrl]}
                                        alt={item.asset}
                                        className="h-6 w-6 rounded-full inline-block mr-3"
                                    />
                                    <div className="text-sm font-semibold">{item.asset}</div>

                                </div>
                            </th>
                            <td className="py-4 text-right font-mono text-[#158BF9] font-semibold">
                                {item.asks.toFixed(2)}
                            </td>
                            <td className="py-4 text-right font-mono text-[#EB483F] font-semibold">
                                {item.bids.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}