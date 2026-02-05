import { createClient } from "redis";

export const redis = createClient({
    url : process.env.REDIS_URL || "redis://localhost:6379"
})


export function createRedisClient() {
  const client = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  });

  client.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  return client;
}

export type RedisClient = ReturnType<typeof createRedisClient>;