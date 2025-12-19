/**
 * Advanced Rate Limiting
 * Sliding window algorithm with request fingerprinting
 */

import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

// =============================================================================
// TYPES
// =============================================================================

interface RateLimitRecord {
  requests: number[];
  blocked: boolean;
  blockedUntil?: number;
  suspicionScore: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
  suspicionThreshold: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
  retryAfter?: number;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  blockDurationMs: 15 * 60 * 1000, // 15 minute block
  suspicionThreshold: 100, // Block after reaching this score
};

// Endpoint-specific configurations
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/chat': {
    windowMs: 60 * 1000,
    maxRequests: 10,
    blockDurationMs: 5 * 60 * 1000,
    suspicionThreshold: 50,
  },
  '/api/decode-vin': {
    windowMs: 60 * 1000,
    maxRequests: 20,
    blockDurationMs: 10 * 60 * 1000,
    suspicionThreshold: 75,
  },
  '/api/valuation': {
    windowMs: 60 * 1000,
    maxRequests: 5,
    blockDurationMs: 30 * 60 * 1000,
    suspicionThreshold: 30,
  },
  '/api/submit-lead': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hour block
    suspicionThreshold: 20,
  },
};

// =============================================================================
// STORAGE (In-memory - use Redis in production)
// =============================================================================

// Export for testing
export const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes
// Only run in non-test environments
if (typeof setInterval !== 'undefined' && process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // Remove entries with no recent requests and not blocked
      const recentRequests = record.requests.filter(
        (time) => now - time < 60 * 60 * 1000 // Keep 1 hour of history
      );
      
      if (recentRequests.length === 0 && (!record.blocked || now > (record.blockedUntil || 0))) {
        rateLimitStore.delete(key);
      } else {
        record.requests = recentRequests;
      }
    }
  }, 5 * 60 * 1000);
}

// =============================================================================
// FINGERPRINTING
// =============================================================================

/**
 * Generate a fingerprint for the request
 * Combines IP, user agent, and other headers for better identification
 */
export function generateFingerprint(request: NextRequest): string {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  const fingerprintData = `${ip}|${userAgent}|${acceptLanguage}|${acceptEncoding}`;
  
  return createHash('sha256').update(fingerprintData).digest('hex').substring(0, 16);
}

/**
 * Get client IP from various headers
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers (in order of preference)
  const headers = [
    'cf-connecting-ip', // Cloudflare
    'x-real-ip',
    'x-forwarded-for',
    'x-client-ip',
    'true-client-ip',
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs
      const ip = value.split(',')[0]?.trim();
      if (ip && isValidIp(ip)) {
        return ip;
      }
    }
  }
  
  return 'unknown';
}

/**
 * Basic IP validation
 */
function isValidIp(ip: string): boolean {
  // IPv4
  if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip)) {
    return true;
  }
  // IPv6 (simplified check)
  if (/^[0-9a-fA-F:]+$/.test(ip) && ip.includes(':')) {
    return true;
  }
  return false;
}

// =============================================================================
// SUSPICION SCORING
// =============================================================================

/**
 * Calculate suspicion score based on request patterns
 */
export function calculateSuspicionScore(request: NextRequest, record: RateLimitRecord): number {
  let score = 0;
  const now = Date.now();
  
  // High request frequency in short period
  const recentRequests = record.requests.filter((time) => now - time < 10000); // Last 10 seconds
  if (recentRequests.length > 5) {
    score += recentRequests.length * 5;
  }
  
  // Missing or suspicious user agent
  const userAgent = request.headers.get('user-agent') || '';
  if (!userAgent) {
    score += 20;
  } else if (userAgent.length < 20) {
    score += 10;
  } else if (/bot|crawler|spider|scraper/i.test(userAgent)) {
    score += 15;
  }
  
  // Missing common headers
  if (!request.headers.get('accept-language')) {
    score += 5;
  }
  if (!request.headers.get('accept')) {
    score += 5;
  }
  
  // Requests at exact intervals (bot behavior)
  if (record.requests.length >= 3) {
    const intervals = [];
    for (let i = 1; i < Math.min(record.requests.length, 10); i++) {
      intervals.push(record.requests[i] - record.requests[i - 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    
    // Very low variance = bot-like behavior
    if (variance < 100 && intervals.length >= 3) {
      score += 25;
    }
  }
  
  return score;
}

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * Check and update rate limit for a request
 */
export function checkRateLimit(
  request: NextRequest,
  endpoint?: string
): RateLimitResult {
  const config = endpoint && RATE_LIMIT_CONFIGS[endpoint]
    ? RATE_LIMIT_CONFIGS[endpoint]
    : DEFAULT_CONFIG;
  
  const fingerprint = generateFingerprint(request);
  const key = endpoint ? `${endpoint}:${fingerprint}` : fingerprint;
  const now = Date.now();
  
  // Get or create record
  let record = rateLimitStore.get(key);
  if (!record) {
    record = {
      requests: [],
      blocked: false,
      suspicionScore: 0,
    };
    rateLimitStore.set(key, record);
  }
  
  // Check if currently blocked
  if (record.blocked && record.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockedUntil,
      blocked: true,
      retryAfter: Math.ceil((record.blockedUntil - now) / 1000),
    };
  }
  
  // Unblock if block has expired
  if (record.blocked && record.blockedUntil && now >= record.blockedUntil) {
    record.blocked = false;
    record.blockedUntil = undefined;
    record.suspicionScore = Math.floor(record.suspicionScore / 2); // Reduce but don't reset
  }
  
  // Clean old requests outside window
  record.requests = record.requests.filter(
    (time) => now - time < config.windowMs
  );
  
  // Calculate suspicion score
  const newSuspicionScore = calculateSuspicionScore(request, record);
  record.suspicionScore = Math.min(
    record.suspicionScore + newSuspicionScore,
    config.suspicionThreshold * 2
  );
  
  // Check if should be blocked due to suspicion
  if (record.suspicionScore >= config.suspicionThreshold) {
    record.blocked = true;
    record.blockedUntil = now + config.blockDurationMs;
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.blockedUntil,
      blocked: true,
      retryAfter: Math.ceil(config.blockDurationMs / 1000),
    };
  }
  
  // Check rate limit
  if (record.requests.length >= config.maxRequests) {
    const oldestRequest = record.requests[0];
    const resetTime = oldestRequest + config.windowMs;
    
    // Increase suspicion for hitting rate limit
    record.suspicionScore += 10;
    
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      blocked: false,
      retryAfter: Math.ceil((resetTime - now) / 1000),
    };
  }
  
  // Add current request
  record.requests.push(now);
  
  // Decay suspicion score over time
  if (record.requests.length === 1) {
    record.suspicionScore = Math.max(0, record.suspicionScore - 5);
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.requests.length,
    resetTime: now + config.windowMs,
    blocked: false,
  };
}

/**
 * Middleware helper for rate limiting
 */
export function rateLimitMiddleware(endpoint: string) {
  return (request: NextRequest) => {
    const result = checkRateLimit(request, endpoint);
    
    if (!result.allowed) {
      return {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
          'Retry-After': String(result.retryAfter || 60),
        },
        body: {
          error: result.blocked
            ? 'Too many requests. You have been temporarily blocked.'
            : 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter,
        },
      };
    }
    
    return {
      status: 200,
      headers: {
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
      },
    };
  };
}
