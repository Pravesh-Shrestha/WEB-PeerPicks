import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import { IUser } from '../models/user.model';
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";

// Avoid creating a new instance inside the function; keep it outside for performance
const userRepository = new UserRepository();

declare global {
    namespace Express {
        interface Request {
            /** * Attaching the full user object to the request.
             * This allows pick.controller to use (req.user as any)._id
             */
            user?: IUser; 
        }
    }
}

export async function authorizedMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        // Check header OR check cookies (requires cookie-parser on express)
        const token = authHeader?.startsWith("Bearer ") 
            ? authHeader.split(" ")[1] 
            : req.cookies?.auth_token;

        if (!token) {
            throw new HttpError(401, "No authorization token provided");
        }

        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;

        if (!decoded.id && !decoded._id && !decoded.sub) {
            throw new HttpError(401, "Invalid token payload: No user identifier found");
        }

        const userId = decoded.id || decoded._id || decoded.sub;
        // 4. Validate user exists in DB
        const user = await userRepository.getUserById(userId.toString());
        if (!user) {
            throw new HttpError(401, "User no longer exists");
        }

        // 5. Attach user to request for use in controllers/services
        req.user = user;
        
        return next();

    } catch (err: any) {
        // Handling token expiration specifically
        let message = "Unauthorized";
        if (err.name === "TokenExpiredError") message = "Token has expired. Please login again.";
        if (err.name === "JsonWebTokenError") message = "Invalid or Malformed Token";

        return res.status(401).json({
            success: false,
            message: message,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}