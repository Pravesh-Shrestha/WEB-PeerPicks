"use server";

import { register, login, whoami, updateProfile,requestPasswordReset,resetPassword } from '../api/auth';
import { SignupData } from '../../app/(auth)/schema'; 
import { setAuthToken, setUserData } from '../cookie';
import { redirect } from 'next/navigation';
import { clearAuthCookies } from "../cookie";
import { revalidatePath } from 'next/cache';
/**
 * Handles the Registration Logic
 */
export const handleRegister = async (data: SignupData) => {
  try {
    const result = await register(data);

    /**
     * Backend signup returns: { message: "Registration successful", user: {...} }
     * (no `success` boolean). Normalize it for the UI.
     */
    const createdUser = result?.user ?? result?.data ?? null;
    const isCreated = Boolean(createdUser) || Boolean(result?.id);

    if (isCreated) {
      return {
        success: true,
        message: result?.message || "Registration successful",
        data: createdUser ?? result,
      };
    }

    return {
      success: false,
      message: result?.message || "Registration failed",
    };

  } catch (error: any) {
    console.error("Registration Server Error:", error);
    return { 
      success: false, 
      message: error.message || 'An unexpected error occurred' 
    };
  }
};

/**
 * Handles the Login Logic
 * Updated to handle the 'token' and 'user' response seen in logs
 */
export const handleLogin = async (data: { email: string; password: string }) => {
  console.log("--- Login Attempt Started ---");
  console.log("Login Payload:", { email: data.email, password: "[HIDDEN]" });

  try {
// auth-action.ts
const result = await login(data);

// FIX: Check for token since your backend doesn't send a 'success' boolean
if (result && result.token) { 
  await setAuthToken(result.token);
  const userData = result.user;
  await setUserData(userData);
  return { success: true, message: 'Login successful', data: userData };
}

    // Handle case where API responds but credentials might be wrong
    console.warn("Login Failed - No token provided in response");
    return {
      success: false,
      message: result?.message || 'Invalid email or password'
    };

  } catch (error: any) {
    console.error("--- Login Server Error ---");
    console.error("Error Details:", error.message);
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    };
  } finally {
    console.log("--- Login Process Finished ---");
  }
};

export const handleLogout = async () => {
  try {
    // 1. Clear auth cookies (Deletes auth_token and user_data)
    await clearAuthCookies();
    
    // Log for server-side debugging
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Logout Error:", error);
    // Even if cookie deletion fails, we typically still want to redirect
  }

  // 2. Redirect to login page 
  // (Must be called outside the try-catch block for Next.js internal reasons)
  redirect("/login");
};

export const handleWhoAmI = async () => {
  try {
    const response = await whoami();
    return response;
  } catch (error: any) {
    console.error("WhoAmI Server Error:", error);
    return { 
      success: false, 
      message: error.message || 'An unexpected error occurred' 
    };
  }
};


export const handleUpdateProfile = async (formData: any) => {
    try{
        const result = await updateProfile(formData);
        if(result.success){
            // update cookie data
            await setUserData(result.data);
            // optionally revalidate path(s)
            revalidatePath("/user/profile");
            return {
                success: true,
                message: "Profile updated successfully",
                data: result.data 
            };
        }
        return {
            success: false, message: result.message || "Failed to update profile"
        }
    }catch(err: Error | any){
        return { success: false, message: err.message || "Failed to update profile"};
    }
}

export const handleRequestPasswordReset = async (email: string) => {
    try {
        const response = await requestPasswordReset(email);
        if (response.success) {
            return {
                success: true,
                message: 'Password reset email sent successfully'
            }
        }
        return { success: false, message: response.message || 'Request password reset failed' }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Request password reset action failed' }
    }
};

export const handleResetPassword = async (token: string, newPassword: string) => {
    try {
        // FIX: Remove "token=" prefix and decode the URL string
        const cleanToken = decodeURIComponent(token).replace(/^token=/, '');
        
        const response = await resetPassword(cleanToken, newPassword);
        
        if (response.success) {
            return {
                success: true,
                message: 'Password has been reset successfully'
            }
        }
        
        return { 
            success: false, 
            message: response.message || 'Reset password failed' 
        }
    } catch (error: any) {
        return { 
            success: false, 
            message: error.message || 'Reset password action failed' 
        }
    }
};