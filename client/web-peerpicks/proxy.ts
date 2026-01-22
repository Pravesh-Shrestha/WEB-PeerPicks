import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "./lib/cookie";
import { is } from "zod/v4/locales";

const publicPaths = ["/login", "/register", "/forget-password"];
const adminPaths = ["/admin"];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = await getAuthToken();
    const user = token ? await getUserData() : null;

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    
    const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

    if(!user && !isPublicPath){
        return NextResponse.redirect(new URL("/login", req.url));
    }
    
    if(user && token){
        if(isAdminPath && user.role !== 'admin'){
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    if (isPublicPath && user) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next(); // continue/granted
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/user/:path*",
        "/login",
        "/register"
    ]
}
// matcher - which path to apply proxy logic