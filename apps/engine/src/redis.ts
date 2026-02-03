import { createClient } from "redis";
import { prismaClient as prisma } from "@repo/db/client";

export const redis = createClient({
    url : process.env.REDIS_URL || "redis://localhost:6379"
})

export async function connectRedis(){
    if (!redis.isOpen){
        await redis.connect()
        console.log("Connected to Redis")
    }

    redis.on("error", (err) => {
        console.error("Redis error: ", err)
    })
}