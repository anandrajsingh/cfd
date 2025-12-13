import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import authMiddleware, { AuthRequest } from "../middleware";
import { prismaClient as prisma } from "@repo/db/client";

export const tradeRouter = Router()

const Assets = ["BTC", "SOL", "ETH"];

tradeRouter.post("/create", authMiddleware, async (req: AuthRequest, res) => {
    const { asset, type, margin, leverage, takeProfit, stopLoss } = req.body;
    const userId = req.user.id;

    if (!Assets.includes(asset) || !(type === "LONG" || type === "SHORT")) {
        return res.status(400).json({ error: "Please send correct parameters." })
    }

    if ((1 < leverage && leverage < 10) || margin < 1 || typeof leverage !== "number" || typeof margin !== "number") {
        return res.status(400).json({ error: "Incorrect leverage or margin." })
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            balance: true
        }
    })
    if (!user || !user.balance) return res.status(400).json({ error: "User Not found." })

    const userbalance = user.balance;
    if (margin > userbalance) return res.status(400).json({ error: "Insufficient balance." })

    let entryPrice = 10;  // To do: fetch price from websocket backend.

    const positionSize = (margin * leverage) / entryPrice;
    const liquidationPrice =
        type === "LONG"
            ? entryPrice * (1 - 1 / leverage)
            : entryPrice * (1 + 1 / leverage);

    const position = await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: {id: userId},
            data: {
                balance:{
                    decrement: margin
                }
            }
        })

        return tx.position.create({
            data: {
                userId,
                asset,
                type,
                margin,
                leverage,
                entryPrice,
                positionSize,
                liquidationPrice,
                takeProfit,
                stopLoss
            }
        })
    })
    
    return res.status(201).json({
        positionId: position.id,
        entryPrice,
        liquidationPrice,
        positionSize
    })
})

tradeRouter.post("/close", authMiddleware, (req: AuthRequest, res) => {
    const { orderId } = req.body()

    res.json({ success: "Order closed" })

})