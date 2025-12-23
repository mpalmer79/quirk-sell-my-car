/**
 * @jest-environment node
 */

/**
 * 2FA Verification API Route Test Suite
 * Tests for /api/admin/auth/verify-2fa
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/auth/verify-2fa/route';
import * as adminService from '@/lib/admin/adminService';
import * as auth from '@/lib/admin/auth';

// Mock the admin service
jest.mock('@/lib/admin/adminService', () => ({
  getSessionByToken: jest.fn(),
  getUserById: jest.fn(),
  updateSession: jest.fn(),
  updateLastLogin: jest.fn(),
  consumeBackupCode: jest.fn(),
  logAuditEvent: jest.fn(),
}));

// Mock auth utilities
jest.mock('@/lib/admin/auth', () => {
  const actual = jest.requireActual('@/lib/admin/auth');
  return {
    ...actual,
    parseSessionCookie: jest.fn(),
    verifyTotpCode: jest.fn(),
    verifyBackupCode: jest.fn(),
  };
});

describe('POST /api/admin/auth/verify-2fa', () => {
  const mockUser = {
    id: 'user-123',
    email: 'admin@quirkcars.com',
    password_hash: '$2a$12$hashedpassword',
    role: 'admin',
    two_factor_enabled: true,
    two_factor_secret: 'JBSWY3DPEHPK3PXP',
    backup_codes: ['hash1', 'hash2', 'hash3'],
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSession = {
    id: 'session-id',
    user_id: 'user-123',
    token: 'session-token-123',
    two_factor_verified: false,
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    ip_address: '127.0.0.1',
    user_agent: 'test-agent',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createRequest(body: object, cookieToken?: string): NextRequest {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (cookieToken) {
      headers['Cookie'] = `admin_session=${cookieToken}`;
    }

    return new NextRequest('http://localhost/api/admin/auth/verify-2fa', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  // ============================================
  // INPUT VALIDATION TESTS
  // ============================================

  describe('Input Validation', () => {
    it('should return 400 if code is missing', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');

      const request = createRequest({}, 'session-token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Verification code is required');
    });
  });

  // ============================================
  // AUTHENTICATION TESTS
  // ============================================

  describe('Authentication', () => {
    it('should return 401 if no session cookie', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue(null);

      const request = createRequest({ code: '123456' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Not authenticated');
    });

    it('should return 401 if session not found', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('invalid-token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(null);

      const request = createRequest({ code: '123456' }, 'invalid-token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Invalid session');
    });

    it('should return 401 if session is expired', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: new Date(Date.now() - 1000).toISOString(),
      };

      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(expiredSession);

      const request = createRequest({ code: '123456' }, 'token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('expired');
    });

    it('should return 400 if session already 2FA verified', async () => {
      const verifiedSession = {
        ...mockSession,
        two_factor_verified: true,
      };

      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(verifiedSession);

      const request = createRequest({ code: '123456' }, 'token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already verified');
    });
  });

  // ============================================
  // USER VALIDATION TESTS
  // ============================================

  describe('User Validation', () => {
    it('should return 404 if user not found', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.getUserById as jest.Mock).mockResolvedValue(null);

      const request = createRequest({ code: '123456' }, 'token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 400 if 2FA is not enabled', async () => {
      const userWithout2FA = {
        ...mockUser,
        two_factor_enabled: false,
        two_factor_secret: null,
      };

      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.getUserById as jest.Mock).mockResolvedValue(userWithout2FA);

      const request = createRequest({ code: '123456' }, 'token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('2FA is not enabled');
    });
  });

  // ============================================
  // TOTP VERIFICATION TESTS
  // ============================================

  describe('TOTP Verification', () => {
    beforeEach(() => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.getUserById as jest.Mock).mockResolvedValue(mockUser);
    });

    it('should verify valid TOTP code', async () => {
      (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);

      const request = createRequest({ code: '123456' }, 'token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.usedBackupCode).toBe(false);
      expect(adminService.updateSession).toHaveBeenCalledWith(
        'session-token-123',
        { two_factor_verified: true }
      );
    });

    it('should reject invalid TOTP code', async () => {
      (auth.verifyTotpCode as jest.Mock).mockReturnValue(false);
      (auth.verifyBackupCode as jest.Mock).mockReturnValue({ valid: false, index: -1 });

      const request = createRequest({ code: '000000' }, 'token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid verification code');
      expect(adminService.logAuditEvent).toHaveBeenCalledWith(
        '2fa_failed',
        expect.anything(),
        mockUser.id,
        expect.objectContaining({ reason: 'invalid_code' })
      );
    });

    it('should normalize code by removing spaces and dashes', async () => {
      (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);

      const request = createRequest({ code: '123 456' }, 'token');
      await POST(request);

      expect(auth.verifyTotpCode).toHaveBeenCalledWith('123456', mockUser.two_factor_secret);
    });

    it('should update last login on successful verification', async () => {
      (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);

      const request = createRequest({ code: '123456' }, 'token');
      await POST(request);

      expect(adminService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should log successful 2FA verification', async () => {
      (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);

      const request = createRequest({ code: '123456' }, 'token');
      await POST(request);

      expect(adminService.logAuditEvent).toHaveBeenCalledWith(
        '2fa_verified',
        expect.anything(),
        mockUser.id,
        expect.objectContaining({ method: 'totp' })
      );
    });
  });

  // ============================================
  // BACKUP CODE VERIFICATION TESTS
  // ============================================

  describe('Backup Code Verification', () => {
    beforeEach(() => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.getUserById as jest.Mock).mockResolvedValue(mockUser);
    });

    it('should accept valid backup code when TOTP fails', async () => {
      (auth.verifyTotpCode as jest.Mock).mockReturnValue(false);
      (auth.verifyBackupCode as jest.Mock).mockReturnValue({ valid: true, index: 1 });

      const request = createRequest({ code: 'A1B2-C3D4' }, 'token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.usedBackupCode).toBe(true);
      expect(data.remainingBackupCodes).toBe(2); // 3 - 1
    });

    it('should consume backup code after use', async () => {
      (auth.verifyTotpCode as jest.Mock).mockReturnValue(false);
      (auth.verifyBackupCode as jest.Mock).mockReturnValue({ valid: true, index: 1 });

      const request = createRequest({ code: 'A1B2-C3D4' }, 'token');
      await POST(request);

      expect(adminService.consumeBackupCode).toHaveBeenCalledWith(
        mockUser.id,
        1,
        mockUser.backup_codes
      );
    });

    it('should log backup code usage', async () => {
      (auth.verifyTotpCode as jest.Mock).mockReturnValue(false);
      (auth.verifyBackupCode as jest.Mock).mockReturnValue({ valid: true, index: 0 });

      const request = createRequest({ code: 'A1B2-C3D4' }, 'token');
      await POST(request);

      expect(adminService.logAuditEvent).toHaveBeenCalledWith(
        'backup_code_used',
        expect.anything(),
        mockUser.id,
        expect.objectContaining({ remaining_codes: 2 })
      );

      expect(adminService.logAuditEvent).toHaveBeenCalledWith(
        '2fa_verified',
        expect.anything(),
        mockUser.id,
        expect.objectContaining({ method: 'backup_code' })
      );
    });
  });

  // ============================================
  // RESPONSE STRUCTURE TESTS
  // ============================================

  describe('Response Structure', () => {
    beforeEach(() => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);
    });

    it('should return user info on success', async () => {
      const request = createRequest({ code: '123456' }, 'token');
      const response = await POST(request);
      const data = await response.json();

      expect(data.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should refresh session cookie on success', async () => {
      const request = createRequest({ code: '123456' }, 'token');
      const response = await POST(request);

      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toContain('admin_session=');
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    it('should return 500 for unexpected errors', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = createRequest({ code: '123456' }, 'token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
