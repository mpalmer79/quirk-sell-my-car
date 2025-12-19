// Admin Authentication Utilities

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
};

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

export function getSessionExpiry(): Date {
  return new Date(Date.now() + AUTH_CONFIG.SESSION_DURATION_HOURS * 60 * 60 * 1000);
}

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
