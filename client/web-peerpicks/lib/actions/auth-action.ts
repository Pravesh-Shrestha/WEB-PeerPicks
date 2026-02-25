"use server";

import { 
    register, 
    login, 
    whoami, 
    updateProfile, 
    requestPasswordReset, 
    resetPassword,
    adminGetAllUsers,
    adminUpdateUser,
    adminDeleteUser
} from '../api/auth';
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
    if (error.digest?.includes('NEXT_REDIRECT')) throw error;
    
    console.error(`${context} Error:`, error.response?.data?.message || error.message || error);
    return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'An unexpected error occurred' 
    };
};

/* --- AUTH ACTIONS --- */

export const handleRegister = async (data: SignupData) => {
    try {
        const result = await register(data);
        if (result.success) {
            return {
                success: true,
                message: result.message || "Registration successful",
                data: result.user ?? result.data ?? result,
            };
        }
        return result;
    } catch (error) {
        return serverActionError(error, "Registration");
    }
};

export const handleLogin = async (data: { email: string; password: string }) => {
    try {
        // 1. DELETE PROTOCOL: Clear stale signals before fresh handshake
        await clearAuthCookies();

        // 2. IDENTITY HANDSHAKE
        const result = await login(data);

        if (result.success && result.token) {
            const userData = result.user || result.data;
            
            // 3. COMMIT PERSISTENCE
            await setAuthToken(result.token);
            await setUserData(userData);

            // 4. CACHE REFRESH
            revalidatePath('/', 'layout');
            revalidatePath('/admin');
            revalidatePath('/dashboard');

            return { success: true, data: userData, token: result.token };
        } 
        return { 
            success: false, 
            message: result.message || "Invalid credentials provided." 
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

export const handleWhoAmI = async () => {
    try {
        const result = await whoami();
        if (result.success) {
            return { success: true, data: result.user || result.data || result };
        }
        return result;
    } catch (error: any) {
        return serverActionError(error, "WhoAmI");
    }
};

/* --- PROFILE ACTIONS --- */

export const handleUpdateProfile = async (formData: FormData) => {
    try {
        const result = await updateProfile(formData);
        if (result.success) {
            const userData = result.data || result.user;
            await setUserData(userData);
            revalidatePath("/", "layout");
            return { success: true, message: "Profile synchronized", data: userData };
        }
        return result;
    } catch (error) {
        return serverActionError(error, "UpdateProfile");
    }
};

/* --- ADMIN MANAGEMENT ACTIONS --- */

/**
 * FETCH_PEER_DIRECTORY: Get all users for the admin table
 */
export const handleAdminGetUsers = async () => {
    try {
        const result = await adminGetAllUsers();
        return result; // handleRequest already formatted this
    } catch (error) {
        return serverActionError(error, "AdminFetchUsers");
    }
};

/**
 * ADMIN_IDENTITY_UPDATE: Modify user from admin panel
 */
export const handleAdminUpdateUser = async (id: string, formData: FormData) => {
    try {
        const result = await adminUpdateUser(id, formData);
        if (result.success) {
            revalidatePath("/admin/users");
            return { success: true, message: "Identity updated by Root_Auth" };
        }
        return result;
    } catch (error) {
        return serverActionError(error, "AdminUpdateUser");
    }
};

/**
 * ADMIN_DELETE_PROTOCOL: [2026-02-01] Permanent removal of identity
 */
export const handleAdminDeleteUser = async (id: string) => {
    try {
        const result = await adminDeleteUser(id);
        if (result.success) {
            revalidatePath("/admin/users");
            return { success: true, message: "Identity deleted from registry" };
        }
        return result;
    } catch (error) {
        return serverActionError(error, "AdminDeleteUser");
    }
};

/* --- PASSWORD RECOVERY --- */

export const handleResetPassword = async (token: string, newPassword: string) => {
    try {
        const result = await resetPassword(token, newPassword);
        return result.success 
            ? { success: true, message: 'Password has been reset successfully' }
            : result;
    } catch (error) {
        return serverActionError(error, "ResetPassword");
    }
};

/**
 * FETCH_ADMIN_STATS: Aggregated data for the dashboard overview
 * Matches backend AdminController.getDashboardStats structure
 */
export const handleAdminGetStats = async () => {
    try {
        const result: any = await axiosInstance.get(API.ADMIN.STATS);
        
        // The backend returns { success: true, stats: {...}, recentActivity: [...] }
        // We return the whole object so the UI can access both stats and recentActivity
        if (result.success) {
            return {
                success: true,
                stats: result.stats,
                recentActivity: result.recentActivity
            };
        }
        
        return result;
    } catch (error) {
        return serverActionError(error, "AdminGetStats");
    }
};
/**
 * ADMIN_FETCH_SINGLE_IDENTITY: Retrieve a specific user by ID
 */
export const handleAdminGetUserById = async (id: string) => {
    try {
        // Using the same pattern as your other admin actions
        const result: any = await axiosInstance.get(`${API.ADMIN.USERS}/${id}`);
        
        if (result.success) {
            return { 
                success: true, 
                data: result.user || result.data || result 
            };
        }
        return result;
    } catch (error) {
        return serverActionError(error, "AdminFetchSingleUser");
    }
};