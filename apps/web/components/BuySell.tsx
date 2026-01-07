import { useState } from "react"
import { Assets } from "../utils/constant"

export default function BuySell({
    asset,
    askPrice,
    bidPrice
}: {
    asset: Assets,
    askPrice: number,
    bidPrice: number
}) {
    const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy")
    return (
        <aside
            className="w-full rounded-lg border border-neutral-600 bg-neutral-900/80 backdrop-blur-xl text-neutral-50 shadow-sm h-full flex flex-col"
            aria-label="Trade Ticket"
        >
            <div className="flex border-b border-neutral-600/40 gap-2">
                <button
                    onClick={() => setActiveTab("buy")}
                    className={`flex-1 py-3 text-center font-medium text-sm transition ${activeTab === "buy"
                            ? "text-[#158BF9] border-2 border-[#158BF9]"
                            : "text-neutral-300 hover:text-neutral-50"
                        }`}
                >
                    Buy {asset}
                </button>
                <button
                    onClick={() => setActiveTab("sell")}
                    className={`flex-1 py-3 text-center font-medium text-sm transition ${activeTab === "sell"
                            ? "text-[#EB483F] border-2 border-[#EB483F]"
                            : "text-neutral-300 hover:text-neutral-50"
                        }`}
                >
                    Buy {asset}
                </button>
            </div>

            
        </aside>
    )
}