"use server";
import { cookies } from "next/headers";

/**
 * Standardized cookie options to ensure consistency across the protocol.
 * Using path: "/" is CRITICAL to prevent "ID bleeding" between different routes.
 */
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
};

export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({ 
        name: "auth_token", 
        value: token, 
        ...cookieOptions 
    });
}

export const getAuthToken = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value || null;
}

export const setUserData = async (userData: any) => {
    const cookieStore = await cookies();
    // Ensure we don't stringify 'undefined'
    if (!userData) return;
    
    cookieStore.set({ 
        name: "user_data", 
        value: JSON.stringify(userData), 
        ...cookieOptions,
        httpOnly: false // Allow AuthContext to read this on the client if needed
    });
}

export const getUserData = async () => {
    const cookieStore = await cookies();
    const userDataStr = cookieStore.get("user_data")?.value;
    
    if (userDataStr) {
        try {
            return JSON.parse(userDataStr);
        } catch (error) {
            console.error("Failed to parse user data protocol:", error);
            return null;
        }
    }
    return null;
}

/**
 * Standardized DELETE protocol for clearing sessions.
 */
export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    // Explicitly delete by targeting the root path
    cookieStore.delete({ name: "auth_token", path: "/" });
    cookieStore.delete({ name: "user_data", path: "/" });
}