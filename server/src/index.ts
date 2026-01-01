import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cors from 'cors';
import { connectDB } from './database/database.db';
import authRoutes from './routes/auth.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});