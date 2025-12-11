import express from "express";
import cors from "cors"
import { userRouter } from "./routes/authRouter";
import { tradeRouter } from "./routes/tradeRouter";
import { candleRouter } from "./routes/candleRouter";
import { assetRouter } from "./routes/assetRouter";

const app = express();
app.use(express.json())
app.use(cors())

const port = 3000;

app.get("/", (req, res) => {
    res.send("Helloooooooooooooo")
})
app.use("/api/v1", userRouter)
app.use("/api/v1/trade", tradeRouter)
app.use("/api/v1/candle", candleRouter)
app.use("/api/v1/asset", assetRouter)

app.listen(port);