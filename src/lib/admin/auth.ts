import { authenticator } from 'otplib';
import { randomBytes, createHash } from 'crypto';
import bcrypt from 'bcryptjs';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const AUTH_CONFIG = {
  SESSION_DURATION_HOURS: 24,
  SESSION_COOKIE_NAME: 'admin_session',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  MIN_PASSWORD_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  BACKUP_CODE_COUNT: 10,
  BACKUP_CODE_LENGTH: 8,
  TOTP_WINDOW: 1,
  APP_NAME: 'Quirk Admin',
  BCRYPT_ROUNDS: 12,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
};

// Configure otplib
authenticator.options = {
  window: AUTH_CONFIG.TOTP_WINDOW,
};

// ============================================================================
// PASSWORD UTILITIES
// ============================================================================

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters`);
  }
  if (AUTH_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (AUTH_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (AUTH_CONFIG.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (AUTH_CONFIG.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// SESSION UTILITIES
// ============================================================================

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function getSessionExpiry(): Date {
  return new Date(Date.now() + AUTH_CONFIG.SESSION_DURATION_HOURS * 60 * 60 * 1000);
}

export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

// ============================================================================
// PASSWORD RESET TOKENS
// ============================================================================

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getResetTokenExpiry(): Date {
  return new Date(Date.now() + AUTH_CONFIG.PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);
}

export function isResetTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

// ============================================================================
// ACCOUNT LOCKOUT
// ============================================================================

export function isAccountLocked(lockedUntil: string | null): boolean {
  if (!lockedUntil) return false;
  return new Date(lockedUntil) > new Date();
}

export function getLockoutExpiry(): Date {
  return new Date(Date.now() + AUTH_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000);
}

export function shouldLockAccount(failedAttempts: number): boolean {
  return failedAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS;
}

// ============================================================================
// 2FA - TOTP UTILITIES
// ============================================================================

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function generateTotpUri(email: string, secret: string): string {
  return authenticator.keyuri(email, AUTH_CONFIG.APP_NAME, secret);
}

export function verifyTotpCode(code: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: code, secret });
  } catch {
    return false;
  }
}

// ============================================================================
// 2FA - BACKUP CODES
// ============================================================================

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < AUTH_CONFIG.BACKUP_CODE_COUNT; i++) {
    // Generate readable backup codes like "A1B2-C3D4"
    const code = randomBytes(4)
      .toString('hex')
      .toUpperCase()
      .replace(/(.{4})(.{4})/, '$1-$2');
    codes.push(code);
  }
  return codes;
}

export function hashBackupCode(code: string): string {
  // Normalize: uppercase and remove dashes
  const normalized = code.toUpperCase().replace(/-/g, '');
  return createHash('sha256').update(normalized).digest('hex');
}

export function hashBackupCodes(codes: string[]): string[] {
  return codes.map(hashBackupCode);
}

export function verifyBackupCode(inputCode: string, hashedCodes: string[]): { valid: boolean; index: number } {
  const inputHash = hashBackupCode(inputCode);
  const index = hashedCodes.findIndex((hash) => hash === inputHash);
  return { valid: index !== -1, index };
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export type AuditAction =
  | 'login'
  | 'logout'
  | 'failed_login'
  | 'password_change'
  | 'password_reset_request'
  | 'password_reset_complete'
  | '2fa_setup_started'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verified'
  | '2fa_failed'
  | 'backup_code_used'
  | 'session_revoked'
  | 'account_locked'
  | 'account_unlocked';

// ============================================================================
// REQUEST HELPERS
// ============================================================================

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

// ============================================================================
// COOKIE HELPERS
// ============================================================================

export function createSessionCookie(token: string, expiresAt: Date): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${AUTH_CONFIG.SESSION_COOKIE_NAME}=${token}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (isProduction) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function createLogoutCookie(): string {
  return `${AUTH_CONFIG.SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );
  return cookies[AUTH_CONFIG.SESSION_COOKIE_NAME] || null;
}
