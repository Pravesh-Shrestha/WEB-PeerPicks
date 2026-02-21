import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin/admin.routes';
import pickRoutes from './routes/pick.route';
import blog from './routes/blog.route';
import adminBlogRouter from './routes/admin/blog.route';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import {ALLOWED_ORIGINS } from './config/index'; 
import socialRoutes from './routes/social.route';
import notificationRoutes from './routes/notification.route';
import mapRoutes from './routes/map.route';
import e from 'express';

const app: Application = express();

app.set('trust proxy', 1);
// 2. BODY PARSERS (Must come BEFORE sanitization and routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. SECURITY & LOGGING
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
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
    res.set("Access-Control-Allow-Origin", "*"); // Allow 3004 to access 3000
  }
}));

// 5. ROBUST SANITIZATION MIDDLEWARE
// Prevents NoSQL Injection and XSS without breaking Date/Number objects
// 5. DEEP SANITIZATION MIDDLEWARE
// Inside your Deep Sanitization Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const skipFields = ["email", "password", "profilePicture", "images"];

  const sanitize = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(item => sanitize(item));

    if (obj && typeof obj === "object" && !(obj instanceof Date)) {
      const sanitizedObj: any = {};
      for (const key in obj) {
        if (skipFields.includes(key)) {
          sanitizedObj[key] = obj[key];
          continue;
        }

        // --- NEW LOGIC FOR PICK DATA ---
        // If the value is a string that looks like JSON (placeInfo/reviewInfo)
        if (typeof obj[key] === "string" && (obj[key].startsWith('{') || obj[key].startsWith('['))) {
            try {
                const parsed = JSON.parse(obj[key]);
                sanitizedObj[key] = JSON.stringify(sanitize(parsed)); // Sanitize the object then re-string
                continue;
            } catch (e) {
                // Not actually JSON, continue to normal string sanitization
            }
        }

        if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitizedObj[key] = sanitize(obj[key]);
        } 
        else if (typeof obj[key] === "string") {
          let value = obj[key];
          value = value.replace(/\$/g, ""); // Anti-NoSQL
          // Allow URLs/Links (don't escape < > in links/images)
          if (!value.includes("@") && !value.startsWith("http")) {
            value = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          }
          sanitizedObj[key] = value;
        } else {
          sanitizedObj[key] = obj[key];
        }
      }
      return sanitizedObj;
    }
    return obj;
  };

  if (req.body && Object.keys(req.body).length > 0) {
    req.body = sanitize(req.body);
  }
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
app.use('/api/picks', pickRoutes);
app.use('/api/social', socialRoutes); // Consolidated Interactions
app.use('/api/notifications', notificationRoutes); 
app.use('/api/map', mapRoutes);
                



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