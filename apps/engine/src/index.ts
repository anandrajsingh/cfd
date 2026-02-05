import { orderConsumer, orderControleConsumer, priceConsumer } from "./consumer"
import { createRedisClient } from "./redis"

async function startEngine() {
    const priceRedis = createRedisClient()
    const orderRedis = createRedisClient()
    const controlRedis = createRedisClient()

    await Promise.all([
        priceRedis.connect(),
        orderRedis.connect(),
        controlRedis.connect(),
    ])

    await Promise.all([
        priceConsumer(priceRedis),
        orderConsumer(orderRedis),
        orderControleConsumer(controlRedis),
    ])

    console.log("Engine Started!")
}

startEngine()