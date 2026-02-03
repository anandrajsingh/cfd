import { Router } from "express";
import authMiddleware, { AuthRequest } from "../middleware";
import { prismaClient as prisma } from "@repo/db/client";
import { redis } from "../redis";

export const tradeRouter = Router()

const Assets = ["BTC", "SOL", "ETH"];
const POSITION_SIZE_SCALE = 1_000_000;

tradeRouter.post("/create", authMiddleware, async (req: AuthRequest, res) => {
    const { asset, type, margin, leverage, takeProfit, stopLoss } = req.body;
    const userId = req.user.userId;

    if (!Assets.includes(asset) || !(type === "LONG" || type === "SHORT")) {
        return res.status(400).json({ error: "Please send correct parameters." })
    }

    if (typeof leverage !== "number" || typeof margin !== "number" || 1 > leverage || leverage > 10 || margin < 100) {
        return res.status(400).json({ error: "Incorrect leverage or margin." })
    }

    // let entryPrice = 10_00;  // To do: fetch price from websocket backend.

    // const realPositionSize = (margin * leverage) / entryPrice;
    // const positionSize = Math.floor(realPositionSize * POSITION_SIZE_SCALE)
    // const liquidationPrice = Math.floor(
    //     type === "LONG"
    //         ? entryPrice * (1 - 1 / leverage)
    //         : entryPrice * (1 + 1 / leverage)
    // );

    try {

        const order = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { balance: true }
            })
            if (!user || !user.balance) throw new Error("USER_NOT_FOUND");
            if (margin > user.balance) throw new Error("INSUFFICIENT_BALANCE");

            await tx.user.update({
                where: { id: userId },
                data: {
                    balance: { decrement: margin }
                }
            })

            return tx.activeOrder.create({
                data: {
                    userId,
                    asset,
                    type,
                    margin,
                    leverage,
                    orderType: "MARKET",
                    takeProfit,
                    stopLoss,
                    state: "CREATED"
                }
            })
        })
        await redis.xAdd("order_stream", "*", {
            orderId: order.id,
            userId,
            asset,
            side: type,
            orderType: "MARKET",
            margin: margin.toString(),
            leverage: leverage.toString(),
            takeProfit: takeProfit?.toString() ?? "",
            stopLoss: stopLoss?.toString() ?? "",
        });
        return res.status(201).json({
            orderId: order.id,
            status: "Order created"
        })
    } catch (err: any) {
        if (err.message === "INSUFFICIENT_BALANCE") {
            return res.status(400).json({ error: "Insufficient balance" })
        } else if (err.message === "USER_NOT_FOUND") {
            return res.status(400).json({ error: "User not found" });
        }
        return res.status(400).json({ error: "Something went wrong." })
    }
})

tradeRouter.post("/close", authMiddleware, async (req: AuthRequest, res) => {
    const { positionId } = req.body
    const userId = req.user.userId;

    if (!positionId) return res.status(400).json({ error: "Position Id is required." })

    const position = await prisma.position.findFirst({
        where: {
            id: positionId,
            userId
        }
    })
    if (!position) return res.status(400).json({ error: "Position not found." })

    const exitPrice = 11_00 //To do, fetch price from websocket.

    const realPositionSize = position.positionSize / POSITION_SIZE_SCALE;

    const pnl = Math.floor(position.type === "LONG" ?
        (exitPrice - position.entryPrice) * realPositionSize : (position.entryPrice - exitPrice) * realPositionSize
    )

    const closePosition = await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: {
                balance: {
                    increment: position.margin + pnl
                }
            }
        })
        const closedPositionId = await tx.closedPosition.create({
            data: {
                userId,
                asset: position.asset,
                type: position.type,
                margin: position.margin,
                leverage: position.leverage,
                entryPrice: position.entryPrice,
                exitPrice,
                positionSize: position.positionSize,
                realizedPnl: pnl,
                openedAt: position.openedAt,
            }
        })

        await tx.position.delete({
            where: {
                id: positionId
            }
        })

        return closedPositionId;
    })

    res.status(200).json({ success: "Order closed", pnl, closePosition })

})

tradeRouter.get("/positions/open", authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
        where: { id: userId },
    })
    if (!user) return res.status(400).json({ error: "User not found." })
    try {
        const openPositions = await prisma.position.findMany({
            where: { userId },
            orderBy: { openedAt: "desc" }
        })

        return res.status(200).json(openPositions)
    } catch (err: any) {
        return res.status(500).json({ error: "Something went wrong." })
    }
})

tradeRouter.get("/positions/closed", authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })
    if (!user) return res.status(400).json({ error: "User not found." })
    try {
        const closedPositions = await prisma.closedPosition.findMany({
            where: { userId },
            orderBy: { openedAt: "desc" }
        })
        return res.status(200).json(closedPositions)
    } catch (err) {
        return res.status(500).json({ error: "Something went wrong." })
    }
})