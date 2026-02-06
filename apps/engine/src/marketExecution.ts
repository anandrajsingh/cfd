import { Asset, TradeType } from "@prisma/client"
import { Order } from "./state"
import { prismaClient as prisma } from "@repo/db/client";
import { dequeueMarketOrder } from "./orderBook";
import { RedisClient } from "./redis";

const POSITION_SIZE_SCALE = 1_000_000;

export async function executeMarketOrders(
    asset: Asset,
    price: number,
    redis: RedisClient
) {
    while (true) {
        const order = await dequeueMarketOrder(asset, redis)
        if(!order) break
        await executeSingleMarketOrder(order, price, redis)
    }
}

async function executeSingleMarketOrder(
    order: Order,
    price: number,
    redis: RedisClient
) {
    const isCanceled = await redis.sIsMember("cancelled_orders", order.id)
    if(isCanceled) return
    
    await prisma.$transaction(async (tx) => {

        const existing = await tx.activeOrder.findUnique({
            where: { id: order.id }
        });
        if (!existing) return;

        const size = (order.margin * order.leverage) / price;
        const positionSize = Math.floor(size * POSITION_SIZE_SCALE)

        let liquidationPrice;

        if (order.side === TradeType.LONG) {
            liquidationPrice = price - price / order.leverage
        } else {
            liquidationPrice = price + price / order.leverage
        }

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
                stopLoss: order.stopLoss,
            },
        });

        await tx.activeOrder.delete({
            where: { id: order.id }
        })
    })
}