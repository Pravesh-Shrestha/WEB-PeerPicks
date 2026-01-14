//API layer
//call api from backedn

import axios from './axios'; //"Important: "./axios" not "axios"
import { API_ENDPOINTS } from './endpoints';

export const register= async (registerData: any) => {
    try{
        const response = await axios.post(API_ENDPOINTS.REGISTER, registerData);
        return response.data;
    }
    catch(err: Error | any){
        throw new Error(err.response?.data?.message || err.message || 'Registration failed');
    }
}