import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config(); 
import { connectDB } from './database/database.db';
import authRoutes from './routes/auth.routes';
import express,{Application,Request,Response} from 'express';

const app: Application = express();

let corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3001"], 
}
//frontend urls

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Database
connectDB();

app.get('/',(req:Request,res:Response)=>{
    res.send('Hello, World!');
});
// API Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});