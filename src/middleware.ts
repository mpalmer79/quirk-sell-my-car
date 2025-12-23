import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/security/rateLimit';

// ============================================
// AUTH BYPASS MODE - Set to false when going live
// ============================================
const BYPASS_AUTH = true;

const PUBLIC_ROUTES = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/api/admin/auth/login',
  '/api/admin/auth/forgot-password',
  '/api/admin/auth/reset-password',
];

const PARTIAL_AUTH_ROUTES = [
  '/api/admin/auth/verify-2fa',
  '/api/admin/auth/logout',
  '/api/admin/auth/me',
];

// API routes that should be rate limited
const RATE_LIMITED_ROUTES = [
  '/api/chat',
  '/api/decode-vin',
  '/api/submit-offer',
  '/api/vehicle-image',
  '/api/offers',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ============================================
  // RATE LIMITING FOR PUBLIC API ROUTES
  // ============================================
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin')) {
    // Find matching rate limit config
    const matchedRoute = RATE_LIMITED_ROUTES.find(route => pathname.startsWith(route));
    
    if (matchedRoute) {
      const result = checkRateLimit(request, matchedRoute);
      
      if (!result.allowed) {
        return NextResponse.json(
          {
            error: result.blocked
              ? 'Too many requests. You have been temporarily blocked.'
              : 'Rate limit exceeded. Please try again later.',
            retryAfter: result.retryAfter,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
              'Retry-After': String(result.retryAfter || 60),
            },
          }
        );
      }
      
      // Add rate limit headers to successful response
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
      return response;
    }
  }

  // ============================================
  // ADMIN ROUTE AUTHENTICATION
  // ============================================
  
  // Skip non-admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // BYPASS: Allow all admin access without login
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
    '/api/:path*',
  ],
};
