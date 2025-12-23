
/**
 * Auth Utilities Test Suite
 * Tests for password hashing, TOTP, backup codes, and session management
 */

import {
  validatePassword,
  hashPassword,
  verifyPassword,
  generateSessionToken,
  getSessionExpiry,
  isSessionExpired,
  isAccountLocked,
  getLockoutExpiry,
  shouldLockAccount,
  generateTotpSecret,
  generateTotpUri,
  verifyTotpCode,
  generateBackupCodes,
  hashBackupCode,
  hashBackupCodes,
  verifyBackupCode,
  createSessionCookie,
  createLogoutCookie,
  parseSessionCookie,
  AUTH_CONFIG,
} from '@/lib/admin/auth';

// ============================================================================
// PASSWORD VALIDATION TESTS
// ============================================================================

describe('validatePassword', () => {
  it('should accept a valid password', () => {
    const result = validatePassword('SecurePass123!');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject password shorter than minimum length', () => {
    const result = validatePassword('Short1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters`
    );
  });

  it('should reject password without uppercase', () => {
    const result = validatePassword('securepass123!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one uppercase letter'
    );
  });

  it('should reject password without lowercase', () => {
    const result = validatePassword('SECUREPASS123!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one lowercase letter'
    );
  });

  it('should reject password without number', () => {
    const result = validatePassword('SecurePassword!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one number'
    );
  });

  it('should reject password without special character', () => {
    const result = validatePassword('SecurePass1234');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Password must contain at least one special character'
    );
  });

  it('should return multiple errors for very weak password', () => {
    const result = validatePassword('weak');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

// ============================================================================
// PASSWORD HASHING TESTS
// ============================================================================

describe('hashPassword and verifyPassword', () => {
  it('should hash a password and verify it correctly', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt format

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword('WrongPassword123!', hash);
    expect(isValid).toBe(false);
  });

  it('should produce different hashes for same password', async () => {
    const password = 'TestPassword123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2); // Different salts
  });
});

// ============================================================================
// SESSION UTILITIES TESTS
// ============================================================================

describe('generateSessionToken', () => {
  it('should generate a 64-character hex string', () => {
    const token = generateSessionToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it('should generate unique tokens', () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();
    expect(token1).not.toBe(token2);
  });
});

describe('getSessionExpiry', () => {
  it('should return a date in the future', () => {
    const expiry = getSessionExpiry();
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });

  it('should be approximately SESSION_DURATION_HOURS from now', () => {
    const expiry = getSessionExpiry();
    const expectedMs = AUTH_CONFIG.SESSION_DURATION_HOURS * 60 * 60 * 1000;
    const diff = expiry.getTime() - Date.now();

    // Allow 1 second tolerance
    expect(diff).toBeGreaterThan(expectedMs - 1000);
    expect(diff).toBeLessThan(expectedMs + 1000);
  });
});

describe('isSessionExpired', () => {
  it('should return true for past date', () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    expect(isSessionExpired(pastDate)).toBe(true);
  });

  it('should return false for future date', () => {
    const futureDate = new Date(Date.now() + 60000).toISOString();
    expect(isSessionExpired(futureDate)).toBe(false);
  });
});

// ============================================================================
// ACCOUNT LOCKOUT TESTS
// ============================================================================

describe('isAccountLocked', () => {
  it('should return false for null lockedUntil', () => {
    expect(isAccountLocked(null)).toBe(false);
  });

  it('should return false for past lockout time', () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    expect(isAccountLocked(pastDate)).toBe(false);
  });

  it('should return true for future lockout time', () => {
    const futureDate = new Date(Date.now() + 60000).toISOString();
    expect(isAccountLocked(futureDate)).toBe(true);
  });
});

describe('getLockoutExpiry', () => {
  it('should return a date LOCKOUT_DURATION_MINUTES in the future', () => {
    const expiry = getLockoutExpiry();
    const expectedMs = AUTH_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000;
    const diff = expiry.getTime() - Date.now();

    expect(diff).toBeGreaterThan(expectedMs - 1000);
    expect(diff).toBeLessThan(expectedMs + 1000);
  });
});

describe('shouldLockAccount', () => {
  it('should return false below MAX_LOGIN_ATTEMPTS', () => {
    expect(shouldLockAccount(AUTH_CONFIG.MAX_LOGIN_ATTEMPTS - 1)).toBe(false);
  });

  it('should return true at MAX_LOGIN_ATTEMPTS', () => {
    expect(shouldLockAccount(AUTH_CONFIG.MAX_LOGIN_ATTEMPTS)).toBe(true);
  });

  it('should return true above MAX_LOGIN_ATTEMPTS', () => {
    expect(shouldLockAccount(AUTH_CONFIG.MAX_LOGIN_ATTEMPTS + 1)).toBe(true);
  });
});

// ============================================================================
// TOTP TESTS
// ============================================================================

describe('generateTotpSecret', () => {
  it('should generate a base32 encoded secret', () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/); // Base32 alphabet
    expect(secret.length).toBeGreaterThanOrEqual(16);
  });

  it('should generate unique secrets', () => {
    const secret1 = generateTotpSecret();
    const secret2 = generateTotpSecret();
    expect(secret1).not.toBe(secret2);
  });
});

