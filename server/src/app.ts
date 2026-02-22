import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import compression from 'compression'; // NEW: Added for professional performance
import { ALLOWED_ORIGINS } from './config/index'; 

// Route Imports
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin/admin.routes';
import pickRoutes from './routes/pick.route';
import blog from './routes/blog.route';
import adminBlogRouter from './routes/admin/blog.route';
import socialRoutes from './routes/social.route';
import notificationRoutes from './routes/notification.route';
import mapRoutes from './routes/map.route';

const app: Application = express();

// 1. PROXY & COMPRESSION
app.set('trust proxy', 1);

// Professional Move: Compress all responses EXCEPT SSE streams
app.use(compression({
  filter: (req, res) => {
    if (req.headers['accept'] === 'text/event-stream') return false; // Don't buffer notifications
    return compression.filter(req, res);
  }
}));

// 2. BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. SECURITY & LOGGING
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Set to false if you're hitting many external Map APIs
}));
app.use(morgan('dev'));

// 4. CORS CONFIGURATION
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS_PROTOCOL_VIOLATION'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// 5. STATIC STORAGE (Onyx & Lime Aesthetic)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.set("Access-Control-Allow-Origin", "*"); 
  }
}));

// 6. DEEP SANITIZATION MIDDLEWARE
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip SSE stream from body sanitization check
  if (req.path === '/api/notifications/stream') return next();

  const skipFields = ["email", "password", "profilePicture", "images", "mediaUrls"];

  const sanitize = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(item => sanitize(item));
    if (obj && typeof obj === "object" && !(obj instanceof Date)) {
      const sanitizedObj: any = {};
      for (const key in obj) {
        if (skipFields.includes(key)) {
          sanitizedObj[key] = obj[key];
          continue;
        }

        // --- JSON STRING SANITIZATION (For Picks/Reviews) ---
        if (typeof obj[key] === "string" && (obj[key].startsWith('{') || obj[key].startsWith('['))) {
          try {
            const parsed = JSON.parse(obj[key]);
            sanitizedObj[key] = JSON.stringify(sanitize(parsed));
            continue;
          } catch (e) { /* Fall through to normal string check */ }
        }

        if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitizedObj[key] = sanitize(obj[key]);
        } else if (typeof obj[key] === "string") {
          let value = obj[key].replace(/\$/g, ""); // Anti-NoSQL Injection
          if (!value.includes("@") && !value.startsWith("http")) {
            value = value.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Basic XSS
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

// 7. RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  skip: (req) => req.path === '/api/notifications/stream', // Don't limit the stream connection
  message: { success: false, message: "RATE_LIMIT_EXCEEDED" }
});
app.use('/api/', limiter);

// 8. ROUTE REGISTRATION
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blog);
app.use('/api/admin/blogs', adminBlogRouter);
app.use('/api/picks', pickRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/api/map', mapRoutes);

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: "🚀 PeerPicks Protocol Active" });
});

// 9. GLOBAL ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  console.error(`[SYSTEM_ERROR]: ${err.message}`);
  
  res.status(status).json({
    success: false,
    message: err.message || "INTERNAL_NODE_FAILURE",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;