import { orderConsumer, orderControleConsumer, priceConsumer } from "./consumer"
import { connectRedis } from "./redis"

async function startEngine(){
    await connectRedis()
    
    priceConsumer()
    orderConsumer()
    orderControleConsumer()

    console.log("Engine Started!")
}

startEngine()