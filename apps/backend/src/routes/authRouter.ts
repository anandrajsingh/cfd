import { Router } from "express";
// import { sendMail } from "../mail";
import jwt, { JwtPayload } from "jsonwebtoken";
import authMiddleware, { AuthRequest } from "../middleware";
import bcrypt from "bcrypt"
import { prismaClient } from "@repo/db/client";

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
    const {name, email, password } = req.body;
    try {
        if (!name || !email || !password) return res.status(400).json({ error: "Email and Password both are required." })

        const passwordhash = await bcrypt.hash(password, 12)
        const user = await prismaClient.user.create({
            data: {
                email,
                password: passwordhash
            }
        })
        const token = jwt.sign({ email, userId: user.id }, process.env.JWT_SECRET!)
        // await sendMail(email, token);

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 365 * 24 * 60 * 60 * 1000
        })
        res.json({ success: true, message: "User Created Successfully"})
    } catch (err: any) {
        if (err.code === "P2002") {
            return res.status(409).json({ error: "User already exists" })
        } else {
            return res.status(500).json({ error: "Something went wrong." })
        }
    }
})

userRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and Password both are required." })

    try {
        const user = await prismaClient.user.findUnique({
            where: { email }
        })

        if (!user) return res.status(401).json({ error: "Invalid email or password." })

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password" })

        const authToken = jwt.sign({ email, userId: user.id }, process.env.JWT_SECRET!);

        res.cookie("auth_token", authToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 365 * 24 * 60 * 60 * 1000
        })
        res.json({ success: true })
    } catch (error) {

    }
})

userRouter.post("/signout", authMiddleware, (req: AuthRequest, res) => {
    const userId = req.user.id;
    res.clearCookie("auth_token");
    return res.json({ message: `Signed Out ${userId}`})
})

userRouter.post("/user", authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.user.id;
    try {
        const user = await prismaClient.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                balance: true,
            }
        })
        if (!user) return res.status(400).json({ error: "User not found." })
        res.json({ success: "User", user })
    } catch (error) {

    }
})

userRouter.post("/user/balance", authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.user.id;
    try {
        const user = await prismaClient.user.findFirst({
            where: {
                id: userId
            }
        })
        return res.json({ balance: user?.balance })
    } catch (error) {
        return res.status(400).json({ error: "Something went wrong" })
    }
})