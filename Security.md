# Security Implementation Guide

## Overview

This document describes the comprehensive security measures implemented in the Quirk Sell My Car application.

## Security Components

### 1. Input Validation (`src/lib/security/validation.ts`)

All user inputs are validated using Zod schemas:

- **VIN Validation**: 17-character format, check digit validation, character restrictions
- **Chat Messages**: Length limits, suspicious pattern detection
- **Contact Info**: Email format, phone normalization, name sanitization
- **Form Data**: All fields validated before processing

**Usage:**
```typescript
import { validateInput, vinSchema, contactInfoSchema } from '@/lib/security';

const result = validateInput(vinSchema, userInput);
if (!result.success) {
  // Handle validation errors
  console.error(result.errors);
}
```

### 2. Input Sanitization (`src/lib/security/sanitize.ts`)

All inputs are sanitized to prevent XSS and injection attacks:

- `sanitizeString()` - General string cleaning
- `sanitizeName()` - Name field cleaning
- `sanitizeEmail()` - Email normalization
- `sanitizeVin()` - VIN character filtering
- `escapeHtml()` - HTML entity encoding
- `sanitizeForLogging()` - Redact sensitive data in logs

**Usage:**
```typescript
import { sanitizeString, sanitizeVin, sanitizeEmail } from '@/lib/security';

const cleanVin = sanitizeVin(userInput);
const cleanEmail = sanitizeEmail(emailInput);
```

### 3. Rate Limiting (`src/lib/security/rateLimit.ts`)

Sliding window rate limiting with request fingerprinting:

| Endpoint | Requests/Min | Block Duration |
|----------|-------------|----------------|
| `/api/chat` | 10 | 5 minutes |
| `/api/decode-vin` | 20 | 10 minutes |
| `/api/valuation` | 5 | 30 minutes |
| `/api/submit-lead` | 3/hour | 24 hours |

**Features:**
- IP + User Agent fingerprinting
- Suspicion scoring for bot behavior
- Automatic temporary blocking
- Rate limit headers in responses

### 4. Bot Protection (`src/lib/security/botProtection.ts`)

Multi-layered bot detection:

1. **Honeypot Fields**: Hidden form fields that bots fill
2. **Form Timing**: Minimum/maximum submission time validation
3. **User Agent Analysis**: Known bot UA detection
4. **Behavioral Analysis**: Mouse movements, keystrokes
5. **Request Pattern Analysis**: Timing variance detection

**Client-side Hook:**
```typescript
import { useFormSecurity } from '@/hooks/useFormSecurity';

function MyForm() {
  const { honeypotProps, isFormValid, getSecurityHeaders } = useFormSecurity();
  
  const handleSubmit = async () => {
    const validation = isFormValid();
    if (!validation.valid) {
      // Bot detected
      return;
    }
    
    await fetch('/api/submit', {
      headers: getSecurityHeaders(),
      // ...
    });
  };
  
  return (
    <form>
      <input {...honeypotProps} /> {/* Hidden honeypot */}
      {/* Form fields */}
    </form>
  );
}
```

### 5. Audit Logging (`src/lib/security/auditLog.ts`)

Comprehensive event logging:

**Event Types:**
- API requests and errors
- Rate limit hits
- Bot detections
- VIN lookups
- Lead submissions
- Security violations

**Severity Levels:**
- DEBUG, INFO, WARN, ERROR, CRITICAL

**Usage:**
```typescript
import { logVinLookup, logSecurityViolation } from '@/lib/security';

logVinLookup(request, vin, success, { year: 2021, make: 'CHEVROLET' });
logSecurityViolation(request, 'Honeypot triggered', { formId: 'contact' });
```

### 6. Environment Validation (`src/lib/security/env.ts`)

Validates required environment variables at startup:

**Required Variables:**
- `NODE_ENV`: development | production | test

**Recommended Variables:**
- `ANTHROPIC_API_KEY`: For AI chat
- `FORM_TOKEN_SECRET`: For form validation (min 32 chars)
- `MONITORING_WEBHOOK_URL`: For alerting

**Feature Checks:**
```typescript
import { canUseAiChat, isFeatureEnabled } from '@/lib/security';

if (canUseAiChat().available) {
  // Use AI chat
}
```

### 7. Security Headers (`src/middleware.ts`)

All responses include security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS protection |
| Content-Security-Policy | [configured] | Restrict resource loading |
| Strict-Transport-Security | max-age=31536000 | Force HTTPS |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer |

## API Security

All API routes implement:

1. ✅ Rate limiting
2. ✅ Bot detection
3. ✅ Input validation
4. ✅ Input sanitization
5. ✅ Audit logging
6. ✅ Error handling (no sensitive info leaked)

## Deployment Checklist

### Environment Variables

```bash
# Required
NODE_ENV=production

# Security (generate with: openssl rand -hex 32)
FORM_TOKEN_SECRET=your-32-char-secret-here

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
PEXELS_API_KEY=...

# Optional but recommended
MONITORING_WEBHOOK_URL=https://hooks.slack.com/...
HEALTH_CHECK_SECRET=your-health-check-secret
```

### Pre-deployment

- [ ] All environment variables set
- [ ] FORM_TOKEN_SECRET is at least 32 characters
- [ ] MONITORING_WEBHOOK_URL configured for alerts
- [ ] Review CSP headers for your CDN/services

### Post-deployment

- [ ] Test rate limiting behavior
- [ ] Verify security headers with securityheaders.com
- [ ] Monitor `/api/health` endpoint
- [ ] Review audit logs regularly

## Monitoring

### Health Check Endpoint

```
GET /api/health
GET /api/health?verbose=true (requires auth in production)
```

Response:
```json
{
  "status": "healthy",
  "checks": [
    { "name": "ai_chat", "status": "pass" },
    { "name": "error_rate", "status": "pass" }
  ],
  "features": {
    "aiChat": true,
    "crmIntegration": false
  }
}
```

### Log Analysis

```typescript
import { getRecentLogs, getLogsBySeverity, AuditSeverity } from '@/lib/security';

// Get recent errors
const errors = getLogsBySeverity(AuditSeverity.ERROR, 50);
```

## Incident Response

### Rate Limit Block

If legitimate users are blocked:
1. Check logs for the fingerprint
2. Clear from `rateLimitStore` if needed
3. Adjust rate limits if too aggressive

### Bot Attack

If under bot attack:
1. Monitor `/api/health` for error spikes
2. Check `BOT_DETECTED` logs
3. Consider increasing suspicion thresholds
4. Enable additional Cloudflare/WAF rules

### Security Violation

For critical security violations:
1. Alerts sent to MONITORING_WEBHOOK_URL
2. Review `SECURITY_VIOLATION` logs
3. Identify attack vector
4. Apply patches as needed
