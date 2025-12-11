import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

export const tradeRouter = Router()

tradeRouter.post("/trade/create", (req, res) => {
    const { asset, type, margin, leverage, slippage } = req.body

    const orderId = uuidv4()

    res.json({orderId})
})

tradeRouter.post("/trade/close", (req, res) => {
    const { orderId } = req.body()

    res.json({success: "Order closed"})

})