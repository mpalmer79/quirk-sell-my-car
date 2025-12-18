/**
 * Input Validation Schemas
 * Using Zod for runtime type checking and validation
 */

import { z } from 'zod';

// =============================================================================
// VIN VALIDATION
// =============================================================================

// VIN must be exactly 17 characters, alphanumeric except I, O, Q
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

export const vinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(17, 'VIN must be exactly 17 characters')
  .regex(VIN_REGEX, 'VIN contains invalid characters (I, O, Q not allowed)')
  .refine((vin) => {
    // Check digit validation (position 9)
    const transliteration: Record<string, number> = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
      J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
      S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
    };
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vin[i];
      const value = /\d/.test(char) ? parseInt(char) : transliteration[char] || 0;
      sum += value * weights[i];
    }
    
    const checkDigit = sum % 11;
    const expectedCheck = checkDigit === 10 ? 'X' : checkDigit.toString();
    
    return vin[8] === expectedCheck;
  }, 'Invalid VIN check digit');

// =============================================================================
// CHAT MESSAGE VALIDATION
// =============================================================================

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .refine((msg) => !containsSuspiciousPatterns(msg), 'Message contains suspicious content'),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, 'At least one message required')
    .max(50, 'Too many messages in history'),
});

// =============================================================================
// VEHICLE BASICS VALIDATION
// =============================================================================

export const vehicleBasicsSchema = z.object({
  mileage: z
    .number()
    .int('Mileage must be a whole number')
    .min(0, 'Mileage cannot be negative')
    .max(500000, 'Mileage seems too high'),
  
  zipCode: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  
  hasLoan: z.boolean(),
  
  loanBalance: z
    .number()
    .min(0, 'Loan balance cannot be negative')
    .max(200000, 'Loan balance seems too high')
    .optional(),
});

// =============================================================================
// VEHICLE CONDITION VALIDATION
// =============================================================================

export const vehicleConditionSchema = z.object({
  overallCondition: z.enum(['excellent', 'good', 'fair', 'poor']),
  
  exteriorCondition: z.enum(['excellent', 'good', 'fair', 'poor']),
  
  interiorCondition: z.enum(['excellent', 'good', 'fair', 'poor']),
  
  mechanicalCondition: z.enum(['excellent', 'good', 'fair', 'poor']),
  
  hasAccidentHistory: z.boolean(),
  
  accidentDescription: z
    .string()
    .trim()
    .max(1000, 'Description too long')
    .optional(),
  
  hasMajorRepairs: z.boolean(),
  
  repairDescription: z
    .string()
    .trim()
    .max(1000, 'Description too long')
    .optional(),
});

// =============================================================================
// CONTACT INFO VALIDATION
// =============================================================================

export const contactInfoSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(254, 'Email too long'),
  
  phone: z
    .string()
    .trim()
    .regex(/^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, 'Invalid phone number')
    .transform((val) => val.replace(/\D/g, '')), // Normalize to digits only
  
  preferredContact: z.enum(['email', 'phone', 'text']),
  
  // Honeypot field - should always be empty
  website: z
    .string()
    .max(0, 'Invalid submission')
    .optional(),
});

// =============================================================================
// LEAD SUBMISSION VALIDATION (Full form)
// =============================================================================

export const leadSubmissionSchema = z.object({
  vin: vinSchema,
  vehicle: z.object({
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    make: z.string().trim().min(1).max(50),
    model: z.string().trim().min(1).max(100),
    trim: z.string().trim().max(100).optional(),
  }),
  basics: vehicleBasicsSchema,
  condition: vehicleConditionSchema,
  contact: contactInfoSchema,
  consent: z.object({
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms of service' }),
    }),
    privacyAccepted: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the privacy policy' }),
    }),
    marketingOptIn: z.boolean(),
  }),
  metadata: z.object({
    submittedAt: z.string().datetime(),
    userAgent: z.string().max(500).optional(),
    ipAddress: z.string().ip().optional(),
    sessionId: z.string().uuid().optional(),
  }).optional(),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check for suspicious patterns that might indicate injection attacks
 */
function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /data:/gi, // Data URLs
    /vbscript:/gi, // VBScript protocol
    /{{.*}}/g, // Template injection
    /\$\{.*\}/g, // Template literals
    /<iframe/gi, // iframes
    /<object/gi, // Object tags
    /<embed/gi, // Embed tags
    /union\s+select/gi, // SQL injection
    /;\s*drop\s+table/gi, // SQL injection
    /--\s*$/gm, // SQL comment
    /\/\*.*\*\//g, // Block comments
  ];
  
  return suspiciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and parse input with a schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(input);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
  
  return { success: false, errors };
}

// =============================================================================
// EXPORTS
// =============================================================================

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type VehicleBasics = z.infer<typeof vehicleBasicsSchema>;
export type VehicleCondition = z.infer<typeof vehicleConditionSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;
