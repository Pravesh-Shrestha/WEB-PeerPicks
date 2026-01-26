import { Request,Response,NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import{IUser} from '../models/user.model';
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { th } from "zod/v4/locales";

let userRepository=new UserRepository();
declare global{
    namespace Express{
        interface Request{
            user?:Record<string,any>| IUser;
        }
    }
}
//creating a tag for user
//can use req.user in other files

export async function authorizedMiddleware(req:Request,res:Response,next:NextFunction){
//     //express function can have next function to go next
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer '))//"Bearer <token" 0 -> Bearer 1-> token
            throw new HttpError(401,'Authorization header missing or malformed');
        const token=authHeader.split(' ')[1];
        if(!token)
            throw new HttpError(401,'Token missing');
        const decoded=jwt.verify(token,JWT_SECRET) as Record<string,any>;//decoded -> payload
        if(!decoded || !decoded.id)
            throw new HttpError(401,'Invalid token');
        const user= await userRepository.getUserById(decoded.id);//make async if needed
        if(!user)
            throw new HttpError(401,'User not found');
        req.user=user;
        return next();
    }
    catch(err){
        console.log(err)
        return res.status(401).json({message:'Unauthorized'});
    }
            
//     if(req.headers&& req.headers.authorization){
//         next();
//     }
//     else{
//         return res.status(401).json({message:'Unauthorized'});
//     }
}