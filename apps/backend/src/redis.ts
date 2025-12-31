import { createClient, RedisClientType } from "redis";

export const redisProducer = createClient({url: "redis://localhost:6379"})
export const redisConsumer = createClient({url: "redis://localhost:6379"})

export async function initRedis() {
  redisProducer.on("error", (err) => {
    console.error("Redis error:", err);
  });

  await redisProducer.connect();
  console.log("Redis connected");

  redisConsumer.on("error", (err) => {
    console.error("Redis error:", err)
  });

  await redisConsumer.connect();
  console.log("Redis Consumer connected.")
}

export async function getEngineResponse(id:string){
    while(true){
        try {
            const res = await redisConsumer.xRead({
                key: "return-stream",
                id: "$"
            },{
                BLOCK:0,
                COUNT:1
            })
            
        } catch (error) {
            
        }
    }
}

export class RedisConsumer {
    private client: RedisClientType;

    constructor(){
        this.client = createClient();
        this.client.connect();
        this.waitForMessage()
    }

    async waitForMessage(){

    }
}