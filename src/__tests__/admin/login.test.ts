/**
 * @jest-environment node
 */

/**
 * Login API Route Test Suite
 * Tests for /api/admin/auth/login
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/auth/login/route';
import * as adminService from '@/lib/admin/adminService';
import * as auth from '@/lib/admin/auth';

// Mock the admin service
jest.mock('@/lib/admin/adminService', () => ({
  getUserByEmail: jest.fn(),
  incrementFailedAttempts: jest.fn(),
  resetFailedAttempts: jest.fn(),
  lockAccount: jest.fn(),
  updateLastLogin: jest.fn(),
  createSession: jest.fn(),
  logAuditEvent: jest.fn(),
}));

// Mock auth utilities (partial mock to keep real implementations)
jest.mock('@/lib/admin/auth', () => {
  const actual = jest.requireActual('@/lib/admin/auth');
  return {
    ...actual,
    verifyPassword: jest.fn(),
  };
});

describe('POST /api/admin/auth/login', () => {
  const mockUser = {
    id: 'user-123',
    email: 'admin@quirkcars.com',
    password_hash: '$2a$12$hashedpassword',
    role: 'admin',
    two_factor_enabled: false,
    two_factor_secret: null,
    backup_codes: null,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSession = {
    token: 'session-token-123',
    expiresAt: new Date(Date.now() + 86400000),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createRequest(body: object): NextRequest {
    return new NextRequest('http://localhost/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  // ============================================
  // INPUT VALIDATION TESTS
  // ============================================

  describe('Input Validation', () => {
    it('should return 400 if email is missing', async () => {
      const request = createRequest({ password: 'password123' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const request = createRequest({ email: 'admin@quirkcars.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('should return 400 if both email and password are missing', async () => {
      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });
  });

  // ============================================
  // USER LOOKUP TESTS
  // ============================================

  describe('User Lookup', () => {
    it('should return 401 if user not found', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      const request = createRequest({
        email: 'nonexistent@example.com',
        password: 'password123',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid email or password');
      expect(adminService.logAuditEvent).toHaveBeenCalledWith(
        'failed_login',
        expect.anything(),
        undefined,
        expect.objectContaining({ reason: 'user_not_found' })
      );
    });

    it('should normalize email to lowercase', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      const request = createRequest({
        email: 'ADMIN@QuirkCars.COM',
        password: 'password123',
      });
      await POST(request);

      expect(adminService.getUserByEmail).toHaveBeenCalledWith('admin@quirkcars.com');
    });
  });

  // ============================================
  // ACCOUNT LOCKOUT TESTS
  // ============================================

  describe('Account Lockout', () => {
    it('should return 423 if account is locked', async () => {
      const lockedUser = {
        ...mockUser,
        locked_until: new Date(Date.now() + 900000).toISOString(), // 15 min from now
      };
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(lockedUser);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'password123',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(423);
      expect(data.error).toContain('temporarily locked');
      expect(data.lockedUntil).toBeDefined();
    });

    it('should lock account after max failed attempts', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(false);
      (adminService.incrementFailedAttempts as jest.Mock).mockResolvedValue(5); // MAX_LOGIN_ATTEMPTS

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'wrongpassword',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(423);
      expect(data.error).toContain('Too many failed attempts');
      expect(adminService.lockAccount).toHaveBeenCalled();
      expect(adminService.logAuditEvent).toHaveBeenCalledWith(
        'account_locked',
        expect.anything(),
        mockUser.id,
        expect.anything()
      );
    });
  });

  // ============================================
  // PASSWORD VERIFICATION TESTS
  // ============================================

  describe('Password Verification', () => {
    it('should return 401 for invalid password', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(false);
      (adminService.incrementFailedAttempts as jest.Mock).mockResolvedValue(1);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'wrongpassword',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid email or password');
      expect(adminService.incrementFailedAttempts).toHaveBeenCalledWith(mockUser.id);
    });

    it('should reset failed attempts on successful login', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(true);
      (adminService.createSession as jest.Mock).mockResolvedValue(mockSession);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'correctpassword',
      });
      await POST(request);

      expect(adminService.resetFailedAttempts).toHaveBeenCalledWith(mockUser.id);
    });
  });

  // ============================================
  // SUCCESSFUL LOGIN TESTS (NO 2FA)
  // ============================================

  describe('Successful Login (No 2FA)', () => {
    it('should return success and set session cookie', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(true);
      (adminService.createSession as jest.Mock).mockResolvedValue(mockSession);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'correctpassword',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.requires2FA).toBe(false);
      expect(data.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      // Check cookie is set
      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toContain('admin_session=');
    });

    it('should update last login timestamp', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(true);
      (adminService.createSession as jest.Mock).mockResolvedValue(mockSession);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'correctpassword',
      });
      await POST(request);

      expect(adminService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should log successful login', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(true);
      (adminService.createSession as jest.Mock).mockResolvedValue(mockSession);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'correctpassword',
      });
      await POST(request);

      expect(adminService.logAuditEvent).toHaveBeenCalledWith(
        'login',
        expect.anything(),
        mockUser.id
      );
    });
  });

  // ============================================
  // 2FA REQUIRED TESTS
  // ============================================

  describe('2FA Required', () => {
    const userWith2FA = {
      ...mockUser,
      two_factor_enabled: true,
      two_factor_secret: 'JBSWY3DPEHPK3PXP',
    };

    it('should return requires2FA flag when 2FA is enabled', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(userWith2FA);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(true);
      (adminService.createSession as jest.Mock).mockResolvedValue(mockSession);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'correctpassword',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.requires2FA).toBe(true);
      expect(data.message).toBe('Please enter your 2FA code');
    });

    it('should create partial session (not 2FA verified) when 2FA required', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(userWith2FA);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(true);
      (adminService.createSession as jest.Mock).mockResolvedValue(mockSession);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'correctpassword',
      });
      await POST(request);

      // Should create session with twoFactorVerified = false
      expect(adminService.createSession).toHaveBeenCalledWith(
        userWith2FA.id,
        expect.anything(),
        false
      );
    });

    it('should NOT update last login when 2FA is pending', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(userWith2FA);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(true);
      (adminService.createSession as jest.Mock).mockResolvedValue(mockSession);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'correctpassword',
      });
      await POST(request);

      // Should NOT call updateLastLogin until 2FA is verified
      expect(adminService.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    it('should return 500 if session creation fails', async () => {
      (adminService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyPassword as jest.Mock).mockResolvedValue(true);
      (adminService.createSession as jest.Mock).mockResolvedValue(null);

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'correctpassword',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create session');
    });

    it('should return 500 for unexpected errors', async () => {
      (adminService.getUserByEmail as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = createRequest({
        email: 'admin@quirkcars.com',
        password: 'password123',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
