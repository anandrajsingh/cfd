import { Router } from "express";
import { sendMail } from "../mail";
import jwt, { JwtPayload } from "jsonwebtoken";
import authMiddleware, { AuthRequest } from "../middleware";

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
    const email = req.body.email;

    const token = jwt.sign({ email: email }, process.env.JWT_SECRET!)

    await sendMail(email, token);

    res.json({ success: "Check Your Mail" })
})

userRouter.post("/signin", (req, res) => {
    const body = req.query;

    const token = body.token as string

    const { email } = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    const authToken = jwt.sign({email}, process.env.JWT_SECRET!);
    res.cookie("token", authToken);
    res.json({success: "cookie sent"})
})

userRouter.post("/signout", authMiddleware, (req: AuthRequest, res) => {

})

userRouter.post("/user", authMiddleware, (req: AuthRequest, res) => {
    res.json({success: "User"})
})

userRouter.post("/user/balance", authMiddleware, (req, res) => {
    res.json({balance: 500000})
})