/**
 * Comprehensive Environment Variable Validator
 * 
 * Validates all required and optional environment variables at startup.
 * Provides detailed error messages and security checks.
 * 
 * Usage:
 *   - Import in layout.tsx or _app.tsx for automatic validation
 *   - Call assertEnvOnStartup() in instrumentation.ts for Next.js 13+
 */

import { z } from 'zod';

// =============================================================================
// ENVIRONMENT SCHEMA
// =============================================================================

const envSchema = z.object({
  // ─────────────────────────────────────────────────────────────────────────────
  // REQUIRED: Supabase Database
  // ─────────────────────────────────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('Must be a valid URL')
    .refine((url) => url.includes('supabase'), 'Must be a Supabase URL'),
  
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(100, 'Anon key appears too short')
    .refine((key) => key.startsWith('eyJ'), 'Must be a valid JWT token'),
  
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(100, 'Service role key appears too short')
    .refine((key) => key.startsWith('eyJ'), 'Must be a valid JWT token'),

  // ─────────────────────────────────────────────────────────────────────────────
  // REQUIRED: Anthropic AI
  // ─────────────────────────────────────────────────────────────────────────────
  ANTHROPIC_API_KEY: z
    .string()
    .refine(
      (key) => key.startsWith('sk-ant-'),
      'Must be a valid Anthropic API key (starts with sk-ant-)'
    ),

  // ─────────────────────────────────────────────────────────────────────────────
  // REQUIRED: SendGrid Email
  // ─────────────────────────────────────────────────────────────────────────────
  SENDGRID_API_KEY: z
    .string()
    .refine(
      (key) => key.startsWith('SG.'),
      'Must be a valid SendGrid API key (starts with SG.)'
    ),
  
  SENDGRID_FROM_EMAIL: z
    .string()
    .email('Must be a valid email address'),

  // ─────────────────────────────────────────────────────────────────────────────
  // REQUIRED: Security
  // ─────────────────────────────────────────────────────────────────────────────
  FORM_TOKEN_SECRET: z
    .string()
    .min(32, 'Secret must be at least 32 characters for security'),

  // ─────────────────────────────────────────────────────────────────────────────
  // OPTIONAL: SendGrid Extended
  // ─────────────────────────────────────────────────────────────────────────────
  SENDGRID_FROM_NAME: z.string().optional(),
  SENDGRID_DEALER_EMAIL: z.string().email().optional(),
  SENDGRID_DEALER_TEMPLATE_ID: z.string().optional(),
  SENDGRID_CUSTOMER_TEMPLATE_ID: z.string().optional(),

  // ─────────────────────────────────────────────────────────────────────────────
  // OPTIONAL: Redis (for distributed rate limiting)
  // ─────────────────────────────────────────────────────────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ─────────────────────────────────────────────────────────────────────────────
  // OPTIONAL: VIN Solutions CRM
  // ─────────────────────────────────────────────────────────────────────────────
  VINSOLUTIONS_API_URL: z.string().url().optional(),
  VINSOLUTIONS_API_KEY: z.string().optional(),
  VINSOLUTIONS_DEALER_ID: z.string().optional(),
  VINSOLUTIONS_WEBHOOK_SECRET: z.string().min(16).optional(),

  // ─────────────────────────────────────────────────────────────────────────────
  // OPTIONAL: Vehicle Images
  // ─────────────────────────────────────────────────────────────────────────────
  PEXELS_API_KEY: z.string().optional(),

  // ─────────────────────────────────────────────────────────────────────────────
  // OPTIONAL: Sentry Error Tracking
  // ─────────────────────────────────────────────────────────────────────────────
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // ─────────────────────────────────────────────────────────────────────────────
  // OPTIONAL: Monitoring
  // ─────────────────────────────────────────────────────────────────────────────
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  MONITORING_WEBHOOK_URL: z.string().url().optional(),
  HEALTH_CHECK_SECRET: z.string().optional(),

  // ─────────────────────────────────────────────────────────────────────────────
  // System
  // ─────────────────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),
});

// Partial schema for development (only truly required vars)
const devEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

// =============================================================================
// TYPES
// =============================================================================

export type EnvConfig = z.infer<typeof envSchema>;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingOptional: string[];
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate environment variables with detailed error messages
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingOptional: string[] = [];

  const isProduction = process.env.NODE_ENV === 'production';
  const schema = isProduction ? envSchema : devEnvSchema;

  // Get all env vars (filter only expected ones to avoid leaking sensitive data)
  const env = Object.fromEntries(
    Object.keys(envSchema.shape).map((key) => [key, process.env[key]])
  );

  const result = schema.safeParse(env);

  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      const message = `${path}: ${issue.message}`;
      
      // In dev, some missing vars are warnings not errors
      if (!isProduction && isOptionalInDev(path)) {
        warnings.push(message);
        missingOptional.push(path);
      } else {
        errors.push(message);
      }
    }
  }

  // Additional security checks
  const securityWarnings = checkSecurityBestPractices();
  warnings.push(...securityWarnings);

  // Check for Redis (recommended for production)
  if (isProduction && !process.env.UPSTASH_REDIS_REST_URL) {
    warnings.push(
      'UPSTASH_REDIS_REST_URL not set - rate limiting will use in-memory storage (not recommended for production)'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingOptional,
  };
}

