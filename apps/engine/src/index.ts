import { createClient } from "redis";

async function main() {
    const subscriber = createClient({ url: "redis://localhost:6379" })
    subscriber.on("error", (err) => console.error("Redis error:", err));

    await subscriber.connect();


    await subscriber.subscribe("price_updates", (message) => {
        console.log("📩 Got message:", message);
    });
}

main()