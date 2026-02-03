import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

export async function initRedis() {
  redis.on("error", (err) => {
    console.error("Redis error:", err);
  });

  if (!redis.isOpen) {
    await redis.connect();
    console.log("Redis connected");
  }
}