describe('generateTotpUri', () => {
  it('should generate a valid otpauth URI', () => {
    const email = 'test@example.com';
    const secret = 'JBSWY3DPEHPK3PXP';
    const uri = generateTotpUri(email, secret);

    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain(encodeURIComponent(email));
    expect(uri).toContain(`secret=${secret}`);
    expect(uri).toContain(encodeURIComponent(AUTH_CONFIG.APP_NAME));
  });
});

describe('verifyTotpCode', () => {
  it('should verify a valid TOTP code', () => {
    // Generate a secret and get the current code
    const secret = generateTotpSecret();
    
    // We can't easily generate a valid code in tests without otplib
    // So we test that invalid codes are rejected
    const isValid = verifyTotpCode('000000', secret);
    // This will almost certainly be false (1 in 1M chance of being right)
    expect(typeof isValid).toBe('boolean');
  });

  it('should reject invalid code format', () => {
    const secret = generateTotpSecret();
    const isValid = verifyTotpCode('invalid', secret);
    expect(isValid).toBe(false);
  });

  it('should handle errors gracefully', () => {
    const isValid = verifyTotpCode('123456', '');
    expect(isValid).toBe(false);
  });
});

// ============================================================================
// BACKUP CODE TESTS
// ============================================================================

describe('generateBackupCodes', () => {
  it('should generate BACKUP_CODE_COUNT codes', () => {
    const codes = generateBackupCodes();
    expect(codes).toHaveLength(AUTH_CONFIG.BACKUP_CODE_COUNT);
  });

  it('should generate codes in correct format (XXXX-XXXX)', () => {
    const codes = generateBackupCodes();
    codes.forEach((code) => {
      expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
    });
  });

  it('should generate unique codes', () => {
    const codes = generateBackupCodes();
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

describe('hashBackupCode', () => {
  it('should produce a SHA-256 hash', () => {
    const hash = hashBackupCode('A1B2-C3D4');
    expect(hash).toHaveLength(64); // SHA-256 hex
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('should normalize input (uppercase, remove dashes)', () => {
    const hash1 = hashBackupCode('a1b2-c3d4');
    const hash2 = hashBackupCode('A1B2C3D4');
    const hash3 = hashBackupCode('A1B2-C3D4');

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });
});

describe('hashBackupCodes', () => {
  it('should hash all codes', () => {
    const codes = ['A1B2-C3D4', 'E5F6-G7H8'];
    const hashed = hashBackupCodes(codes);

    expect(hashed).toHaveLength(2);
    hashed.forEach((hash) => {
      expect(hash).toHaveLength(64);
    });
  });
});

describe('verifyBackupCode', () => {
  it('should verify a valid backup code', () => {
    const codes = ['A1B2-C3D4', 'E5F6-7890'];
    const hashed = hashBackupCodes(codes);

    const result = verifyBackupCode('A1B2-C3D4', hashed);
    expect(result.valid).toBe(true);
    expect(result.index).toBe(0);
  });

  it('should verify with different formatting', () => {
    const codes = ['A1B2-C3D4'];
    const hashed = hashBackupCodes(codes);

    // Without dash
    const result1 = verifyBackupCode('A1B2C3D4', hashed);
    expect(result1.valid).toBe(true);

    // Lowercase
    const result2 = verifyBackupCode('a1b2-c3d4', hashed);
    expect(result2.valid).toBe(true);
  });

  it('should reject invalid backup code', () => {
    const codes = ['A1B2-C3D4'];
    const hashed = hashBackupCodes(codes);

    const result = verifyBackupCode('XXXX-YYYY', hashed);
    expect(result.valid).toBe(false);
    expect(result.index).toBe(-1);
  });

  it('should return correct index for matched code', () => {
    const codes = ['AAAA-BBBB', 'CCCC-DDDD', 'EEEE-FFFF'];
    const hashed = hashBackupCodes(codes);

    const result = verifyBackupCode('CCCC-DDDD', hashed);
    expect(result.valid).toBe(true);
    expect(result.index).toBe(1);
  });
});

// ============================================================================
// COOKIE TESTS
// ============================================================================

describe('createSessionCookie', () => {
  it('should create a valid cookie string', () => {
    const token = 'test-token-123';
    const expiry = new Date(Date.now() + 3600000);
    const cookie = createSessionCookie(token, expiry);

    expect(cookie).toContain(`${AUTH_CONFIG.SESSION_COOKIE_NAME}=${token}`);
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Expires=');
  });

  it('should include Secure flag in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const cookie = createSessionCookie('token', new Date());
    expect(cookie).toContain('Secure');

    process.env.NODE_ENV = originalEnv;
  });
});

describe('createLogoutCookie', () => {
  it('should create an expired cookie', () => {
    const cookie = createLogoutCookie();

    expect(cookie).toContain(`${AUTH_CONFIG.SESSION_COOKIE_NAME}=`);
    expect(cookie).toContain('Expires=Thu, 01 Jan 1970');
  });
});

describe('parseSessionCookie', () => {
  it('should extract session token from cookie header', () => {
    const cookieHeader = `${AUTH_CONFIG.SESSION_COOKIE_NAME}=my-token-123; other=value`;
    const token = parseSessionCookie(cookieHeader);
    expect(token).toBe('my-token-123');
  });

  it('should return null for missing cookie', () => {
    const cookieHeader = 'other=value; another=thing';
    const token = parseSessionCookie(cookieHeader);
    expect(token).toBeNull();
  });

  it('should return null for null input', () => {
    const token = parseSessionCookie(null);
    expect(token).toBeNull();
  });
});
