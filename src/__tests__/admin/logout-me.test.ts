
/**
 * Logout and Session Check API Test Suite
 * Tests for /api/admin/auth/logout and /api/admin/auth/me
 */

import { NextRequest } from 'next/server';
import { POST as logout } from '@/app/api/admin/auth/logout/route';
import { GET as getMe } from '@/app/api/admin/auth/me/route';
import * as adminService from '@/lib/admin/adminService';
import * as auth from '@/lib/admin/auth';

// Mock the admin service
jest.mock('@/lib/admin/adminService', () => ({
  getSessionByToken: jest.fn(),
  getUserById: jest.fn(),
  deleteSession: jest.fn(),
  logAuditEvent: jest.fn(),
}));

// Mock auth utilities
jest.mock('@/lib/admin/auth', () => {
  const actual = jest.requireActual('@/lib/admin/auth');
  return {
    ...actual,
    parseSessionCookie: jest.fn(),
    createLogoutCookie: jest.fn().mockReturnValue('admin_session=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT'),
  };
});

describe('Logout and Session API', () => {
  const mockUser = {
    id: 'user-123',
    email: 'admin@quirkcars.com',
    password_hash: '$2a$12$hashedpassword',
    role: 'admin',
    two_factor_enabled: true,
    two_factor_secret: 'JBSWY3DPEHPK3PXP',
    backup_codes: ['hash1', 'hash2'],
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: '2024-01-15T10:30:00Z',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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

  // ============================================================================
  // POST /api/admin/auth/logout
  // ============================================================================

  describe('POST /api/admin/auth/logout', () => {
    function createLogoutRequest(cookieToken?: string): NextRequest {
      const headers: HeadersInit = {};
      if (cookieToken) {
        headers['Cookie'] = `admin_session=${cookieToken}`;
      }

      return new NextRequest('http://localhost/api/admin/auth/logout', {
        method: 'POST',
        headers,
      });
    }

    it('should successfully logout with valid session', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('session-token-123');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.deleteSession as jest.Mock).mockResolvedValue(true);

      const request = createLogoutRequest('session-token-123');
      const response = await logout(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Logged out');
    });

    it('should delete session from database', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('session-token-123');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.deleteSession as jest.Mock).mockResolvedValue(true);

      const request = createLogoutRequest('session-token-123');
      await logout(request);

      expect(adminService.deleteSession).toHaveBeenCalledWith('session-token-123');
    });

    it('should log logout event', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('session-token-123');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.deleteSession as jest.Mock).mockResolvedValue(true);

      const request = createLogoutRequest('session-token-123');
      await logout(request);

      expect(adminService.logAuditEvent).toHaveBeenCalledWith(
        'logout',
        expect.anything(),
        mockSession.user_id
      );
    });

    it('should clear session cookie', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('session-token-123');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);

      const request = createLogoutRequest('session-token-123');
      const response = await logout(request);

      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toContain('admin_session=');
      expect(setCookie).toContain('1970'); // Expired date
    });

    it('should succeed even without session cookie', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue(null);

      const request = createLogoutRequest();
      const response = await logout(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should succeed even if session not found', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('invalid-token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(null);

      const request = createLogoutRequest('invalid-token');
      const response = await logout(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should succeed even on database error', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('session-token-123');
      (adminService.getSessionByToken as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = createLogoutRequest('session-token-123');
      const response = await logout(request);
      const data = await response.json();

      // Should still return success and clear cookie
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ============================================================================
  // GET /api/admin/auth/me
  // ============================================================================

  describe('GET /api/admin/auth/me', () => {
    function createMeRequest(cookieToken?: string): NextRequest {
      const headers: HeadersInit = {};
      if (cookieToken) {
        headers['Cookie'] = `admin_session=${cookieToken}`;
      }

      return new NextRequest('http://localhost/api/admin/auth/me', {
        method: 'GET',
        headers,
      });
    }

    // ============================================
    // AUTHENTICATION TESTS
    // ============================================

    describe('Authentication', () => {
      it('should return 401 if no session cookie', async () => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue(null);

        const request = createMeRequest();
        const response = await getMe(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.authenticated).toBe(false);
        expect(data.error).toBe('No session');
      });

      it('should return 401 if session not found', async () => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('invalid-token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(null);

        const request = createMeRequest('invalid-token');
        const response = await getMe(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.authenticated).toBe(false);
        expect(data.error).toBe('Invalid session');
      });

      it('should return 401 if session is expired', async () => {
        const expiredSession = {
          ...mockSession,
          expires_at: new Date(Date.now() - 1000).toISOString(),
        };

        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(expiredSession);

        const request = createMeRequest('token');
        const response = await getMe(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.authenticated).toBe(false);
        expect(data.error).toBe('Session expired');
      });

      it('should return 401 if user not found', async () => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
        (adminService.getUserById as jest.Mock).mockResolvedValue(null);

        const request = createMeRequest('token');
        const response = await getMe(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.authenticated).toBe(false);
        expect(data.error).toBe('User not found');
      });
    });

    // ============================================
    // SUCCESSFUL RESPONSE TESTS
    // ============================================

    describe('Successful Response', () => {
      beforeEach(() => {
        (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
        (adminService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      });

      it('should return authenticated: true', async () => {
        const request = createMeRequest('token');
        const response = await getMe(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.authenticated).toBe(true);
      });

      it('should return 2FA verification status', async () => {
        const request = createMeRequest('token');
        const response = await getMe(request);
        const data = await response.json();

        expect(data.twoFactorVerified).toBe(true);
        expect(data.twoFactorRequired).toBe(false);
      });

      it('should indicate 2FA required when not verified', async () => {
        const unverifiedSession = { ...mockSession, two_factor_verified: false };
        (adminService.getSessionByToken as jest.Mock).mockResolvedValue(unverifiedSession);

        const request = createMeRequest('token');
        const response = await getMe(request);
        const data = await response.json();

        expect(data.twoFactorVerified).toBe(false);
        expect(data.twoFactorRequired).toBe(true);
      });

      it('should return user info', async () => {
        const request = createMeRequest('token');
        const response = await getMe(request);
        const data = await response.json();

        expect(data.user).toEqual({
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          twoFactorEnabled: mockUser.two_factor_enabled,
          lastLoginAt: mockUser.last_login_at,
        });
      });

      it('should return session info', async () => {
        const request = createMeRequest('token');
        const response = await getMe(request);
        const data = await response.json();

        expect(data.session).toEqual({
          expiresAt: mockSession.expires_at,
        });
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

        const request = createMeRequest('token');
        const response = await getMe(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.authenticated).toBe(false);
        expect(data.error).toBe('Internal server error');
      });
    });
  });
});
