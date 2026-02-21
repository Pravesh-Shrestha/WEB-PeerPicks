import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "./lib/cookie";

const publicPaths = ["/login", "/signup", "/register", "/forget-password"];
const authRestrictedPaths = ["/admin", "/user", "/dashboard", "/picks", "/update-profile"];

// NEXT.JS REQUIREMENT: Function must be named 'middleware'
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Get Token - The source of truth
    const token = await getAuthToken();
    
    // 2. Fetch user data if token exists
    let user = null;
    if (token) {
        try {
            user = await getUserData();
        } catch (e) {
            // Corrupted or expired data
            user = null;
        }
    }

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    const isProtectedRoute = authRestrictedPaths.some((path) => pathname.startsWith(path));

    // LOGIC: If authenticated, prevent access to login/signup
    if (token && user && isPublicPath) {
        const target = user.role === 'admin' ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(target, req.url));
    }

    // LOGIC: If unauthenticated (no token or user failed to load), block protected routes
    if ((!token || !user) && isProtectedRoute) {
        const loginUrl = new URL("/login", req.url);
        // Protocol: Add callback URL so they return here after login
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Role-Based Access Control (RBAC)
    if (user) {
        // Prevent non-admins from entering /admin
        if (pathname.startsWith("/admin") && user.role !== 'admin') {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        
        // Prevent access to /user if they don't have a valid role
        if (pathname.startsWith("/user") && !['user', 'admin'].includes(user.role)) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
}

// Optimization: Explicitly define matchers to keep middleware lean
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admin/:path*",
        "/user/:path*",
        "/update-profile/:path*",
        "/picks/:path*",
        "/login",
        "/signup",
        "/register",
        "/forget-password",
    ]
};