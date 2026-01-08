import { Assets } from "../utils/constant";

export async function createTrade({
    asset,
    side,
    marginUsd,
    leverage,
    tpEnabled,
    tpPrice,
    slEnabled,
    slPrice
}: {
    asset: Assets,
    side: "buy" | "sell",
    marginUsd: number,
    leverage: number,
    tpEnabled: boolean,
    tpPrice?: string,
    slEnabled: boolean,
    slPrice: string
}) {
    const type = side === "buy" ? "LONG" : "SHORT";

    const payload: any = {
        asset,
        type,
        leverage,
        margin: Math.floor(marginUsd * 100)
    };

    if (tpEnabled && tpPrice) {
        payload.takeProfit = Math.floor(Number(tpPrice) * 100);
    }

    if (slEnabled && slPrice) {
        payload.stopLoss = Math.floor(Number(slPrice) * 100);
    }

    const res = await fetch("http://localhost:3001/api/v1/trade/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    })
}

export async function closeTrade(positionId: string){
    try {
        const res = await fetch("http://localhost:3001/api/v1/trade/close",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({positionId})
        })
        console.log(res)
    } catch (err) {
        throw new Error((err as Error).message)
    }
}

export async function fetchOpenTrades(){
    try {
        const res = await fetch("http://localhost:3001/api/v1/trade/positions/open", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        })
        return await res.json();
    } catch (err) {
        throw new Error((err as Error).message)
    }
}

export async function fetchClosedTrades(){
    try {
        const res = await fetch("http://localhost:3001/api/v1/trade/positions/closed", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        })
        // console.log(await res.json())
        return await res.json();
    } catch (err) {
        throw new Error((err as Error).message)
    }
}