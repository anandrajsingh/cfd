import { createClient } from "redis";
import { WebSocket, WebSocketServer} from "ws"


async function main() {
    const subscriber = createClient({ url: "redis://localhost:6379" })
    await subscriber.connect();
    subscriber.on("error", (err) => console.error("Redis error:", err));

    const wss = new WebSocketServer({port: 8180});
    let userWS: WebSocket[] = []

    wss.on("connection", function(ws, req) {
        console.log("User Connected")

        ws.on("message", (data) => {
            try {
                const parsedData = JSON.parse(data as unknown as string)
                if(parsedData.message === "SUBSCRIBE"){
                    userWS.push(ws)
                }else if(parsedData.message === "UNSUBSCRIBE"){
                    userWS = userWS.filter((i) => {
                        return i !== ws;
                    })
                }
            } catch (err) {
                console.error(err)
            }
        })

        ws.on("close", () => {
            userWS = userWS.filter((i) => {
                return i !== ws;
            })
        })
    })

    await subscriber.subscribe("price_updates", (message) => {
        try {
            userWS.forEach((client) => {
                if(client.readyState === WebSocket.OPEN){
                    client.send(message)
                }
            })
        } catch (err) {
            console.error(err)
        }
    });

    subscriber.on("end", () => {
        console.warn("Redis connection closed. Retrying....")
        setTimeout(() => subscriber.connect(), 1000)
    })
}

main()