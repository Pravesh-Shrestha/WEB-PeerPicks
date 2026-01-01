import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './database/database.db';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));