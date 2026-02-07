import { Asset, TradeType } from "@prisma/client"
import { Order } from "./state";
import { RedisClient } from "./redis";
import { prismaClient } from "@repo/db/client";

export async function enqueueMarketOrder(
    asset: Asset,
    order: Order,
    redis: RedisClient
){
    await redis.rPush(`market:${asset}`, JSON.stringify(order))
}

export async function dequeueMarketOrder(
    asset: Asset,
    redis: RedisClient
){
    const raw = await redis.lPop(`market:${asset}`)
    if(!raw) return null;
    return JSON.parse(raw)
}

export async function loadActiveOrders(redis: RedisClient){
  const orders = await prismaClient.activeOrder.findMany({
    where: {state: "ACTIVE"}
  })

  for (const order of orders){
    if (order.orderType === "MARKET"){
      await enqueueMarketOrder(
        order.asset as Asset,
        {
          id: order.id,
          userId: order.userId,
          asset: order.asset as Asset,
          side: order.type as TradeType,
          orderType: "MARKET",
          margin: order.margin,
          leverage: order.leverage,
          takeProfit: order.takeProfit ?? undefined,
          stopLoss: order.stopLoss ?? undefined
        },
        redis
      )
    }else{
      await addLimitOrder(
        order.asset as Asset,
        order.type as TradeType,
        {
          id: order.id,
          userId: order.userId,
          asset: order.asset as Asset,
          side: order.type as TradeType,
          orderType: "LIMIT",
          limitPrice: order.limitPrice!,
          margin: order.margin,
          leverage: order.leverage,
          takeProfit: order.takeProfit ?? undefined,
          stopLoss: order.stopLoss ?? undefined
        },
        redis
      )
    }
    
  }
}

export async function addLimitOrder(
  asset: Asset,
  side: TradeType,
  order: Order,
  redis: RedisClient
) {
  const key =
    side === TradeType.LONG
      ? `limit:long:${asset}`
      : `limit:short:${asset}`

  const score = side === TradeType.LONG ? order.limitPrice! : -order.limitPrice!;

  await redis.set(
    `order:${order.id}`,
    JSON.stringify(order)
  )

  await redis.zAdd(key, {
    score,
    value: order.id
  })
}

export async function removeLimitOrder(
  asset: Asset,
  side: TradeType,
  orderId: string,
  redis: RedisClient
) {
  const key =
    side === TradeType.LONG
      ? `limit:long:${asset}`
      : `limit:short:${asset}`

  await redis.zRem(key, orderId)
  await redis.del(`order:${orderId}`)
}

export async function withAssetLock<T>(
  asset: Asset,
  fn: () => Promise<T>,
  redis: RedisClient
): Promise<T | null> {
  const lockKey = `lock:market:${asset}`

  const acquired = await redis.set(lockKey, "1", {
    NX: true,
    PX: 3000
  })

  if (!acquired) return null

  try {
    return await fn()
  } finally {
    await redis.del(lockKey)
  }
}