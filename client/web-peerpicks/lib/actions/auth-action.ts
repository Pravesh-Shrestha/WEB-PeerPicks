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
    console.error(`${context} Error:`, error.message || error);
    return { 
        success: false, 
        message: error.message || 'An unexpected error occurred' 
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
  try {
    await clearAuthCookies();
    const result = await login(data);

    // If the backend returns the token directly without a 'success' boolean,
    // we verify the presence of the token/user.
    const token = result?.token;
    const userData = result?.user || result?.data;

    if (token && userData) {
      await setAuthToken(token);
      await setUserData(userData);

      return { success: true, data: userData };
    }

    return { 
      success: false, 
      message: result?.message || "Invalid Signal Credentials" 
    };
  } catch (error: any) {
    return serverActionError(error, "Login");
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
        const response = await axiosInstance.get(API.AUTH.WHOAMI);
        return { success: true, data: response.data };
    } catch (error: any) {
        // Log the exact URL being hit to help debugging
        console.error(`WhoAmI 404 at: ${error.config?.url}`); 
        return { success: false, message: "Endpoint not found" };
    }
};

export const handleUpdateProfile = async (formData: any) => {
    try {
        const result = await updateProfile(formData);
        if (result.success) {
            await setUserData(result.data);
            // Revalidate the profile path so the new image/name shows up immediately
            revalidatePath("/profile/[id]", "page"); 
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

