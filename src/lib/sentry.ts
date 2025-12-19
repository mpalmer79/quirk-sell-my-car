/**
 * Sentry Error Tracking Configuration
 * Initialize in layout.tsx or instrumentation.ts
 */

// Note: Install Sentry packages:
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
  // Only import Sentry when needed (prevents build errors if not installed)
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.withScope((scope) => {
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
      // Sentry not installed, just log
      console.error('Sentry not available:', error);
    });
  } else {
    // No Sentry DSN, just log
    console.error('[Error]', error.message, context);
  }
}

/**
 * Capture a message/breadcrumb
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.withScope((scope) => {
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
        Sentry.captureMessage(message, level);
      });
    }).catch(() => {
      console.log(`[${level.toUpperCase()}]`, message, context);
    });
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id?: string; email?: string } | null): void {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.setUser(user);
    }).catch(() => {});
  }
}
