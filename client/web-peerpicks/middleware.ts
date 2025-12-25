import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token'); // Example token check
  const { pathname } = request.nextUrl;

  // 1. Protect Dashboard: Redirect to login if no token
  if (pathname.startsWith('/dashboard') && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Prevent Login access if already logged in
  if ((pathname === '/login' || pathname === '/signup') && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};