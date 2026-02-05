import "dotenv/config"
import { prismaClient as prisma } from "@repo/db/client";
import { RedisClient } from "./redis";
import { setLatestPrice } from "./state";
import { Asset, TradeType } from "@prisma/client"
import { executeMarketOrders } from "./marketExecution";
import { addLimitOrder, enqueueMarketOrder, removeLimitOrder } from "./orderBook";
import { executeLimitOrders } from "./limitExecution";


type RedisStreamMessage = {
    id: string,
    message: Record<string, string>
}

type RedisStream = {
    name: string,
    messages: RedisStreamMessage[]
}

const PRICE_CONSUMER = "engine_price_1";
const ORDER_CONSUMER = "engine_order_1";
const CONTROL_CONSUMER = "engine_control_1";

const PRICE_GROUP = "engine_price_group";
const ORDER_GROUP = "engine_order_group";
const ORDER_CONTROL_GROUP = "engine_control_group";

const PRICE_STREAM_KEY = "price_stream";
const ORDER_STREAM_KEY = "order_stream";
const ORDER_CONTROL_STREAM_KEY = "order_control_stream";

async function ensureGroup(redis: RedisClient, KEY: string, GROUP_NAME: string) {
    try {
        await redis.xGroupCreate(
            KEY,
            GROUP_NAME,
            "0",
            { MKSTREAM: true }
        )
    } catch (err: any) {
        if (!err.message.includes("BUSYGROUP")) {
            throw err;
        }
    }
}

export async function priceConsumer(redis: RedisClient) {
    await ensureGroup(redis, PRICE_STREAM_KEY, PRICE_GROUP)

    while (true) {
        const response = await redis.xReadGroup(
            PRICE_GROUP,
            PRICE_CONSUMER,
            [{ key: PRICE_STREAM_KEY, id: ">" }],
            { BLOCK: 50, COUNT: 100 }
        )

        if (!Array.isArray(response)) continue;

        for (const rawStream of response) {
            if (typeof rawStream !== "object" || rawStream === null) {
                continue
            }
            const stream = rawStream as RedisStream;

            for (const msg of stream.messages) {
                const { market, price } = msg.message;
                
                setLatestPrice(market as Asset, Number(price))
                await executeMarketOrders(market as Asset, Number(price), redis)
                await executeLimitOrders(market as Asset, Number(price), redis)

                await redis.xAck(
                    PRICE_STREAM_KEY,
                    PRICE_GROUP,
                    msg.id
                )
            }
        }
    }
}

export async function orderConsumer(redis:RedisClient) {
    await ensureGroup(redis,ORDER_STREAM_KEY, ORDER_GROUP)

    while (true) {
        const response = await redis.xReadGroup(
            ORDER_GROUP,
            ORDER_CONSUMER,
            [{ key: ORDER_STREAM_KEY, id: ">" }],
            { BLOCK: 5000, COUNT: 100 }
        )

        if (!Array.isArray(response)) continue;

        for (const rawStream of response) {
            if (typeof rawStream !== "object" || rawStream === null) {
                continue
            }
            const stream = rawStream as RedisStream;
            for (const msg of stream.messages) {
                const { orderId, userId, asset, side, orderType, limitPrice, margin, leverage, takeProfit, stopLoss } = msg.message;

                const safeOrderId = assertString(orderId, "orderId")

                await prisma.activeOrder.update({
                    where: { id: safeOrderId },
                    data: { state: "ACTIVE" }
                })

                const order = {
                    id: assertString(orderId, "orderId"),
                    userId: assertString(userId, "userId"),
                    asset: assertString(asset, "asset") as Asset,
                    side: assertString(side, "side") as TradeType,
                    orderType: assertString(orderType, "orderType") as "MARKET" | "LIMIT",

                    limitPrice: limitPrice ? Number(limitPrice) : undefined,
                    margin: Number(margin),
                    leverage: Number(leverage),
                    takeProfit: takeProfit ? Number(takeProfit) : undefined,
                    stopLoss: stopLoss ? Number(stopLoss) : undefined,
                };

                if(order.orderType === "MARKET"){
                    await enqueueMarketOrder(order.asset, order, redis)
                }else{
                    await addLimitOrder(order.asset, order.side, order, redis)
                }

                await redis.xAck(
                    ORDER_STREAM_KEY,
                    ORDER_GROUP,
                    msg.id
                )
            }
        }
    }
}

export async function orderControleConsumer(redis:RedisClient) {
    await ensureGroup(redis,ORDER_CONTROL_STREAM_KEY, ORDER_CONTROL_GROUP)

    while (true) {
        const response = await redis.xReadGroup(
            ORDER_CONTROL_GROUP,
            CONTROL_CONSUMER,
            [{ key: ORDER_CONTROL_STREAM_KEY, id: ">" }],
            { BLOCK: 5000, COUNT: 50 }
        )

        if (!Array.isArray(response)) continue;

        for (const rawStream of response) {
            if (typeof rawStream !== "object" || rawStream === null) {
                continue
            }
            const stream = rawStream as RedisStream;
            for (const msg of stream.messages) {
                const { type, orderId } = msg.message;

                if (type !== "CANCEL") {
                    await redis.xAck(ORDER_CONTROL_STREAM_KEY, ORDER_CONTROL_GROUP, msg.id)
                    continue;
                }

                const safeOrderId = assertString(orderId, "orderId");

                const order = await prisma.activeOrder.update({
                    where: { id: safeOrderId },
                    data: { state: "CANCELLED" }
                });


                const asset = order.asset as Asset;

                if(order.orderType === "LIMIT"){
                    await removeLimitOrder(asset, order.type, safeOrderId, redis)
                }else{
                    await redis.sAdd("cancelled_orders", safeOrderId)
                }

                await redis.xAck(
                    ORDER_CONTROL_STREAM_KEY,
                    ORDER_CONTROL_GROUP,
                    msg.id
                )
            }
        }
    }
}

function assertString(
    value: unknown,
    field: string
): string {
    if (typeof value !== "string") {
        throw new Error(`Invalid or missing ${field}`);
    }
    return value;
}
