import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin/admin.routes';
import blog from './routes/blog.route';
import adminBlogRouter from './routes/admin/blog.route';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import {ALLOWED_ORIGINS } from './config/index'; 
import e from 'express';

const app: Application = express();
// 2. BODY PARSERS (Must come BEFORE sanitization and routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. SECURITY & LOGGING
app.use(helmet()); // Basic security headers
app.use(morgan('dev')); // Request logging

// 4. CORS CONFIGURATION
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Mobile apps/Postman) or listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));

// 5. ROBUST SANITIZATION MIDDLEWARE
// Prevents NoSQL Injection and XSS without breaking Date/Number objects
app.use((req: Request, res: Response, next: NextFunction) => {
  const skipFields = ["email", "password", "profilePicture"];

  const sanitize = (obj: any): any => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const key in obj) {
        // Skip specific fields OR values that aren't strings (like Dates/Numbers)
        if (skipFields.includes(key) || typeof obj[key] !== "string") {
          continue;
        }

        let value = obj[key];
        // 1. Anti-NoSQL Injection (removes $)
        value = value.replace(/\$/g, ""); 
        
        // 2. Anti-XSS (removes < > tags) - Skip for emails
        if (!value.includes("@")) {
          value = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        
        obj[key] = value;
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  next();
});

// 6. GLOBAL RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// 7. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blog);
app.use('/api/admin/blogs', adminBlogRouter);
// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: "🚀 PeerPicks API is live" });
});



// 8. GLOBAL ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  console.error(`[Error] ${err.message}`);
  
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;