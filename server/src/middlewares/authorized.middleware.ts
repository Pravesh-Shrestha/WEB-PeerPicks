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

        // 1. Check for presence of Bearer Token
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError(401, "Authorization header missing or malformed");
        }

        const token = authHeader.split(" ")[1];
        if (!token) throw new HttpError(401, "Token missing");

        // 2. Verify Token
        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;

        // 3. THE FIX: Match your JWT payload key. 
        // If your login uses { _id: user._id }, then use decoded._id here.
        const userId = decoded.id || decoded._id || decoded.sub; 

        if (!userId) {
            throw new HttpError(401, "Invalid token payload: No user identifier found");
        }

        // 4. Validate user exists in DB
        const user = await userRepository.getUserById(userId);
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