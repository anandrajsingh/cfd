import { Asset, TradeType } from "@prisma/client"
import { marketOrderByAsset, Order, Position, positionsByAsset } from "./state"
import { prismaClient as prisma } from "@repo/db/client";

export async function executeMarketOrders(
    asset: Asset,
    price: number
) {
    const queue = marketOrderByAsset.get(asset)
    if (!queue || queue.length === 0) return;

    while (queue.length > 0) {
        const order = queue.shift()!;
        await executeSingleMarketOrder(order, price)
    }
}

async function executeSingleMarketOrder(
    order: Order,
    price: number
) {
    await prisma.$transaction(async (tx) => {

        const existing = await tx.activeOrder.findUnique({
            where: { id: order.id }
        });
        if (!existing) return;

        const positionSize = Math.floor((order.margin * order.leverage) / price);

        let liquidationPrice;

        if (order.side === TradeType.LONG) {
            liquidationPrice = price - price / order.leverage
        } else {
            liquidationPrice = price + price / order.leverage
        }

        const position = await tx.position.create({
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

        const set = positionsByAsset.get(order.asset) ?? new Set<Position>()

        set.add({
            id: position.id,
            userId: position.userId,
            asset: position.asset,
            side: position.type,
            entryPrice: price,
            positionSize,
            liquidationPrice,
            takeProfit: order.takeProfit,
            stopLoss: order.stopLoss,
        });

        positionsByAsset.set(order.asset, set);
    })
}