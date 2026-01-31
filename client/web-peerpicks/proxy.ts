import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "./lib/cookie";

const publicPaths = ["/login", "/signup", "/register", "/forget-password"];
const authRestrictedPaths = ["/admin", "/user", "/dashboard"];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = await getAuthToken();
    const user = token ? await getUserData() : null;

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    const isProtectedRoute = authRestrictedPaths.some((path) => pathname.startsWith(path));

    // 1. If NOT logged in and trying to access protected areas
    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. If logged in and trying to access public auth pages
    // Redirects Admin to /admin and Users to /dashboard
    if (user && isPublicPath) {
        const target = user.role === 'admin' ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(target, req.url));
    }

    // 3. Role-Based Access Control
    if (user) {
        // Protect Admin routes
        if (pathname.startsWith("/admin") && user.role !== 'admin') {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        
        // Protect User routes (Admins are allowed to visit /user profiles)
        if (pathname.startsWith("/user") && user.role !== 'user' && user.role !== 'admin') {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admin/:path*",
        "/user/:path*",
        "/update-profile/:path*",
        "/login",
        "/signup",
        "/register",
        "/forget-password",
    ]
};