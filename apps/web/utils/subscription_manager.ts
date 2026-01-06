import { Trade } from "./constant";

const url = "ws://localhost:8180";

type TradeCallback = (trade: Trade) => void;

export class SignalingManager {
    private ws: WebSocket;
    private static instance: SignalingManager;

    private bufferedMessage: Record<string, unknown>[] = []
    private initialized = false;

    private callbacks: Record<string, TradeCallback[]> = {};

    private subCount: Record<string, number> = {};

    private constructor() {
        this.ws = new WebSocket(url)
        this.init()
    }

    private send(msg: Record<string, unknown>){
        if(!this.initialized){
            this.bufferedMessage.push(msg)
            return;
        }
        this.ws.send(JSON.stringify(msg))
    }

    public watch(asset:string, callback: TradeCallback): () => void{
        this.callbacks[asset] = this.callbacks[asset] || [];
        this.callbacks[asset].push(callback);
        
        const prev = this.subCount[asset] ?? 0;
        this.subCount[asset] = prev + 1;
        
        if(prev === 0){
            this.send({message: "SUBSCRIBE", asset})
        }

        return () => {
            this.unwatch(asset,callback)
        }
    }

    public unwatch(asset: string, callback: TradeCallback){
        const list = this.callbacks[asset];
        if(!list) return;

        this.callbacks[asset] = list.filter((cb) => cb !== callback);

        if(this.callbacks[asset].length === 0){
            delete this.callbacks[asset];
        }

        const curr = this.subCount[asset] ?? 0;

        if(curr <= 1){
            delete this.subCount[asset]
            this.send({message: "UNSUBSCRIBE", asset})
        }else {
            this.subCount[asset] = curr - 1;
        }
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new SignalingManager();
        }
        return this.instance;
    }

    private init() {
        this.ws.onopen = () => {
            this.initialized = true;

            Object.keys(this.subCount).forEach((asset) => {
                this.ws.send(JSON.stringify({ message: "SUBSCRIBE", asset }))
            })

            this.bufferedMessage.forEach((msg) => {
                this.ws.send(JSON.stringify(msg))
            })
            this.bufferedMessage = []
            console.log("WebSocket connection established.")
        }

        this.ws.onmessage = (msg) => {
            const raw = msg.data;
            const parsedMsg = JSON.parse(raw);

            const asset = parsedMsg.asset
            parsedMsg.forEach((trade:any) => {
                const asset = trade.asset
                
                const callbacks = this.callbacks[asset]
                if(!callbacks) return;

                callbacks.slice().forEach((cb) => cb(trade))
            })
        }

        this.ws.onerror = (err) => {
            console.error("Websocket error: ", err)
        }

        this.ws.onclose = () => {
            console.warn("Websocket closed, reconnecting...")
            this.initialized = false;

            setTimeout(() => {
                this.ws = new WebSocket(url);
                this.init();
            }, 2000);
        }
    }

    public getActiveSubscriptions(){
        return {
            callbacks: Object.keys(this.callbacks),
            subCounts: { ...this.subCount}
        }
    }
}