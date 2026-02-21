"use client";

import { useRouter } from "next/navigation";
import { clearAuthCookies } from "@/lib/cookie";

export const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    // 1. Clear Storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // 2. Clear Cookies
    clearAuthCookies();

    // 3. Redirect & Refresh
    router.push("/login");
    router.refresh(); 
  };

  return logout;
};