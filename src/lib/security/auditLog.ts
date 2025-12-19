/**
 * Audit Logging Service
 * Tracks all security-relevant events for monitoring and compliance
 */

import { NextRequest } from 'next/server';
import { getClientIp, generateFingerprint } from './rateLimit';
import { sanitizeForLogging } from './sanitize';
import { captureError, captureMessage } from '../sentry';

// =============================================================================
// TYPES
// =============================================================================

export enum AuditEventType {
  // Authentication & Access
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // API Access
  API_REQUEST = 'API_REQUEST',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_HIT = 'RATE_LIMIT_HIT',
  RATE_LIMIT_BLOCKED = 'RATE_LIMIT_BLOCKED',
  
  // Bot Detection
  BOT_DETECTED = 'BOT_DETECTED',
  HONEYPOT_TRIGGERED = 'HONEYPOT_TRIGGERED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // Data Access
  VIN_LOOKUP = 'VIN_LOOKUP',
  VALUATION_REQUEST = 'VALUATION_REQUEST',
  LEAD_SUBMISSION = 'LEAD_SUBMISSION',
  OFFER_GENERATED = 'OFFER_GENERATED',
  OFFER_CREATED = 'OFFER_CREATED',
  OFFER_UPDATED = 'OFFER_UPDATED',
  
  // Chat
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  CHAT_ERROR = 'CHAT_ERROR',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Security Events
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  CONFIG_CHANGE = 'CONFIG_CHANGE',

  // Webhooks
  WEBHOOK_RECEIVED = 'WEBHOOK_RECEIVED',
  WEBHOOK_ERROR = 'WEBHOOK_ERROR',
}

export enum AuditSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface AuditLogEntry {
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  message: string;
  
  // Request context
  requestId?: string;
  ip?: string;
  fingerprint?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  
  // Event details
  data?: Record<string, unknown>;
  
  // Error details
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  
  // Performance
  durationMs?: number;
  
  // User context
  userId?: string;
  sessionId?: string;
}

// =============================================================================
// STORAGE (In-memory buffer + console - use external service in production)
// =============================================================================

const LOG_BUFFER: AuditLogEntry[] = [];
const MAX_BUFFER_SIZE = 1000;

// Severity to console method mapping
const CONSOLE_METHODS: Record<AuditSeverity, (...args: unknown[]) => void> = {
  [AuditSeverity.DEBUG]: console.debug,
  [AuditSeverity.INFO]: console.info,
  [AuditSeverity.WARN]: console.warn,
  [AuditSeverity.ERROR]: console.error,
  [AuditSeverity.CRITICAL]: console.error,
};

// =============================================================================
// LOGGING FUNCTIONS
// =============================================================================

/**
 * Create an audit log entry
 */
export function auditLog(
  eventType: AuditEventType,
  severity: AuditSeverity,
  message: string,
  details?: {
    request?: NextRequest;
    data?: Record<string, unknown>;
    error?: Error;
    durationMs?: number;
    userId?: string;
    sessionId?: string;
  }
): void {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    severity,
    message,
  };
  
  // Add request context
  if (details?.request) {
    const req = details.request;
    entry.ip = getClientIp(req);
    entry.fingerprint = generateFingerprint(req);
    entry.userAgent = req.headers.get('user-agent') || undefined;
    entry.method = req.method;
    entry.path = new URL(req.url).pathname;
    entry.requestId = req.headers.get('x-request-id') || generateRequestId();
  }
  
  // Add sanitized data
  if (details?.data) {
    entry.data = sanitizeForLogging(details.data);
  }
  
  // Add error details
  if (details?.error) {
    entry.error = {
      name: details.error.name,
      message: details.error.message,
      stack: process.env.NODE_ENV === 'development' ? details.error.stack : undefined,
    };
  }
  
  // Add performance data
  if (details?.durationMs !== undefined) {
    entry.durationMs = details.durationMs;
  }
  
  // Add user context
  if (details?.userId) entry.userId = details.userId;
  if (details?.sessionId) entry.sessionId = details.sessionId;
  
  // Store in buffer
  LOG_BUFFER.push(entry);
  if (LOG_BUFFER.length > MAX_BUFFER_SIZE) {
    LOG_BUFFER.shift();
  }
  
  // Output to console
  const consoleMethod = CONSOLE_METHODS[severity];
  if (process.env.NODE_ENV === 'production') {
    // Structured JSON logging for production (Vercel picks this up)
    consoleMethod(JSON.stringify({
      type: 'AUDIT',
      service: 'quirk-sell-my-car',
      ...entry,
    }));
  } else {
    // Readable format for development
    consoleMethod(
      `[${severity}] ${eventType}: ${message}`,
      entry.data ? entry.data : '',
      entry.error ? entry.error.message : ''
    );
  }
  
  // Send errors and critical events to Sentry
  if (severity === AuditSeverity.ERROR || severity === AuditSeverity.CRITICAL) {
    if (details?.error) {
      captureError(details.error, {
        tags: {
          eventType,
          severity,
        },
        extra: {
          ...entry.data,
          path: entry.path,
          method: entry.method,
          requestId: entry.requestId,
        },
      });
    } else {
      captureMessage(message, severity === AuditSeverity.CRITICAL ? 'error' : 'warning', {
        eventType,
        ...entry.data,
      });
    }
  }
  
  // Send critical events to external monitoring webhook
  if (severity === AuditSeverity.CRITICAL && process.env.NODE_ENV === 'production') {
    sendToExternalMonitoring(entry).catch(console.error);
  }
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Send critical events to external monitoring (Slack, PagerDuty, etc.)
 */
