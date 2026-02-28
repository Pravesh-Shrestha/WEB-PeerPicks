import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import { IUser } from '../models/user.model';
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";

const userRepository = new UserRepository();

// Global Augmentation to prevent TS errors in controllers
declare global {
    namespace Express {
        interface Request {
            user?: IUser; 
        }
    }
}

/**
 * PROTECT: Verifies JWT and attaches User to Request
 */
export async function protect(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError(401, "Authorization header missing or malformed");
        }

        const token = authHeader.split(" ")[1];
        if (!token) throw new HttpError(401, "Token missing");

        // Verify token - Checking for both 'id' and '_id' for compatibility
        const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; _id?: string };
        const userId = decoded._id || decoded.id;

        if (!userId) throw new HttpError(401, "Invalid token structure: No ID found");

        // Fetch fresh user data
        const user = await userRepository.getUserById(userId);
        if (!user) throw new HttpError(401, "Session expired or user not found");

        // Attach user to request
        req.user = user as IUser;
        return next();
    } catch (err: any) {
        let message = err.message || "Unauthorized";
        if (err.name === "TokenExpiredError") message = "Token expired. Please login again.";
        if (err.name === "JsonWebTokenError") message = "Invalid security token.";

        return res.status(401).json({
            success: false,
            message: message,
        });
    }
}

/**
 * IS_ADMIN: Guards routes based on the 'role' field
 */
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        // Validation: Protect must be called before isAdmin in the route file
        if (!req.user) {
            throw new HttpError(401, "Authentication required");
        }

        // Using casting to ensure TS recognizes the role property on IUser
        const user = req.user as IUser;

        if (user.role !== 'admin') {
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