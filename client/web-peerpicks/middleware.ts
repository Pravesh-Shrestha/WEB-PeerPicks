import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "./lib/cookie";

// Define restricted paths as specific prefixes
const PUBLIC_PATHS = ["/login", "/signup", "/register", "/forget-password"];
const PROTECTED_PATHS = ["/admin", "/user", "/dashboard", "/picks", "/update-profile"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. IDENTITY HANDSHAKE: Retrieve credentials from the cookie store
    const token = await getAuthToken();
    let user = null;

    if (token) {
        try {
            user = await getUserData();
        } catch (e) {
            console.error("Middleware Identity Sync Error:", e);
            // If data is corrupted, we treat the session as invalid
            user = null;
        }
    }

    // Determine the nature of the current path
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
    const isProtectedRoute = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

    // 2. LOGIC: Authenticated users should not see auth pages
    // If they have a token AND user data, redirect them based on their role
    if (token && user && isPublicPath) {
        const target = user.role === 'admin' ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(target, req.url));
    }

    // 3. LOGIC: Unauthenticated users blocked from protected routes
    // Note: If token exists but user data is missing (sync failure), we force a re-login
    if ((!token || !user) && isProtectedRoute) {
        const loginUrl = new URL("/login", req.url);
        // Add callback URL so they return here after successful login
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. RBAC: Role-Based Access Control
    if (user) {
        // [2026-02-01] Guard rails for Admin-only zones
        if (pathname.startsWith("/admin") && user.role !== 'admin') {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        
        // Guard rails for standard user zones
        const allowedRoles = ['user', 'admin'];
        if (pathname.startsWith("/user") && !allowedRoles.includes(user.role)) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
}

/**
 * OPTIMIZATION: Config Matcher
 * Only run the middleware on relevant paths to maximize performance.
 */
export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /static (static files like images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};