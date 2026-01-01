import dotenv from 'dotenv';
dotenv.config();
//can use env variables below this
console.log('PORT:',process.env.PORT);
//.env -> PORT=5050
//ensure PORT is a number and fallback if not found
//avoid exception if env variable is missing
export const PORT:number=process.env.PORT?parseInt(process.env.PORT):5000;
export const MONGO_URI:string=process.env.MONGO_URI||'mongodb://localhost:27017/defaultdb';
export const JWT_SECRET:string=process.env.JWT_SECRET || 'defaultsecret';