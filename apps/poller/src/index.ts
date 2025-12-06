import WebSocket from "ws"
import { initRedis, redis } from "./redisClient";

async function main() {

    await initRedis()
    const ws = new WebSocket("wss://ws.backpack.exchange/");

    ws.on("open", () => {
        console.log("Connected to WebSocket")

        ws.send(
            JSON.stringify({
                "method": "SUBSCRIBE",
                "params": ["trade.SOL_USDC"],
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
        console.log("Disconnected from WebSocket");
    });

}
async function handleTradeUpdate(data: any) {
    const { s, p } = data.data;

    const asset = s.split("_")[0];
    const price = Math.floor(Number(p) * 100);
    const decimal = 2;

    const payload = {
        price_updates: [
            { asset, price, decimal }
        ]
    }
    await redis.publish("price_updates", JSON.stringify(payload))
}

main()