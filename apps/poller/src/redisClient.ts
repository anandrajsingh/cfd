import { createClient } from "redis";

export const redisPub = createClient({
    url: "redis://localhost:6379"
})

export const redisStream = createClient({
    url : "redis://localhost:6379"
})

redisPub.on("error", (err) => console.error("Redis PubSub Client Error: ", err))

export async function initRedis(){
    if (!redisPub.isOpen){
        await redisPub.connect()
        console.log("Redis PubSub Connected")
    }
    if (!redisStream.isOpen){
        await redisStream.connect()
        console.log("Redis Stream Connected")
    }
}