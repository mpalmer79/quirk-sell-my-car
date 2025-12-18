/**
 * Input Sanitization Utilities
 * Cleans and normalizes user input to prevent XSS and injection attacks
 */

// =============================================================================
// HTML SANITIZATION
// =============================================================================

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strip all HTML tags from input
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .trim();
}

// =============================================================================
// STRING SANITIZATION
// =============================================================================

/**
 * Remove potentially dangerous characters while preserving readability
 */
export function sanitizeString(input: string, options?: {
  maxLength?: number;
  allowNewlines?: boolean;
  allowUnicode?: boolean;
}): string {
  const {
    maxLength = 1000,
    allowNewlines = false,
    allowUnicode = true,
  } = options || {};

  let sanitized = input;

  // Trim whitespace
  sanitized = sanitized.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Normalize Unicode (prevent homograph attacks)
  if (allowUnicode) {
    sanitized = sanitized.normalize('NFKC');
  } else {
    // Strip non-ASCII characters
    sanitized = sanitized.replace(/[^\x20-\x7E\n\r\t]/g, '');
  }

  // Handle newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\n\r]/g, ' ');
  }

  // Collapse multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Remove control characters (except newline/tab if allowed)
  if (allowNewlines) {
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  } else {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  }

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize a name field (first name, last name)
 */
export function sanitizeName(input: string): string {
  return input
    .trim()
    .normalize('NFKC')
    .replace(/[^a-zA-Z\s'-]/g, '') // Only letters, spaces, hyphens, apostrophes
    .replace(/\s+/g, ' ')
    .substring(0, 50);
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\w.@+-]/g, '')
    .substring(0, 254);
}

/**
 * Sanitize phone number to digits only
 */
export function sanitizePhone(input: string): string {
  return input.replace(/\D/g, '').substring(0, 15);
}

/**
 * Sanitize VIN
 */
export function sanitizeVin(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, '') // Remove invalid VIN characters
    .substring(0, 17);
}

/**
 * Sanitize ZIP code
 */
export function sanitizeZipCode(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 9) {
    return `${digits.substring(0, 5)}-${digits.substring(5)}`;
  }
  return digits.substring(0, 5);
}

// =============================================================================
// SQL INJECTION PREVENTION
// =============================================================================

/**
 * Escape characters that could be used for SQL injection
 * Note: Always use parameterized queries - this is a last resort
 */
export function escapeSql(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/;/g, '\\;')
    .replace(/--/g, '');
}

// =============================================================================
// URL SANITIZATION
// =============================================================================

/**
 * Validate and sanitize a URL
 */
export function sanitizeUrl(input: string): string | null {
  try {
    const url = new URL(input);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    
    // Don't allow credentials in URL
    if (url.username || url.password) {
      return null;
    }
    
    return url.toString();
  } catch {
    return null;
  }
}

// =============================================================================
// OBJECT SANITIZATION
// =============================================================================

/**
 * Recursively sanitize all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options?: {
    maxDepth?: number;
    maxStringLength?: number;
  }
): T {
  const { maxDepth = 10, maxStringLength = 10000 } = options || {};

  function sanitizeValue(value: unknown, depth: number): unknown {
    if (depth > maxDepth) {
      return '[MAX_DEPTH_EXCEEDED]';
    }

    if (typeof value === 'string') {
      return sanitizeString(value, { maxLength: maxStringLength });
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item, depth + 1));
    }

    if (value && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        const sanitizedKey = sanitizeString(key, { maxLength: 100 });
        sanitized[sanitizedKey] = sanitizeValue(val, depth + 1);
      }
      return sanitized;
    }

    return value;
  }

  return sanitizeValue(obj, 0) as T;
}

// =============================================================================
// LOGGING SANITIZATION
// =============================================================================

/**
 * Sanitize data for safe logging (remove sensitive info)
 */
export function sanitizeForLogging<T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: string[] = [
    'password',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'cookie',
    'ssn',
    'creditCard',
    'credit_card',
    'cardNumber',
    'card_number',
    'cvv',
    'pin',
  ]
): T {
  function redact(obj: Record<string, unknown>, depth = 0): Record<string, unknown> {
    if (depth > 10) return { '[MAX_DEPTH]': true };

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = redact(value as Record<string, unknown>, depth + 1);
      } else if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          item && typeof item === 'object'
            ? redact(item as Record<string, unknown>, depth + 1)
            : item
        );
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  return redact(data) as T;
}
