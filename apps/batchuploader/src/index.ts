import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });

async function initRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect()
            console.log("Redis Connected.")
        }
    } catch (err) {
        console.log("Error connecting Redis", err)
    }
}

async function getRedisData(){

}

async function main() {
    initRedis()
    getRedisData()
}

main()

process.on("SIGINT", async () => {
    console.log("Shutting Down...")
    await redisClient.quit()
    process.exit(0)
})