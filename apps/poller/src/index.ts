import WebSocket from "ws"
import { initRedis, redis } from "./redisClient";

const currentPrice = [
    { market: "BTC", price: 0, decimals: 0 },
    { market: "SOL", price: 0, decimals: 0 },
    { market: "ETH", price: 0, decimals: 0 },
]

function publishCurrentPrice() {
    setInterval(async () => {
        await redis.publish("price_updates", JSON.stringify(currentPrice))
    }, 300)
}

async function pushToPriceStream(
    market: string,
    price: number,
) {
    await redis.xAdd(
        "price_stream",
        "*",
        {
            market,
            price: price.toString(),
            timestamp: Date.now().toString()
        }
    )
}

async function handleTradeUpdate(message: any) {
    const { s, p } = message;

    const market = s.replace(/usdt$/i, "");
    
    const price = Math.floor(Number(p) * 100);
    const decimal = 2;
    
    for (const item of currentPrice) {
        if (item.market === market) {
            item.price = price;
            item.decimals = decimal
        }
    }

    pushToPriceStream(market, price).catch(err => {
        console.error("Failed to push to stream.", err)
    })
}

function connectWS() {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws");

    ws.on("open", () => {
        console.log("Connected to Binance")

        const requests = {
            method: "SUBSCRIBE",
            params: ["solusdt@trade", "btcusdt@trade", "ethusdt@trade"],
            id: 1
        }

        ws.send(JSON.stringify(requests))

    })

    ws.on("message", (data) => {
        try {
            const message = JSON.parse(data.toString());
            
            if (message.e === "trade") {
            handleTradeUpdate(message);
            }
        } catch (error) {
            console.error("Error parsing message: ", error)
        }
    })

    ws.on("error", (err) => {
        console.error("WebSocket error:", err);
    });

    ws.on("close", () => {
        console.log("Disconnected from Backpack. Trying to reconnect");
        setTimeout(connectWS, 3000)
    });
}

async function main() {
    await initRedis()
    publishCurrentPrice()
    connectWS()
}

main()