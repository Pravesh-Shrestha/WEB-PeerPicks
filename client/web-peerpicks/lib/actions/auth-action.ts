/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { register } from '../api/auth';
import {login} from '../api/auth';
import { SignupData } from '../../app/(auth)/schema'; // Import your type for better safety


export const handleRegister = async (data: SignupData) => {
  try {
    const result = await register(data);

    if (result && result.success) {
      return { 
        success: true, 
        message: 'Registration successful', 
        data: result.data 
      };
    }

    return { 
      success: false, 
      message: result?.message || 'Registration failed' 
    };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Registration Server Error:", error);
    return { 
      success: false, 
      message: error.message || 'An unexpected error occurred' 
    };
  }
};


export const handleLogin= async (data: {email: string; password: string}) => {
    try{
        const result= await login(data);

        if(result && result.success){
            return {
                success: true,
                message: 'Login successful',
                data: result.data
            }
        }
        return {
            success: false,
            message: result?.message || 'Login failed'
        }
    }
    catch(error: any){
        console.error("Login Server Error:", error);
        return {
            success: false,
            message: error.message || 'An unexpected error occurred'
        }
    }
}