import { Router } from "express";
import authMiddleware, { AuthRequest } from "../middleware";
import { prismaClient as prisma } from "@repo/db/client";

export const assetRouter = Router();

assetRouter.get("/balance", authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.user.userId;
    try {
        const user = await prisma.user.findUnique({
            where: {id:userId},
            select: { balance: true }
        })

        if (!user || !user.balance) throw new Error("User Not Found");
        return res.status(201).json({ user })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: "User not found" });
    }
})