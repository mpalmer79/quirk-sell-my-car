import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================
// AUTH BYPASS MODE - Set to false when going live
// ============================================
const BYPASS_AUTH = true;

const PUBLIC_ROUTES = [
  '/admin/login',
  '/api/admin/auth/login',
];

const PARTIAL_AUTH_ROUTES = [
  '/api/admin/auth/verify-2fa',
  '/api/admin/auth/logout',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip non-admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // ============================================
  // BYPASS: Allow all admin access without login
  // ============================================
  if (BYPASS_AUTH) {
    return NextResponse.next();
  }

  // Normal auth flow (used when BYPASS_AUTH = false)
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('admin_session')?.value;

  if (!sessionToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (PARTIAL_AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
