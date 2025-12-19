/**
 * General-Purpose Logger
 * Simple, consistent logging for application-wide use
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Log level hierarchy
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level (configurable via env)
const MIN_LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || (isProduction ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatLogEntry(entry: LogEntry): string {
  if (isProduction) {
    // JSON format for production (Vercel, Datadog, etc.)
    return JSON.stringify({
      ...entry,
      service: 'quirk-sell-my-car',
      environment: process.env.NODE_ENV,
    });
  }

  // Readable format for development
  const timestamp = new Date(entry.timestamp).toLocaleTimeString();
  const levelStr = entry.level.toUpperCase().padEnd(5);
  let output = `[${timestamp}] ${levelStr} ${entry.message}`;

  if (entry.context && Object.keys(entry.context).length > 0) {
    output += ` ${JSON.stringify(entry.context)}`;
  }

  if (entry.error) {
    output += `\n  Error: ${entry.error.message}`;
    if (entry.error.stack && !isProduction) {
      output += `\n  ${entry.error.stack}`;
    }
  }

  return output;
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: isProduction ? undefined : error.stack,
    };
  }

  const formatted = formatLogEntry(entry);

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

// Main logger object
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext, error?: Error) => log('warn', message, context, error),
  error: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),

  // Convenience method for API routes
  api: {
    request: (method: string, path: string, context?: LogContext) => {
      log('info', `${method} ${path}`, { type: 'api_request', ...context });
    },
    success: (method: string, path: string, durationMs: number, context?: LogContext) => {
      log('info', `${method} ${path} completed`, { type: 'api_success', durationMs, ...context });
    },
    error: (method: string, path: string, error: Error, context?: LogContext) => {
      log('error', `${method} ${path} failed`, { type: 'api_error', ...context }, error);
    },
  },

  // Timer utility for measuring duration
  startTimer: () => {
    const start = performance.now();
    return {
      end: () => Math.round(performance.now() - start),
    };
  },
};

export default logger;
