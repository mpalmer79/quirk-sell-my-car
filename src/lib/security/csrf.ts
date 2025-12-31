/**
 * CSRF Protection Module
 * 
 * Implements double-submit cookie pattern with signed tokens.
 * Works with Edge runtime (no Node.js crypto dependency).
 * 
 * Usage:
 *   Server: validateCsrfToken(request) in API routes
 *   Client: useCsrfToken() hook to get token for forms
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CSRF_CONFIG = {
  COOKIE_NAME: '__csrf',
  HEADER_NAME: 'x-csrf-token',
  FORM_FIELD_NAME: '_csrf',
  TOKEN_LENGTH: 32,
  TOKEN_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 hours
  COOKIE_OPTIONS: {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
};

// =============================================================================
// TOKEN GENERATION (Edge-compatible)
// =============================================================================

/**
 * Generate a random token using Web Crypto API (Edge-compatible)
 */
function generateRandomBytes(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create HMAC signature using Web Crypto API
 */
async function createHmac(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('');
}

/**
 * Verify HMAC signature
 */
async function verifyHmac(
  message: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await createHmac(message, secret);
  
  // Constant-time comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

// =============================================================================
// TOKEN MANAGEMENT
// =============================================================================

interface CsrfToken {
  token: string;
  signature: string;
  timestamp: number;
}

/**
 * Generate a new CSRF token with signature
 */
export async function generateCsrfToken(): Promise<CsrfToken> {
  const secret = getSecret();
  const token = generateRandomBytes(CSRF_CONFIG.TOKEN_LENGTH);
  const timestamp = Date.now();
  const message = `${token}:${timestamp}`;
  const signature = await createHmac(message, secret);

  return { token, signature, timestamp };
}

/**
 * Encode token for cookie storage
 */
function encodeToken(csrfToken: CsrfToken): string {
  return Buffer.from(
    JSON.stringify(csrfToken)
  ).toString('base64');
}

/**
 * Decode token from cookie
 */
function decodeToken(encoded: string): CsrfToken | null {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(decoded) as CsrfToken;
  } catch {
    return null;
  }
}

/**
 * Get the secret for signing tokens
 */
function getSecret(): string {
  const secret = process.env.FORM_TOKEN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FORM_TOKEN_SECRET environment variable is required');
    }
    // Development fallback (not secure!)
    console.warn('⚠️ Using development CSRF secret - set FORM_TOKEN_SECRET in production');
    return 'dev-csrf-secret-not-for-production-use';
  }
  return secret;
}

// =============================================================================
// SERVER-SIDE VALIDATION
// =============================================================================

export interface CsrfValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate CSRF token from request
 * Checks both cookie and header/body token
 */
export async function validateCsrfToken(
  request: NextRequest
): Promise<CsrfValidationResult> {
  const secret = getSecret();

  // 1. Get token from cookie
  const cookieToken = request.cookies.get(CSRF_CONFIG.COOKIE_NAME)?.value;
  if (!cookieToken) {
    return { valid: false, error: 'Missing CSRF cookie' };
  }

  const storedToken = decodeToken(cookieToken);
  if (!storedToken) {
    return { valid: false, error: 'Invalid CSRF cookie format' };
  }

  // 2. Check token expiry
  if (Date.now() - storedToken.timestamp > CSRF_CONFIG.TOKEN_EXPIRY_MS) {
    return { valid: false, error: 'CSRF token expired' };
  }

  // 3. Verify stored token signature
  const storedMessage = `${storedToken.token}:${storedToken.timestamp}`;
  const storedValid = await verifyHmac(storedMessage, storedToken.signature, secret);
  if (!storedValid) {
    return { valid: false, error: 'Invalid CSRF cookie signature' };
  }

  // 4. Get token from header or body
  let submittedToken: string | null = null;

  // Check header first
  submittedToken = request.headers.get(CSRF_CONFIG.HEADER_NAME);

  // If not in header, check form body for POST requests
  if (!submittedToken && request.method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const body = await request.clone().json();
        submittedToken = body[CSRF_CONFIG.FORM_FIELD_NAME];
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.clone().formData();
        submittedToken = formData.get(CSRF_CONFIG.FORM_FIELD_NAME) as string;
      }
    } catch {
      // Body parsing failed, token might be in header
    }
  }

  if (!submittedToken) {
    return { valid: false, error: 'Missing CSRF token in request' };
  }

  // 5. Compare tokens
  if (submittedToken !== storedToken.token) {
    return { valid: false, error: 'CSRF token mismatch' };
  }

  return { valid: true };
}

/**
 * Create response with CSRF cookie set
 */
export async function setCsrfCookie(response: NextResponse): Promise<NextResponse> {
  const csrfToken = await generateCsrfToken();
  const encoded = encodeToken(csrfToken);

  response.cookies.set(CSRF_CONFIG.COOKIE_NAME, encoded, {
    ...CSRF_CONFIG.COOKIE_OPTIONS,
    maxAge: CSRF_CONFIG.TOKEN_EXPIRY_MS / 1000,
  });

  return response;
}

// =============================================================================
// API ROUTE HELPERS
// =============================================================================

/**
 * Middleware wrapper for API routes requiring CSRF protection
 */
export function withCsrfProtection<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { error: string }>> => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request);
    }

    const validation = await validateCsrfToken(request);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'CSRF validation failed' },
        { status: 403 }
      ) as NextResponse<{ error: string }>;
    }

    return handler(request);
  };
}

/**
 * Get CSRF token for API response (to be used by client)
 */
export async function getCsrfTokenForResponse(): Promise<{
  token: string;
  headerName: string;
  fieldName: string;
}> {
  const csrfToken = await generateCsrfToken();
  
  return {
    token: csrfToken.token,
    headerName: CSRF_CONFIG.HEADER_NAME,
    fieldName: CSRF_CONFIG.FORM_FIELD_NAME,
  };
}

// =============================================================================
// CLIENT-SIDE HOOK (for use in React components)
// =============================================================================

/**
 * API endpoint to get CSRF token
 * Create this route: /api/csrf/route.ts
 * 
 * export async function GET() {
 *   const tokenData = await getCsrfTokenForResponse();
 *   const response = NextResponse.json(tokenData);
 *   return setCsrfCookie(response);
 * }
 */

// =============================================================================
// EXPORTS
// =============================================================================

export { CSRF_CONFIG };
