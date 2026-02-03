import "dotenv/config"
import express from "express";
import cors from "cors"
import { userRouter } from "./routes/authRouter";
import { tradeRouter } from "./routes/tradeRouter";
import { candleRouter } from "./routes/candleRouter";
import { assetRouter } from "./routes/assetRouter";
import { initRedis, redis } from "./redis";
import  cookieParser  from 'cookie-parser'

const app = express();
app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}))
app.use(cookieParser())

const port = 3001;

async function startServer() {
    try {
        await initRedis()

        app.use("/api/v1", userRouter)
        app.use("/api/v1/trade", tradeRouter)
        app.use("/api/v1/candle", candleRouter)
        app.use("/api/v1/asset", assetRouter)

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        });
    } catch (err) {
        console.error("Failed to start server:", err)
    }
}

process.on("SIGINT", async () => {
    console.log("Shutting Down...");
    if(redis.isOpen) await redis.quit()
    process.exit(0)
})

startServer()