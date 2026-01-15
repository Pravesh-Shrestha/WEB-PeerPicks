// src/index.ts
import express, { Application } from 'express';
import cors from 'cors';
import { connectDB } from './database/database.db';
import authRoutes from './routes/auth.routes';

const app: Application = express();

// 1. Database connection
connectDB();

// 2. CORS: Allow both Web and Mobile origins
const allowedOrigins = [
  "http://localhost:3000", // Web Local
  "http://localhost:3001", // Web Alternative
    "http://192.168.137.1:3000", // Mobile Emulator/WebView
  // Add mobile device IPs if testing on physical devices
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow mobile apps (no origin) or specific web origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// 3. API Routes
app.use('/api/auth', authRoutes);

// 4. Bind to 0.0.0.0 to be reachable by Flutter/Mobile on the same network
const PORT = process.env.PORT || 5000;
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});