import { Request, Response, NextFunction } from 'express';

// Extend the Express Request type to include the user object
// Usually, your Auth middleware attaches this data
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Check if user exists (was the auth middleware successful?)
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: No user session found." 
    });
  }

  // 2. Check if the role is 'admin'
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Forbidden: Admin privileges required to access this resource." 
    });
  }

  // 3. User is admin, proceed to the controller
  next();
};