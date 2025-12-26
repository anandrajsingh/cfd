import WebSocket from "ws"
import { initRedis, redis } from "./redisClient";

const currentPrice = [
    { market: "BTC_USDC", price: 0, decimals: 0 },
    { market: "SOL_USDC", price: 0, decimals: 0 },
    { market: "ETH_USDC", price: 0, decimals: 0 },
]

function publishCurrentPrice() {
    setInterval(async() => {
        await redis.publish("price_updates", JSON.stringify(currentPrice))
    },1000)
}

async function pushToPriceStream(
    market:string,
    price: number,
){
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
    const { s, p } = message.data;

    const market = s.split("_")[0]

    const price = Math.floor(Number(p) * 100);
    const decimal = 2;

    for(const item of currentPrice){
        if(item.market === s){
            item.price = price;
            item.decimals = decimal
        }
    }

    pushToPriceStream(market, price).catch(err => {
        console.error("Failed to push to stream.", err)
    })
}

function connectWS(){
        const ws = new WebSocket("wss://ws.backpack.exchange/");

    ws.on("open", () => {
        console.log("Connected to Backpack")

        ws.send(
            JSON.stringify({
                "method": "SUBSCRIBE",
                "params": ["trade.SOL_USDC"],
                "id": 1
            })
        )
        ws.send(
            JSON.stringify({
                "method": "SUBSCRIBE",
                "params": ["trade.BTC_USDC"],
                "id": 2
            })
        )
        ws.send(
            JSON.stringify({
                "method": "SUBSCRIBE",
                "params": ["trade.ETH_USDC"],
                "id": 3
            })
        )
    })

    ws.on("message", (data) => {
        try {
            const message = JSON.parse(data.toString());

            if (message.stream.startsWith("trade.")) {
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