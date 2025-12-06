import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid";
import { sendMail } from "./mail";
import dotenv from "dotenv";
dotenv.config()
const router = Router()

router.post("/signup", async (req, res) => {
    const email = req.body.email;

    const token = jwt.sign({ email: email }, process.env.JWT_SECRET!)

    await sendMail(email, token);

    res.json({ success: "Check Your Mail" })
})

router.post("/signin/post", (req, res) => {
    const body = req.query;

    const token = body.token as string

    const { email } = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    const authToken = jwt.sign({email}, process.env.JWT_SECRET!);
    res.cookie("token", authToken);
    res.json({success: "cookie sent"})
})

router.post("/trade/create", (req, res) => {
    const { asset, type, margin, leverage, slippage } = req.body

    const orderId = uuidv4()

    res.json({orderId})
})

router.post("/trade/close", (req, res) => {
    const { orderId } = req.body()

    res.json({success: "Order closed"})

})

router.get("/balance/usd", (req, res) => {
    res.json({balance: 500000})
})

router.get("/balance", (req, res) => {
    
})

router.get("/supportedAssets", (req, res) => {

})

export default router;