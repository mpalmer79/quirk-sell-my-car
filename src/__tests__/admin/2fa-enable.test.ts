/**
 * @jest-environment node
 */

/**
 * 2FA Enable/Disable API Route Test Suite
 * Tests for /api/admin/auth/2fa/enable (POST and DELETE)
 */

import { NextRequest } from 'next/server';
import { POST, DELETE } from '@/app/api/admin/auth/2fa/enable/route';
import * as adminService from '@/lib/admin/adminService';
import * as auth from '@/lib/admin/auth';

// Mock the admin service
jest.mock('@/lib/admin/adminService', () => ({
  getSessionByToken: jest.fn(),
  getUserById: jest.fn(),
  enable2FA: jest.fn(),
  disable2FA: jest.fn(),
  logAuditEvent: jest.fn(),
}));

// Mock auth utilities
jest.mock('@/lib/admin/auth', () => {
  const actual = jest.requireActual('@/lib/admin/auth');
  return {
    ...actual,
    parseSessionCookie: jest.fn(),
    verifyTotpCode: jest.fn(),
    generateBackupCodes: jest.fn().mockReturnValue([
      'A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0',
      'U1V2-W3X4', 'Y5Z6-A7B8', 'C9D0-E1F2', 'G3H4-I5J6', 'K7L8-M9N0',
    ]),
  };
});

