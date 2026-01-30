import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "./lib/cookie";

// 1. Define your path groups clearly
const publicPaths = ["/login", "/signup", "/register", "/forget-password",];
const authRestrictedPaths = ["/admin", "/user", "/dashboard"]; // Pages requiring login

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 2. Get Auth State
    const token = await getAuthToken();
    const user = token ? await getUserData() : null;

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    const isProtectedRoute = authRestrictedPaths.some((path) => pathname.startsWith(path));

    // 3. LOGIC: If NOT logged in and trying to access protected areas
    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // 4. LOGIC: If logged in and trying to access public auth pages (Login/Signup)
    if (user && isPublicPath) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 5. ROLE-BASED ACCESS
    if (user) {
        // Protect Admin routes
        if (pathname.startsWith("/admin") && user.role !== 'admin') {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        
        // Protect User routes (Admins usually allowed, others not)
        if (pathname.startsWith("/user") && user.role !== 'user' && user.role !== 'admin') {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
}

// 6. Updated Matcher: Include EVERYTHING that needs checking
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/dashboard/:path*",
        "/admin/:path*",
        "/user/:path*",
        "/update-profile/:path*",
        "/login",
        "/signup",
        "/register",
        "/forget-password",
    ]
}