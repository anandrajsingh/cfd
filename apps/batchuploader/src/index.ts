import { createClient } from "redis";

const redisClient = createClient({ url: "redis://localhost:6379" });

const STREAM_KEY = "price_stream";
const GROUP_NAME = "price_uploaders";
const CONSUMER_NAME = "worker-1";

type RedisStreamMessage = {
    id: string;
    message: Record<string, string>;
};

type RedisStream = {
    name: string;
    messages: RedisStreamMessage[];
};


async function initRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect()
            console.log("Redis Connected.")
        }
    } catch (err) {
        console.log("Error connecting Redis", err)
    }
}

async function ensureConsumerGroup(){
    try {
        await redisClient.xGroupCreate(
            STREAM_KEY, GROUP_NAME, "$", {MKSTREAM: true}
        )
        console.log("Consumer group created.")
    } catch (err: any) {
        if(err?.message?.includes("BUSYGROUP")){
            console.log("Consumer group already exists.")
        }else{
            throw err;
        }
    }
}

async function getRedisData(){
    await ensureConsumerGroup();
    while(true){
        const response = await redisClient.xReadGroup(
            GROUP_NAME,
            CONSUMER_NAME,
            [{key: STREAM_KEY, id: ">"}],
            {BLOCK:5000, COUNT:100}
        )

        if(!Array.isArray(response)) continue;

        for(const rawStream of response){
            if(typeof rawStream !== "object" || rawStream === null ){
                continue;
            }
            const stream = rawStream as RedisStream
            for(const msg of stream.messages){
                const { market, price, decimals, timestamp } = msg.message
                console.log("Recieved price", {market, price, decimals, timestamp})
                
                await redisClient.xAck(STREAM_KEY, GROUP_NAME, msg.id)
            }
        }
    }
}

async function main() {
    await initRedis()
    await getRedisData()
}

main()

process.on("SIGINT", async () => {
    console.log("Shutting Down...")
    await redisClient.quit()
    process.exit(0)
})