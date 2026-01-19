import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const NODE_ENV: string = process.env.NODE_ENV || 'development';
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Database URI - prioritizing your local URI from .env
export const MONGO_URI: string = process.env.LOCAL_DATABASE_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/peerpicks_db';

// Auth Settings
export const JWT_SECRET: string = process.env.JWT_SECRET || 'merosecretkey12345';
export const JWT_EXPIRE: string = process.env.JWT_EXPIRE || '30d';
export const JWT_COOKIE_EXPIRE: number = process.env.JWT_COOKIE_EXPIRE ? parseInt(process.env.JWT_COOKIE_EXPIRE) : 30;

// File Upload Settings
export const FILE_UPLOAD_PATH: string = process.env.FILE_UPLOAD_PATH || './public/uploads';
export const MAX_FILE_UPLOAD: number = process.env.MAX_FILE_UPLOAD ? parseInt(process.env.MAX_FILE_UPLOAD) : 1000000;

// CORS Origins
export const ALLOWED_ORIGINS: string[] = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3004","http://192.168.137.1:3000",'http://10.0.2.2:3000'];