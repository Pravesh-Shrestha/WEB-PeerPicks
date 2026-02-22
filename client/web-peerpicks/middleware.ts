import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "./lib/cookie";

const publicPaths = ["/login", "/signup", "/register", "/forget-password"];
const authRestrictedPaths = ["/admin", "/user", "/dashboard", "/picks", "/update-profile"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    
    // 1. Get Token from cookies
    const token = await getAuthToken();
    
    // Check if current path is public or protected
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    const isProtectedRoute = authRestrictedPaths.some((path) => pathname.startsWith(path));

    // 2. Early Exit: If no token and it's a public path, just proceed. 
    // This saves us from trying to fetch 'getUserData' for guest users.
    if (!token && isPublicPath) {
        return NextResponse.next();
    }

    // 3. Fetch user data (The "Node" Identity)
    let user = null;
    if (token) {
        try {
            user = await getUserData();
        } catch (e) {
            // Data is stale or node signature is invalid
            user = null;
        }
    }

    // LOGIC: Block unauthenticated users from secure nodes
    if ((!token || !user) && isProtectedRoute) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // LOGIC: Redirect authenticated users away from Login/Signup
    if (token && user && isPublicPath) {
        const target = user.role === 'admin' ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(target, req.url));
    }

    // RBAC: Role-Based Access Control
    if (user) {
        // Strict Admin Gate
        if (pathname.startsWith("/admin") && user.role !== 'admin') {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        
        // Standard User Gate
        if (pathname.startsWith("/user") && !['user', 'admin'].includes(user.role)) {
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
        "/picks/:path*",
        "/login",
        "/signup",
        "/register",
        "/forget-password",
    ]
};