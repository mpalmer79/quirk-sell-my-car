/**
 * Sentry Error Tracking Configuration
 * 
 * To enable Sentry error tracking:
 * 1. npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Set NEXT_PUBLIC_SENTRY_DSN in your environment
 * 
 * Until then, all errors are logged to console only.
 */

export const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay (optional)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    // Network errors that are usually transient
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // User aborted requests
    'AbortError',
    'The operation was aborted',
  ],

  // Don't send PII
  beforeSend(event: { request?: { headers?: Record<string, string>; cookies?: string } }) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
      delete event.request.headers['X-Api-Key'];
    }
    if (event.request?.cookies) {
      event.request.cookies = '[Filtered]';
    }
    return event;
  },
};

/**
 * Capture exception with context
 * Logs to console. Will send to Sentry when @sentry/nextjs is installed.
 */
export function captureError(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id?: string; email?: string };
    level?: 'fatal' | 'error' | 'warning' | 'info';
  }
): void {
  console.error('[Error]', error.message, context);
}

/**
 * Capture a message/breadcrumb
 * Logs to console. Will send to Sentry when @sentry/nextjs is installed.
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void {
  console.log(`[${level.toUpperCase()}]`, message, context);
}

/**
 * Set user context for error tracking
 * No-op until @sentry/nextjs is installed.
 */
export function setUser(_user: { id?: string; email?: string } | null): void {
  // No-op - Sentry not installed
}
