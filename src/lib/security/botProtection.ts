/**
 * Bot Protection
 * Honeypot fields, timing analysis, and behavior detection
 */

import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import type { CSSProperties } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface BotDetectionResult {
  isBot: boolean;
  confidence: number; // 0-100
  reasons: string[];
}

interface HoneypotConfig {
  fieldName: string;
  cssClass: string;
  minSubmitTime: number; // Minimum time in ms before form can be submitted
  maxSubmitTime: number; // Maximum time in ms (stale forms)
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const HONEYPOT_CONFIG: HoneypotConfig = {
  fieldName: 'website', // Common bots fill this expecting a website field
  cssClass: 'hp-field', // CSS class for hiding the field
  minSubmitTime: 3000, // 3 seconds minimum
  maxSubmitTime: 30 * 60 * 1000, // 30 minutes maximum
};

// Known bot user agents (partial matches)
const BOT_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'httpclient', 'java/', 'apache-httpclient', 'okhttp', 'axios', 'node-fetch',
  'go-http-client', 'libwww', 'lwp-', 'scrapy', 'phantomjs', 'headless',
  'selenium', 'puppeteer', 'playwright', 'webdriver',
];

// Known good bot user agents (search engines, etc.)
const GOOD_BOTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'facebot', 'facebookexternalhit', 'twitterbot',
  'linkedinbot', 'pinterest', 'whatsapp', 'telegram',
];

// =============================================================================
// TOKEN GENERATION
// =============================================================================

/**
 * Generate a form token with timestamp
 */
export function generateFormToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const data = `${timestamp}:${random}`;
  const hash = createHash('sha256')
    .update(data + (process.env.FORM_TOKEN_SECRET || 'default-secret'))
    .digest('hex')
    .substring(0, 16);
  
  // Base64 encode the data:hash
  return Buffer.from(`${data}:${hash}`).toString('base64');
}

/**
 * Validate a form token
 */
export function validateFormToken(token: string): {
  valid: boolean;
  age?: number;
  reason?: string;
} {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [timestampStr, random, hash] = decoded.split(':');
    
    if (!timestampStr || !random || !hash) {
      return { valid: false, reason: 'Invalid token format' };
    }
    
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return { valid: false, reason: 'Invalid timestamp' };
    }
    
    // Verify hash
    const data = `${timestamp}:${random}`;
    const expectedHash = createHash('sha256')
      .update(data + (process.env.FORM_TOKEN_SECRET || 'default-secret'))
      .digest('hex')
      .substring(0, 16);
    
    if (hash !== expectedHash) {
      return { valid: false, reason: 'Invalid token signature' };
    }
    
    const age = Date.now() - timestamp;
    
    // Check timing
    if (age < HONEYPOT_CONFIG.minSubmitTime) {
      return { valid: false, age, reason: 'Form submitted too quickly' };
    }
    
    if (age > HONEYPOT_CONFIG.maxSubmitTime) {
      return { valid: false, age, reason: 'Form token expired' };
    }
    
    return { valid: true, age };
  } catch {
    return { valid: false, reason: 'Token decode error' };
  }
}

// =============================================================================
// BOT DETECTION
// =============================================================================

/**
 * Comprehensive bot detection
 */
export function detectBot(request: NextRequest, formData?: {
  honeypot?: string;
  formToken?: string;
  mouseMovements?: number;
  keystrokes?: number;
  timeOnPage?: number;
}): BotDetectionResult {
  const reasons: string[] = [];
  let botScore = 0;
  
  // ===== User Agent Analysis =====
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  
  // No user agent
  if (!userAgent) {
    botScore += 40;
    reasons.push('Missing user agent');
  } else {
    // Check for known bots
    for (const botAgent of BOT_USER_AGENTS) {
      if (userAgent.includes(botAgent)) {
        // Check if it's a good bot
        const isGoodBot = GOOD_BOTS.some((good) => userAgent.includes(good));
        if (!isGoodBot) {
          botScore += 50;
          reasons.push(`Bot user agent detected: ${botAgent}`);
        }
        break;
      }
    }
    
    // Suspiciously short user agent
    if (userAgent.length < 30) {
      botScore += 15;
      reasons.push('Unusually short user agent');
    }
  }
  
  // ===== Header Analysis =====
  
  // Missing Accept header
  if (!request.headers.get('accept')) {
    botScore += 10;
    reasons.push('Missing Accept header');
  }
  
  // Missing Accept-Language
  if (!request.headers.get('accept-language')) {
    botScore += 10;
    reasons.push('Missing Accept-Language header');
  }
  
  // Missing Accept-Encoding
  if (!request.headers.get('accept-encoding')) {
    botScore += 5;
    reasons.push('Missing Accept-Encoding header');
  }
  
  // Suspicious referer
  const referer = request.headers.get('referer');
  if (request.method === 'POST' && !referer) {
    botScore += 15;
    reasons.push('POST request without referer');
  }
  
  // ===== Honeypot Check =====
  if (formData?.honeypot) {
    botScore += 100;
    reasons.push('Honeypot field filled');
  }
  
  // ===== Form Token Check =====
  if (formData?.formToken) {
    const tokenResult = validateFormToken(formData.formToken);
    if (!tokenResult.valid) {
      botScore += 30;
      reasons.push(`Invalid form token: ${tokenResult.reason}`);
    }
  } else if (request.method === 'POST') {
    botScore += 20;
    reasons.push('Missing form token');
  }
  
  // ===== Behavioral Analysis =====
  if (formData) {
    // No mouse movements on form submission (usually indicates bot)
    if (formData.mouseMovements !== undefined && formData.mouseMovements < 3) {
      botScore += 20;
      reasons.push('Insufficient mouse movements');
    }
    
    // No keystrokes (copy-paste or autofill by bot)
    if (formData.keystrokes !== undefined && formData.keystrokes < 5) {
      botScore += 15;
      reasons.push('Insufficient keystrokes');
    }
    
    // Time on page too short
    if (formData.timeOnPage !== undefined && formData.timeOnPage < 5000) {
      botScore += 25;
      reasons.push('Time on page too short');
    }
  }
  
  // ===== Calculate Result =====
  const confidence = Math.min(100, botScore);
  const isBot = confidence >= 50;
  
  return {
    isBot,
    confidence,
    reasons,
  };
}

/**
 * Quick bot check for API routes
 */
export function quickBotCheck(request: NextRequest): boolean {
  const result = detectBot(request);
  return result.isBot;
}

// =============================================================================
// HONEYPOT COMPONENT HELPERS
// =============================================================================

/**
 * Generate honeypot field HTML attributes
 */
export function getHoneypotFieldProps(): {
  name: string;
  autoComplete: string;
  tabIndex: number;
  'aria-hidden': boolean;
  className: string;
  style: CSSProperties;
} {
  return {
    name: HONEYPOT_CONFIG.fieldName,
    autoComplete: 'off',
    tabIndex: -1,
    'aria-hidden': true,
    className: HONEYPOT_CONFIG.cssClass,
    style: {
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      opacity: 0,
      height: 0,
      width: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    },
  };
}

/**
 * CSS for honeypot field (add to global styles)
 */
export const HONEYPOT_CSS = `
.${HONEYPOT_CONFIG.cssClass} {
  position: absolute !important;
  left: -9999px !important;
  top: -9999px !important;
  opacity: 0 !important;
  height: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
  visibility: hidden !important;
}
`;
