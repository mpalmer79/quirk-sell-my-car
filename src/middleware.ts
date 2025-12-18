import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Headers Middleware
 * Adds security headers to all responses
 */
export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();

  // ===== Security Headers =====
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature-Policy)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.anthropic.com https://api.pexels.com https://*.vercel-insights.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ];
  
  // Use report-only in development
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  } else {
    response.headers.set('Content-Security-Policy-Report-Only', cspDirectives.join('; '));
  }
  
  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // ===== Request ID for tracing =====
  const requestId = request.headers.get('x-request-id') || 
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  response.headers.set('X-Request-ID', requestId);

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
