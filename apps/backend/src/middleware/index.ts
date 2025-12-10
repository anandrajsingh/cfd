import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
    user?: any
}

export default function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"]

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token!, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}