/**
 * Check if a variable is optional in development
 */
function isOptionalInDev(varName: string): boolean {
  const optionalInDev = [
    'ANTHROPIC_API_KEY',
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL',
    'FORM_TOKEN_SECRET',
    'VINSOLUTIONS_API_KEY',
    'VINSOLUTIONS_API_URL',
    'VINSOLUTIONS_DEALER_ID',
    'VINSOLUTIONS_WEBHOOK_SECRET',
    'PEXELS_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ];
  return optionalInDev.includes(varName);
}

/**
 * Security best practices checks
 */
function checkSecurityBestPractices(): string[] {
  const warnings: string[] = [];

  // Check for weak secrets
  const secret = process.env.FORM_TOKEN_SECRET;
  if (secret) {
    if (secret.length < 32) {
      warnings.push('FORM_TOKEN_SECRET should be at least 32 characters');
    }
    if (/^(test|dev|secret|password|123)/i.test(secret)) {
      warnings.push('FORM_TOKEN_SECRET appears to be a weak/default value');
    }
  }

  // Check webhook secret
  const webhookSecret = process.env.VINSOLUTIONS_WEBHOOK_SECRET;
  if (webhookSecret && webhookSecret.length < 16) {
    warnings.push('VINSOLUTIONS_WEBHOOK_SECRET should be at least 16 characters');
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Ensure HTTPS for Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
      warnings.push('NEXT_PUBLIC_SUPABASE_URL should use HTTPS in production');
    }

    // Check for debug mode
    if (process.env.LOG_LEVEL === 'debug') {
      warnings.push('LOG_LEVEL is set to debug in production - consider using info or warn');
    }
  }

  return warnings;
}

/**
 * Assert environment is valid - throws in production, warns in development
 */
export function assertEnvironment(): void {
  const result = validateEnvironment();

  // Always log the validation result
  if (result.valid) {
    console.log('✅ Environment variables validated successfully');
  }

  // Log warnings
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach((w) => console.warn(`   - ${w}`));
  }

  // Handle errors
  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach((e) => console.error(`   - ${e}`));

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Environment validation failed:\n${result.errors.join('\n')}`
      );
    } else {
      console.warn('⚠️  Continuing in development mode with invalid env vars');
    }
  }
}

/**
 * Get typed environment variable (with runtime check)
 */
export function getEnv<K extends keyof EnvConfig>(
  key: K,
  fallback?: EnvConfig[K]
): EnvConfig[K] {
  const value = process.env[key as string] as EnvConfig[K] | undefined;
  
  if (value === undefined) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  
  return value;
}

/**
 * Check if a feature is enabled based on env vars
 */
export function isFeatureEnabled(feature: 'redis' | 'crm' | 'sentry' | 'email'): boolean {
  switch (feature) {
    case 'redis':
      return !!(
        process.env.UPSTASH_REDIS_REST_URL && 
        process.env.UPSTASH_REDIS_REST_TOKEN
      );
    case 'crm':
      return !!(
        process.env.VINSOLUTIONS_API_URL && 
        process.env.VINSOLUTIONS_API_KEY
      );
    case 'sentry':
      return !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
    case 'email':
      return !!(
        process.env.SENDGRID_API_KEY && 
        process.env.SENDGRID_FROM_EMAIL
      );
    default:
      return false;
  }
}

/**
 * Get environment summary for health checks
 */
export function getEnvironmentSummary(): Record<string, boolean | string> {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    sendgridConfigured: isFeatureEnabled('email'),
    redisConfigured: isFeatureEnabled('redis'),
    crmConfigured: isFeatureEnabled('crm'),
    sentryConfigured: isFeatureEnabled('sentry'),
    csrfSecretConfigured: !!process.env.FORM_TOKEN_SECRET,
  };
}

// =============================================================================
// AUTO-VALIDATE ON IMPORT (Server-side only)
// =============================================================================

// Only run validation on server-side during module initialization
if (typeof window === 'undefined') {
  // Delay validation to ensure all env vars are loaded
  setImmediate(() => {
    try {
      assertEnvironment();
    } catch (error) {
      // In production, this will throw and crash the app (which is desired)
      // In development, it will just log warnings
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  });
}
