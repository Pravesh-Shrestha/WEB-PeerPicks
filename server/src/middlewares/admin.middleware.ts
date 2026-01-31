import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import { IUser } from '../models/user.model';
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";

const userRepository = new UserRepository();

// 1. Global Augmentation: This makes 'user' available on the standard Request type
// across your entire project, preventing "property does not exist" errors.
declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser; 
        }
    }
}

/**
 * PROTECT: Verifies JWT, finds the user in DB, and attaches to Request
 */
export async function protect(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError(401, "Authorization header missing or malformed");
        }

        const token = authHeader.split(" ")[1];
        if (!token) throw new HttpError(401, "Token missing");

        // Verify token and cast to expected payload
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        if (!decoded || !decoded.id) throw new HttpError(401, "Invalid token structure");

        // Fetch fresh user data from Repository
        const user = await userRepository.getUserById(decoded.id);
        if (!user) throw new HttpError(401, "Session expired or user not found");

        // Attach user to request for use in subsequent middleware/controllers
        req.user = user as IUser;
        return next();
    } catch (err: any) {
        return res.status(401).json({
            success: false,
            message: err.name === "JsonWebTokenError" ? "Invalid Token" : err.message || "Unauthorized",
        });
    }
}

/**
 * IS_ADMIN: Guards routes based on the 'role' field
 */
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        // 'protect' must run before this to populate req.user
        if (!req.user) {
            throw new HttpError(401, "Authentication required");
        }

        if (req.user.role !== 'admin') {
            throw new HttpError(403, "Access denied: Admin privileges required");
        }

        return next();
    } catch (err: any) {
        return res.status(err.statusCode || 403).json({
            success: false,
            message: err.message || "Forbidden",
        });
    }
}