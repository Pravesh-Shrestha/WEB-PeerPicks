import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import { IUser } from '../models/user.model';
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";

const userRepository = new UserRepository();

declare global {
    namespace Express {
        interface Request {
            user?: IUser; 
        }
    }
}

export async function authorizedMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        
        // 1. Identity Extraction: Prioritize Bearer, fallback to Cookie signal
        const token = authHeader?.startsWith("Bearer ") 
            ? authHeader.split(" ")[1] 
            : req.cookies?.auth_token || req.query?.token;

        if (!token || token === "null" || token === "undefined") {
            throw new HttpError(401, "Identity missing: No authorization signal found");
        }

        // 2. Token Verification
        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;

        const userId = decoded.id || decoded._id || decoded.sub;
        if (!userId) {
            throw new HttpError(401, "Invalid signal payload: No identifier found");
        }

        // 3. Database Sync: Verify user hasn't been DELETED [2026-02-01]
        // VETERAN MOVE: Using .lean() in the repository makes this lookup much lighter
        const user = await userRepository.getUserById(userId.toString());
        
        if (!user) {
            throw new HttpError(401, "Handshake failed: User account no longer exists");
        }

        // 4. Identity Attachment
        req.user = user;
        
        return next();

    } catch (err: any) {
        // [2026-02-01] Protocol: Standardize error signals for Next.js Axios interceptors
        let message = "Unauthorized Access Attempt";
        
        if (err.name === "TokenExpiredError") {
            message = "Session expired. Please re-authenticate.";
        } else if (err.name === "JsonWebTokenError") {
            message = "Identity signal corrupted or malformed.";
        } else if (err instanceof HttpError) {
            message = err.message;
        }

        return res.status(401).json({
            success: false,
            message: message,
            // Only expose internal stack trace in development
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}