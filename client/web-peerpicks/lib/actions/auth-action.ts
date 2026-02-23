"use server";

import { register, login, whoami, updateProfile, requestPasswordReset, resetPassword } from '../api/auth';
import { SignupData } from '../../app/(auth)/schema'; 
import { setAuthToken, setUserData, clearAuthCookies } from '../cookie';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { API } from '../api/endpoints';
import axiosInstance from '../api/axios';

/**
 * Shared error utility for Server Actions
 */
const serverActionError = (error: any, context: string) => {
    // If it's a redirect error, re-throw it so Next.js can handle it
    if (error.digest?.includes('NEXT_REDIRECT')) throw error;
    
    console.error(`${context} Error:`, error.response?.data?.message || error.message || error);
    return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'An unexpected error occurred' 
    };
};
export const handleRegister = async (data: SignupData) => {
    try {
        const result = await register(data);
        const createdUser = result?.user ?? result?.data ?? null;

        if (createdUser || result?.id) {
            return {
                success: true,
                message: result?.message || "Registration successful",
                data: createdUser ?? result,
            };
        }
        return { success: false, message: result?.message || "Registration failed" };
    } catch (error) {
        return serverActionError(error, "Registration");
    }
};

export const handleLogin = async (data: { email: string; password: string }) => {
  let isSuccessful = false;
  let authData = null;

  try {
    // 1. DELETE PROTOCOL: Clear stale signals before fresh handshake
    await clearAuthCookies();

    // 2. IDENTITY HANDSHAKE: Request session from backend
    const result = await login(data);

    if (result?.token && (result?.user || result?.data)) {
      const userData = result.user || result.data;
      
      // 3. COMMIT PERSISTENCE: Set server-side cookies
      await setAuthToken(result.token);
      await setUserData(userData);

      // Store data to return to the client-side context
      authData = {
        user: userData,
        token: result.token
      };
      
      isSuccessful = true;
    } else {
      return { 
        success: false, 
        message: result?.message || "Invalid credentials provided." 
      };
    }
  } catch (error: any) {
    // If it's a redirect error from Next.js, let it bubble up
    if (error.digest?.includes('NEXT_REDIRECT')) throw error;
    
    console.error("LOGIN_EXECUTION_ERROR:", error.message);
    return { success: false, message: error.message || "Login failed" };
  }

  if (isSuccessful) {
    // 4. CACHE PURGE: Invalidate stale dashboard layouts
    revalidatePath('/', 'layout');
    revalidatePath('/dashboard');

    // 5. RETURN SIGNAL: Send data back to AuthContext for instant UI sync
    // We don't redirect here if we want the Client Component to handle it after loginSync
    return { success: true, data: authData?.user, token: authData?.token };
  }
};

export const handleLogout = async () => {
    try {
        await clearAuthCookies();
    } catch (error) {
        console.error("Logout Cookie Error:", error);
    }
    redirect("/login");
};

/**
 * Used for fetching the logged-in user's state to compare 
 * against profile owners for the "Edit/Delete" visibility.
 */
export const handleWhoAmI = async () => {
    try {
        const res: any = await axiosInstance.get(API.AUTH.WHOAMI);
        // If your controller returns { user: {...} }, grab res.user
        // If it returns the user directly, just use res
        const userData = res.user || res; 
        
        return { success: true, data: userData };
    } catch (error: any) {
        console.error(`[AUTH_SYNC_FAILURE]: 404 at ${error.config?.url}`); 
        return { success: false, message: "Endpoint not found" };
    }
};

export const handleUpdateProfile = async (formData: any) => {
    try {
        const result = await updateProfile(formData);
        if (result.success) {
            await setUserData(result.data);
            // Revalidate the profile path so the new image/name shows up immediately
            revalidatePath("user/profile");
            return { success: true, message: "Profile updated successfully", data: result.data };
        }
        return { success: false, message: result.message || "Update failed" };
    } catch (error) {
        return serverActionError(error, "UpdateProfile");
    }
};

export const handleResetPassword = async (token: string, newPassword: string) => {
    try {
        const cleanToken = decodeURIComponent(token).replace(/^token=/, '');
        const response = await resetPassword(cleanToken, newPassword);
        
        return response.success 
            ? { success: true, message: 'Password has been reset successfully' }
            : { success: false, message: response.message || 'Reset password failed' };
    } catch (error) {
        return serverActionError(error, "ResetPassword");
    }
};

