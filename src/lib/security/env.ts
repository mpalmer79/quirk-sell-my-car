/**
 * Environment Validation & Secrets Governance
 * Validates required environment variables and provides secure access
 */

import { z } from 'zod';

// =============================================================================
// ENVIRONMENT SCHEMA
// =============================================================================

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // API Keys (secrets)
  ANTHROPIC_API_KEY: z
    .string()
    .startsWith('sk-ant-', 'Invalid Anthropic API key format')
    .optional(),
  
  PEXELS_API_KEY: z.string().min(10).optional(),
  
  // Security
  FORM_TOKEN_SECRET: z
    .string()
    .min(32, 'FORM_TOKEN_SECRET should be at least 32 characters')
    .optional(),
  
  // Database (future use)
  DATABASE_URL: z.string().url().optional(),
  
  // External Services
  CRM_API_URL: z.string().url().optional(),
  CRM_API_KEY: z.string().min(10).optional(),
  CRM_DEALER_ID: z.string().optional(),
  
  // Monitoring
  MONITORING_WEBHOOK_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  
  // Feature Flags
  ENABLE_AI_CHAT: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  ENABLE_LEAD_SUBMISSION: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  ENABLE_AUDIT_LOGGING: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
});

// =============================================================================
// VALIDATION
// =============================================================================

type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validate environment variables
 * Call this at application startup
 */
export function validateEnv(): { valid: boolean; errors?: string[] } {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.errors.map((err) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
    
    console.error('❌ Environment validation failed:');
    errors.forEach((err) => console.error(`   - ${err}`));
    
    return { valid: false, errors };
  }
  
  validatedEnv = result.data;
  
  // Log warnings for missing optional but recommended vars
  const warnings = [];
  
  if (!result.data.ANTHROPIC_API_KEY) {
    warnings.push('ANTHROPIC_API_KEY not set - AI chat will use fallback responses');
  }
  
  if (!result.data.FORM_TOKEN_SECRET) {
    warnings.push('FORM_TOKEN_SECRET not set - using default (not secure for production)');
  }
  
  if (!result.data.MONITORING_WEBHOOK_URL && result.data.NODE_ENV === 'production') {
    warnings.push('MONITORING_WEBHOOK_URL not set - critical events won\'t be alerted');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach((warn) => console.warn(`   - ${warn}`));
  }
  
  console.info('✅ Environment validation passed');
  
  return { valid: true };
}

/**
 * Get validated environment
 * Throws if env hasn't been validated
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    const result = validateEnv();
    if (!result.valid) {
      throw new Error('Environment validation failed. Check console for details.');
    }
  }
  
  return validatedEnv!;
}

// =============================================================================
// SECURE ACCESSORS
// =============================================================================

/**
 * Get API key with masking for logs
 */
export function getApiKey(key: 'ANTHROPIC_API_KEY' | 'PEXELS_API_KEY' | 'CRM_API_KEY'): string | undefined {
  const env = getEnv();
  return env[key];
}

/**
 * Mask a secret for safe logging
 */
export function maskSecret(secret: string | undefined): string {
  if (!secret) return '[NOT SET]';
  if (secret.length <= 8) return '****';
  return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: 'AI_CHAT' | 'LEAD_SUBMISSION' | 'AUDIT_LOGGING'): boolean {
  const env = getEnv();
  
  switch (feature) {
    case 'AI_CHAT':
      return env.ENABLE_AI_CHAT && !!env.ANTHROPIC_API_KEY;
    case 'LEAD_SUBMISSION':
      return env.ENABLE_LEAD_SUBMISSION;
    case 'AUDIT_LOGGING':
      return env.ENABLE_AUDIT_LOGGING;
    default:
      return false;
  }
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test';
}

// =============================================================================
// SECRETS ROTATION SUPPORT
// =============================================================================

interface SecretMetadata {
  key: string;
  lastRotated?: Date;
  expiresAt?: Date;
  version?: string;
}

const secretsMetadata: Map<string, SecretMetadata> = new Map();

/**
 * Register a secret with metadata
 */
export function registerSecret(
  key: string,
  metadata: Omit<SecretMetadata, 'key'>
): void {
  secretsMetadata.set(key, { key, ...metadata });
}

/**
 * Check if any secrets are expiring soon
 */
export function checkSecretExpiration(warningDays = 7): SecretMetadata[] {
  const expiringSoon: SecretMetadata[] = [];
  const now = new Date();
  const warningThreshold = new Date(now.getTime() + warningDays * 24 * 60 * 60 * 1000);
  
  for (const [, metadata] of Array.from(secretsMetadata)) {
    if (metadata.expiresAt && metadata.expiresAt < warningThreshold) {
      expiringSoon.push(metadata);
    }
  }
  
  return expiringSoon;
}

/**
 * Get secrets status for monitoring
 */
export function getSecretsStatus(): {
  configured: string[];
  missing: string[];
  expiringSoon: SecretMetadata[];
} {
  const env = getEnv();
  
  const secrets = [
    { key: 'ANTHROPIC_API_KEY', value: env.ANTHROPIC_API_KEY },
    { key: 'PEXELS_API_KEY', value: env.PEXELS_API_KEY },
    { key: 'FORM_TOKEN_SECRET', value: env.FORM_TOKEN_SECRET },
    { key: 'CRM_API_KEY', value: env.CRM_API_KEY },
    { key: 'DATABASE_URL', value: env.DATABASE_URL },
  ];
  
  const configured = secrets.filter((s) => !!s.value).map((s) => s.key);
  const missing = secrets.filter((s) => !s.value).map((s) => s.key);
  const expiringSoon = checkSecretExpiration();
  
  return { configured, missing, expiringSoon };
}

// =============================================================================
// REQUIRED ENV FOR SPECIFIC FEATURES
// =============================================================================

/**
 * Check if AI chat can be used
 */
export function canUseAiChat(): { available: boolean; reason?: string } {
  const env = getEnv();
  
  if (!env.ENABLE_AI_CHAT) {
    return { available: false, reason: 'AI chat is disabled' };
  }
  
  if (!env.ANTHROPIC_API_KEY) {
    return { available: false, reason: 'ANTHROPIC_API_KEY not configured' };
  }
  
  return { available: true };
}

/**
 * Check if CRM integration can be used
 */
export function canUseCrmIntegration(): { available: boolean; reason?: string } {
  const env = getEnv();
  
  if (!env.CRM_API_URL) {
    return { available: false, reason: 'CRM_API_URL not configured' };
  }
  
  if (!env.CRM_API_KEY) {
    return { available: false, reason: 'CRM_API_KEY not configured' };
  }
  
  return { available: true };
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Validate on module load in non-test environments
if (typeof jest === 'undefined' && process.env.NODE_ENV !== 'test') {
  validateEnv();
}
