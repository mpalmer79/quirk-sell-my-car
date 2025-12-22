/**
 * Sentry Error Tracking Configuration
 * Initialize in layout.tsx or instrumentation.ts
 */

// Note: Install Sentry packages to enable:
// npm install @sentry/nextjs

// This file provides the configuration - actual initialization
// happens via Sentry's Next.js wizard which creates:
// - sentry.client.config.ts
// - sentry.server.config.ts  
// - sentry.edge.config.ts

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

// Check if Sentry is available (installed and configured)
const isSentryAvailable = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_SENTRY_DSN);
};

// Lazy load Sentry only when needed and available
const getSentry = async () => {
  if (!isSentryAvailable()) return null;
  try {
    // Use require to avoid static analysis
    const Sentry = await import(/* webpackIgnore: true */ '@sentry/nextjs');
    return Sentry;
  } catch {
    return null;
  }
};

/**
 * Capture exception with context
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
  // Always log to console
  console.error('[Error]', error.message, context);
  
  // Try to send to Sentry if available
  getSentry().then((Sentry) => {
    if (!Sentry) return;
    
    Sentry.withScope((scope: { setTag: (k: string, v: string) => void; setExtra: (k: string, v: unknown) => void; setUser: (u: { id?: string; email?: string } | null) => void; setLevel: (l: string) => void }) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      if (context?.user) {
        scope.setUser(context.user);
      }
      if (context?.level) {
        scope.setLevel(context.level);
      }
      Sentry.captureException(error);
    });
  }).catch(() => {
    // Silently fail - already logged to console
  });
}

/**
 * Capture a message/breadcrumb
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void {
  // Log to console
  console.log(`[${level.toUpperCase()}]`, message, context);
  
  getSentry().then((Sentry) => {
    if (!Sentry) return;
    
    Sentry.withScope((scope: { setExtra: (k: string, v: unknown) => void }) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureMessage(message, level);
    });
  }).catch(() => {});
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id?: string; email?: string } | null): void {
  getSentry().then((Sentry) => {
    if (!Sentry) return;
    Sentry.setUser(user);
  }).catch(() => {});
}
