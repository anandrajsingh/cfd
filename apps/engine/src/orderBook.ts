import { Asset, TradeType } from "@prisma/client"
import { Order } from "./state";
import { redis } from "./redis";

export async function enqueueMarketOrder(
    asset: Asset,
    order: Order
){
    await redis.rPush(`market:${asset}`, JSON.stringify(order))
}

export async function dequeueMarketOrder(
    asset: Asset
){
    const raw = await redis.lPop(`market:${asset}`)
    if(!raw) return null;
    return JSON.parse(raw)
}


export async function addLimitOrder(
  asset: Asset,
  side: TradeType,
  order: Order
) {
  const key =
    side === TradeType.LONG
      ? `limit:long:${asset}`
      : `limit:short:${asset}`


  await redis.set(
    `order:${order.id}`,
    JSON.stringify(order)
  )

  await redis.zAdd(key, {
    score: order.limitPrice!,
    value: JSON.stringify(order)
  })
}

export async function removeLimitOrder(
  asset: Asset,
  side: TradeType,
  orderId: string
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
  fn: () => Promise<T>
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