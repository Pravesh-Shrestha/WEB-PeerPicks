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

    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (user && isPublicPath) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (user) {
        if (pathname.startsWith("/admin") && user.role !== 'admin') {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        
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