describe('2FA Enable/Disable API', () => {
  const mockUserWithSecret = {
    id: 'user-123',
    email: 'admin@quirkcars.com',
    password_hash: '$2a$12$hashedpassword',
    role: 'admin',
    two_factor_enabled: false,
    two_factor_secret: 'JBSWY3DPEHPK3PXP', // Has secret from setup
    backup_codes: null,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockUserWith2FA = {
    ...mockUserWithSecret,
    two_factor_enabled: true,
    backup_codes: ['hash1', 'hash2', 'hash3'],
  };

  const mockSession = {
    id: 'session-id',
    user_id: 'user-123',
    token: 'session-token-123',
    two_factor_verified: true,
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

    return new NextRequest('http://localhost/api/admin/auth/2fa/enable', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  // ============================================================================
  // POST /api/admin/auth/2fa/enable (ENABLE 2FA)
  // ============================================================================

  describe('POST - Enable 2FA', () => {
    // ============================================
    // INPUT VALIDATION TESTS
    // ============================================

    describe('Input Validation', () => {
      it('should return 400 if code is missing', async () => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');

        const request = createRequest({}, 'token');
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
        expect(data.error).toBe('Not authenticated');
      });

      it('should return 401 if session invalid or expired', async () => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(null);

        const request = createRequest({ code: '123456' }, 'token');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toContain('Invalid');
      });

      it('should return 403 if session not 2FA verified', async () => {
        const unverifiedSession = { ...mockSession, two_factor_verified: false };

        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(unverifiedSession);

        const request = createRequest({ code: '123456' }, 'token');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(403);
      });
    });

    // ============================================
    // USER VALIDATION TESTS
    // ============================================

    describe('User Validation', () => {
      beforeEach(() => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      });

      it('should return 404 if user not found', async () => {
        (adminService.getUserById as jest.Mock).mockResolvedValue(null);

        const request = createRequest({ code: '123456' }, 'token');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('User not found');
      });

      it('should return 400 if no secret from setup', async () => {
        const userWithoutSecret = { ...mockUserWithSecret, two_factor_secret: null };
        (adminService.getUserById as jest.Mock).mockResolvedValue(userWithoutSecret);

        const request = createRequest({ code: '123456' }, 'token');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('setup first');
      });

      it('should return 400 if 2FA already enabled', async () => {
        (adminService.getUserById as jest.Mock).mockResolvedValue(mockUserWith2FA);

        const request = createRequest({ code: '123456' }, 'token');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('already enabled');
      });
    });

    // ============================================
    // TOTP VERIFICATION TESTS
    // ============================================

    describe('TOTP Verification', () => {
      beforeEach(() => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
        (adminService.getUserById as jest.Mock).mockResolvedValue(mockUserWithSecret);
      });

      it('should reject invalid TOTP code', async () => {
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(false);

        const request = createRequest({ code: '000000' }, 'token');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid verification code');
        expect(adminService.logAuditEvent).toHaveBeenCalledWith(
          '2fa_failed',
          expect.anything(),
          mockUserWithSecret.id,
          expect.objectContaining({ stage: 'enable' })
        );
      });

      it('should enable 2FA with valid code', async () => {
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);
        (adminService.enable2FA as jest.Mock).mockResolvedValue(true);

        const request = createRequest({ code: '123456' }, 'token');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('enabled successfully');
        expect(data.backupCodes).toHaveLength(10);
      });

      it('should call enable2FA with backup codes', async () => {
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);
        (adminService.enable2FA as jest.Mock).mockResolvedValue(true);

        const request = createRequest({ code: '123456' }, 'token');
        await POST(request);

        expect(adminService.enable2FA).toHaveBeenCalledWith(
          mockUserWithSecret.id,
          expect.arrayContaining([expect.stringMatching(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/)])
        );
      });

      it('should log 2FA enabled event', async () => {
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);
        (adminService.enable2FA as jest.Mock).mockResolvedValue(true);

        const request = createRequest({ code: '123456' }, 'token');
        await POST(request);

        expect(adminService.logAuditEvent).toHaveBeenCalledWith(
          '2fa_enabled',
          expect.anything(),
          mockUserWithSecret.id
        );
      });
    });

    // ============================================
    // ERROR HANDLING TESTS
    // ============================================

    describe('Error Handling', () => {
      beforeEach(() => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
        (adminService.getUserById as jest.Mock).mockResolvedValue(mockUserWithSecret);
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);
      });

      it('should return 500 if enable2FA fails', async () => {
        (adminService.enable2FA as jest.Mock).mockResolvedValue(false);

        const request = createRequest({ code: '123456' }, 'token');
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to enable 2FA');
      });

      it('should return 500 for unexpected errors', async () => {
        (adminService.enable2FA as jest.Mock).mockRejectedValue(
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

  // ============================================================================
  // DELETE /api/admin/auth/2fa/enable (DISABLE 2FA)
  // ============================================================================

  describe('DELETE - Disable 2FA', () => {
    function createDeleteRequest(body: object, cookieToken?: string): NextRequest {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (cookieToken) {
        headers['Cookie'] = `admin_session=${cookieToken}`;
      }

      return new NextRequest('http://localhost/api/admin/auth/2fa/enable', {
        method: 'DELETE',
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

        const request = createDeleteRequest({}, 'token');
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('code is required');
      });
    });

    // ============================================
    // AUTHENTICATION TESTS
    // ============================================

    describe('Authentication', () => {
      it('should return 401 if no session cookie', async () => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue(null);

        const request = createDeleteRequest({ code: '123456' });
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(401);
      });

      it('should return 403 if session not 2FA verified', async () => {
        const unverifiedSession = { ...mockSession, two_factor_verified: false };

        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(unverifiedSession);

        const request = createDeleteRequest({ code: '123456' }, 'token');
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(403);
      });
    });

    // ============================================
    // USER VALIDATION TESTS
    // ============================================

    describe('User Validation', () => {
      beforeEach(() => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      });

      it('should return 400 if 2FA is not enabled', async () => {
        (adminService.getUserById as jest.Mock).mockResolvedValue(mockUserWithSecret);

        const request = createDeleteRequest({ code: '123456' }, 'token');
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('not enabled');
      });
    });

    // ============================================
    // TOTP VERIFICATION TESTS
    // ============================================

    describe('TOTP Verification', () => {
      beforeEach(() => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
        (adminService.getUserById as jest.Mock).mockResolvedValue(mockUserWith2FA);
      });

      it('should reject invalid TOTP code', async () => {
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(false);

        const request = createDeleteRequest({ code: '000000' }, 'token');
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid verification code');
        expect(adminService.logAuditEvent).toHaveBeenCalledWith(
          '2fa_failed',
          expect.anything(),
          mockUserWith2FA.id,
          expect.objectContaining({ stage: 'disable' })
        );
      });

      it('should disable 2FA with valid code', async () => {
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);
        (adminService.disable2FA as jest.Mock).mockResolvedValue(true);

        const request = createDeleteRequest({ code: '123456' }, 'token');
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('disabled');
      });

      it('should call disable2FA', async () => {
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);
        (adminService.disable2FA as jest.Mock).mockResolvedValue(true);

        const request = createDeleteRequest({ code: '123456' }, 'token');
        await DELETE(request);

        expect(adminService.disable2FA).toHaveBeenCalledWith(mockUserWith2FA.id);
      });

      it('should log 2FA disabled event', async () => {
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);
        (adminService.disable2FA as jest.Mock).mockResolvedValue(true);

        const request = createDeleteRequest({ code: '123456' }, 'token');
        await DELETE(request);

        expect(adminService.logAuditEvent).toHaveBeenCalledWith(
          '2fa_disabled',
          expect.anything(),
          mockUserWith2FA.id
        );
      });
    });

    // ============================================
    // ERROR HANDLING TESTS
    // ============================================

    describe('Error Handling', () => {
      beforeEach(() => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
        (adminService.getUserById as jest.Mock).mockResolvedValue(mockUserWith2FA);
        (auth.verifyTotpCode as jest.Mock).mockReturnValue(true);
      });

      it('should return 500 if disable2FA fails', async () => {
        (adminService.disable2FA as jest.Mock).mockResolvedValue(false);

        const request = createDeleteRequest({ code: '123456' }, 'token');
        const response = await DELETE(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to disable 2FA');
      });
    });
  });
});
