import { prismaClient as prisma } from "@repo/db/client";
import { RedisClient } from "./redis";
import { getLatestPrice } from "./state";

const POSITION_SIZE_SCALE = 1_000_000;

export async function executeClosePosition(
    userId: string,
    positionId: string,
    redis: RedisClient
) {
    const position = await prisma.position.findFirst({
        where: {
            id: positionId,
            userId
        }
    })
    if (!position) return

    const price = getLatestPrice(position.asset)
    if(!price) return

    const realPositionSize = position.positionSize / POSITION_SIZE_SCALE;
    
    const pnl = Math.floor(position.type === "LONG" ?
        (price - position.entryPrice) * realPositionSize : (position.entryPrice - price) * realPositionSize
    )
    console.log(pnl)

    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where : { id: userId},
            data: {
                balance: {increment: position.margin + pnl}
            }
        })
        await tx.closedPosition.create({
            data : {
                userId,
                asset: position.asset,
                type: position.type,
                margin: position.margin,
                leverage: position.leverage,
                entryPrice: position.entryPrice,
                exitPrice: price,
                positionSize: position.positionSize,
                realizedPnl: pnl,
                openedAt: position.openedAt
            }
        })

        await tx.position.delete({
            where: {id: positionId}
        })
    })
}