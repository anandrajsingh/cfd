import WebSocket from "ws"
import { initRedis, redisPub, redisStream } from "./redisClient";

const currentPrice = [
    { asset: "BTC", askPrice: 0, bidPrice: 0, decimals: 0 },
    { asset: "SOL", askPrice: 0, bidPrice: 0, decimals: 0 },
    { asset: "ETH", askPrice: 0, bidPrice: 0, decimals: 0 },
]

let hasInitialPrice = false;

function publishCurrentPrice() {
    setInterval(async () => {
        if(!hasInitialPrice) return
        await redisPub.publish("price_updates", JSON.stringify(currentPrice))
        for (const item of currentPrice) {
            pushToPriceStream(item.asset, item.bidPrice).catch(err => {
                console.error("Failed to push to stream.", err)
            })
        }
    }, 200)
}

async function pushToPriceStream(
    market: string,
    price: number,
) {
    await redisStream.xAdd(
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
    const askPrice = Math.floor(price + (price * 0.002));
    const bidPrice = price
    const decimal = 2;

    for (const item of currentPrice) {
        if (item.asset === market) {
            item.askPrice = askPrice;
            item.bidPrice = bidPrice
            item.decimals = decimal
            hasInitialPrice = true;
        }
    }


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