async function sendToExternalMonitoring(entry: AuditLogEntry): Promise<void> {
  const webhookUrl = process.env.MONITORING_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    // Format for Slack webhook
    const payload = {
      text: `🚨 *${entry.severity}*: ${entry.message}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${entry.eventType}*\n${entry.message}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `*Time:* ${entry.timestamp} | *Path:* ${entry.path || 'N/A'} | *IP:* ${entry.ip || 'N/A'}`,
            },
          ],
        },
      ],
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send to monitoring webhook:', error);
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Log a VIN lookup
 */
export function logVinLookup(
  request: NextRequest,
  vin: string,
  success: boolean,
  durationMs?: number,
  details?: Record<string, unknown>
): void {
  auditLog(
    AuditEventType.VIN_LOOKUP,
    success ? AuditSeverity.INFO : AuditSeverity.WARN,
    success ? `VIN lookup successful: ${vin}` : `VIN lookup failed: ${vin}`,
    {
      request,
      durationMs,
      data: {
        vin,
        success,
        ...details,
      },
    }
  );
}

/**
 * Log a chat interaction
 */
export function logChatInteraction(
  request: NextRequest,
  messageLength: number,
  responseType: 'ai' | 'fallback' | 'error',
  durationMs: number
): void {
  auditLog(
    responseType === 'error' ? AuditEventType.CHAT_ERROR : AuditEventType.CHAT_MESSAGE,
    responseType === 'error' ? AuditSeverity.ERROR : AuditSeverity.INFO,
    `Chat ${responseType} response`,
    {
      request,
      data: {
        messageLength,
        responseType,
      },
      durationMs,
    }
  );
}

/**
 * Log a valuation request
 */
export function logValuationRequest(
  request: NextRequest,
  vin: string,
  mileage: number,
  success: boolean,
  offerAmount?: number
): void {
  auditLog(
    success ? AuditEventType.VALUATION_REQUEST : AuditEventType.API_ERROR,
    success ? AuditSeverity.INFO : AuditSeverity.ERROR,
    success ? 'Valuation generated' : 'Valuation failed',
    {
      request,
      data: {
        vin,
        mileage,
        success,
        offerAmount: offerAmount ? `$${offerAmount}` : undefined,
      },
    }
  );
}

/**
 * Log a lead submission
 */
export function logLeadSubmission(
  request: NextRequest,
  vin: string,
  email: string,
  success: boolean,
  leadId?: string
): void {
  auditLog(
    AuditEventType.LEAD_SUBMISSION,
    success ? AuditSeverity.INFO : AuditSeverity.ERROR,
    success ? `Lead submitted: ${leadId}` : 'Lead submission failed',
    {
      request,
      data: {
        vin,
        emailDomain: email.split('@')[1], // Only log domain, not full email
        success,
        leadId,
      },
    }
  );
}

/**
 * Log offer creation
 */
export function logOfferCreated(
  request: NextRequest,
  offerId: string,
  vin: string,
  offerAmount: number
): void {
  auditLog(
    AuditEventType.OFFER_CREATED,
    AuditSeverity.INFO,
    `Offer created: ${offerId}`,
    {
      request,
      data: {
        offerId,
        vin,
        offerAmount: `$${offerAmount}`,
      },
    }
  );
}

/**
 * Log offer update
 */
export function logOfferUpdated(
  request: NextRequest,
  offerId: string,
  changes: Record<string, unknown>
): void {
  auditLog(
    AuditEventType.OFFER_UPDATED,
    AuditSeverity.INFO,
    `Offer updated: ${offerId}`,
    {
      request,
      data: {
        offerId,
        changes,
      },
    }
  );
}

/**
 * Log rate limit hit
 */
export function logRateLimitHit(
  request: NextRequest,
  endpoint: string,
  blocked: boolean
): void {
  auditLog(
    blocked ? AuditEventType.RATE_LIMIT_BLOCKED : AuditEventType.RATE_LIMIT_HIT,
    blocked ? AuditSeverity.WARN : AuditSeverity.INFO,
    blocked ? `Request blocked: ${endpoint}` : `Rate limit hit: ${endpoint}`,
    {
      request,
      data: {
        endpoint,
        blocked,
      },
    }
  );
}

/**
 * Log bot detection
 */
export function logBotDetection(
  request: NextRequest,
  confidence: number,
  reasons: string[]
): void {
  auditLog(
    AuditEventType.BOT_DETECTED,
    confidence >= 80 ? AuditSeverity.WARN : AuditSeverity.INFO,
    `Bot detected with ${confidence}% confidence`,
    {
      request,
      data: {
        confidence,
        reasons,
      },
    }
  );
}

/**
 * Log validation error
 */
export function logValidationError(
  request: NextRequest,
  field: string,
  errors: string[]
): void {
  auditLog(
    AuditEventType.VALIDATION_ERROR,
    AuditSeverity.WARN,
    `Validation failed: ${field}`,
    {
      request,
      data: {
        field,
        errors,
      },
    }
  );
}

/**
 * Log security violation
 */
export function logSecurityViolation(
  request: NextRequest,
  violation: string,
  details?: Record<string, unknown>
): void {
  auditLog(
    AuditEventType.SECURITY_VIOLATION,
    AuditSeverity.CRITICAL,
    `Security violation: ${violation}`,
    {
      request,
      data: details,
    }
  );
}

/**
 * Log API error
 */
export function logApiError(
  request: NextRequest,
  endpoint: string,
  error: Error,
  durationMs?: number
): void {
  auditLog(
    AuditEventType.API_ERROR,
    AuditSeverity.ERROR,
    `API error: ${endpoint}`,
    {
      request,
      error,
      durationMs,
      data: {
        endpoint,
      },
    }
  );
}

/**
 * Log webhook received
 */
export function logWebhookReceived(
  request: NextRequest,
  source: string,
  eventType: string
): void {
  auditLog(
    AuditEventType.WEBHOOK_RECEIVED,
    AuditSeverity.INFO,
    `Webhook received from ${source}: ${eventType}`,
    {
      request,
      data: {
        source,
        webhookEventType: eventType,
      },
    }
  );
}

/**
 * Log webhook error
 */
export function logWebhookError(
  request: NextRequest,
  source: string,
  error: Error
): void {
  auditLog(
    AuditEventType.WEBHOOK_ERROR,
    AuditSeverity.ERROR,
    `Webhook error from ${source}`,
    {
      request,
      error,
      data: {
        source,
      },
    }
  );
}

// =============================================================================
// BUFFER ACCESS (for testing and debugging)
// =============================================================================

/**
 * Get recent log entries (for debugging)
 */
export function getRecentLogs(count = 100): AuditLogEntry[] {
  return LOG_BUFFER.slice(-count);
}

/**
 * Clear log buffer (for testing)
 */
export function clearLogs(): void {
  LOG_BUFFER.length = 0;
}

/**
 * Get logs by type
 */
export function getLogsByType(eventType: AuditEventType, count = 100): AuditLogEntry[] {
  return LOG_BUFFER
    .filter((entry) => entry.eventType === eventType)
    .slice(-count);
}

/**
 * Get logs by severity
 */
export function getLogsBySeverity(severity: AuditSeverity, count = 100): AuditLogEntry[] {
  return LOG_BUFFER
    .filter((entry) => entry.severity === severity)
    .slice(-count);
}
