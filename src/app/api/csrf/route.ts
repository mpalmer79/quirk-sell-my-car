/**
 * CSRF Token API Endpoint
 * 
 * GET /api/csrf - Returns a CSRF token and sets the cookie
 * 
 * Usage:
 *   const response = await fetch('/api/csrf');
 *   const { token } = await response.json();
 *   // Use token in subsequent POST requests
 */

import { NextResponse } from 'next/server';
import { getCsrfTokenForResponse, setCsrfCookie } from '@/lib/security/csrf';

export const runtime = 'edge';

export async function GET() {
  try {
    const tokenData = await getCsrfTokenForResponse();
    const response = NextResponse.json(tokenData);
    return setCsrfCookie(response);
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
