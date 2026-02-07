import { prismaClient as prisma } from "@repo/db/client";
import { Order } from "./state";
import { Asset, TradeType } from "@prisma/client"
import { redis, RedisClient } from "./redis";

const POSITION_SIZE_SCALE = 1_000_000;

export async function executeLimitOrders(
    asset: Asset,
    price: number,
    redis: RedisClient
) {
    await executeSide(asset, TradeType.LONG, price, redis)
    await executeSide(asset, TradeType.SHORT, price, redis)
}

async function executeSide(
    asset: Asset,
    side: TradeType,
    price: number,
    redis: RedisClient
) {
    const key = side === TradeType.LONG
        ? `limit:long:${asset}` : `limit:short:${asset}`

    const scorePrice = side === TradeType.LONG ? price : -price;

    while (true) {
        const candidates = await redis.zRange(
            key,
            "-inf",
            scorePrice,
            {
                BY: "SCORE",
                LIMIT: { offset: 0, count: 1 }
            }
        );

        if (candidates.length === 0) break
        const orderId = candidates[0]
        if (!orderId) continue

        const isCanceled = await redis.sIsMember(
            "cancelled_orders",
            orderId
        )
        if (isCanceled) {
            await redis.zRem(key, orderId)
            await redis.del(`order:${orderId}`)
            continue
        }

        const raw = await redis.get(`order:${orderId}`)
        if (!raw) {
            await redis.zRem(key, orderId)
            continue
        }

        const order = JSON.parse(raw) as Order

        if (
            (side === TradeType.LONG && price < order.limitPrice!) ||
            (side === TradeType.SHORT && price > order.limitPrice!)
        ) {
            break
        }

        await executeSingleLimitOrder(order, price)

        await redis.zRem(key, orderId)
        await redis.del(`order:${orderId}`)
    }
}

async function executeSingleLimitOrder(
    order: Order,
    price: number,
) {
    await prisma.$transaction(async (tx) => {
        const existing = await tx.activeOrder.findUnique({
            where: { id: order.id }
        })
        if (!existing) return

        const positionSize = Math.floor(((order.margin * order.leverage) / price)*POSITION_SIZE_SCALE)

        const liquidationPrice = order.side === TradeType.LONG
            ? price - price / order.leverage : price + price / order.leverage

        await tx.position.create({
            data: {
                userId: order.userId,
                asset: order.asset,
                type: order.side,
                margin: order.margin,
                leverage: order.leverage,
                entryPrice: Number(price),
                positionSize: Number(positionSize),
                liquidationPrice: Number(liquidationPrice),
                takeProfit: order.takeProfit,
                stopLoss: order.stopLoss
            }
        })

        await tx.activeOrder.delete({
            where: { id: order.id }
        })
    })
}