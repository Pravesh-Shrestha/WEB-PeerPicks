//server side processing for authentication actions
"user server";

import { da } from 'zod/locales';
import {register} from '../api/auth';

export const handleRegister = async (formData: any) => {
    try {
        const result = await register(formData);
        if(result.success){
            return { success: true, message: 'Registration successful',data: result.data };
        } return { success: false, message: result.message || 'Registration failed' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Registration failed' };
    }
};