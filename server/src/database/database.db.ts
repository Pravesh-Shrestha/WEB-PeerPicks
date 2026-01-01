import mongoose from 'mongoose';
import { MONGO_URI } from '../config/index';

export const connectDB=async()=>{
    try{
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
    }catch(error){
        console.error('MongoDB connection error:',error);
        process.exit(1); //exit process with failure
    }
};