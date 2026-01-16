"use server";
import { cookies } from "next/headers";

export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({ name: "auth_token", value: token })
}
export const getAuthToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    return token;
}
export const setUserData = async (userData: any) => {
    const cookieStore = await cookies();
    // cookie can only store string values
    // convert object to string -> JSON.stringify
    cookieStore.set({ name: "user_data", value: JSON.stringify(userData) })
}
export const getUserData = async () => {
    const cookieStore = await cookies();
    const userDataStr = cookieStore.get("user_data")?.value;
    // convert string back to object -> JSON.parse
    if(userDataStr){
        return JSON.parse(userDataStr);
    }
    return null;
}

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("user_data");
}