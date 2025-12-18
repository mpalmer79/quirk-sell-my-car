/**
 * Security Module Index
 * Central export point for all security utilities
 */

// Validation
export {
  vinSchema,
  chatMessageSchema,
  chatRequestSchema,
  vehicleBasicsSchema,
  vehicleConditionSchema,
  contactInfoSchema,
  leadSubmissionSchema,
  validateInput,
  type ChatMessage,
  type ChatRequest,
  type VehicleBasics,
  type VehicleCondition,
  type ContactInfo,
  type LeadSubmission,
} from './validation';

// Sanitization
export {
  escapeHtml,
  stripHtml,
  sanitizeString,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeVin,
  sanitizeZipCode,
  escapeSql,
  sanitizeUrl,
  sanitizeObject,
  sanitizeForLogging,
} from './sanitize';

// Rate Limiting
export {
  checkRateLimit,
  rateLimitMiddleware,
  generateFingerprint,
  getClientIp,
  rateLimitStore,
  RATE_LIMIT_CONFIGS,
} from './rateLimit';

// Bot Protection
export {
  detectBot,
  quickBotCheck,
  generateFormToken,
  validateFormToken,
  getHoneypotFieldProps,
  HONEYPOT_CONFIG,
  HONEYPOT_CSS,
} from './botProtection';

// Audit Logging
export {
  auditLog,
  logVinLookup,
  logChatInteraction,
  logValuationRequest,
  logLeadSubmission,
  logRateLimitHit,
  logBotDetection,
  logValidationError,
  logSecurityViolation,
  getRecentLogs,
  clearLogs,
  getLogsByType,
  getLogsBySeverity,
  AuditEventType,
  AuditSeverity,
} from './auditLog';

// Environment & Secrets
export {
  validateEnv,
  getEnv,
  getApiKey,
  maskSecret,
  isFeatureEnabled,
  isProduction,
  isDevelopment,
  isTest,
  registerSecret,
  checkSecretExpiration,
  getSecretsStatus,
  canUseAiChat,
  canUseCrmIntegration,
} from './env';
