
/**
 * 2FA Setup API Route Test Suite
 * Tests for /api/admin/auth/2fa/setup
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/auth/2fa/setup/route';
import * as adminService from '@/lib/admin/adminService';
import * as auth from '@/lib/admin/auth';

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockQRcode'),
}));

// Mock the admin service
jest.mock('@/lib/admin/adminService', () => ({
  getSessionByToken: jest.fn(),
  getUserById: jest.fn(),
  storeTempSecret: jest.fn(),
  logAuditEvent: jest.fn(),
}));

// Mock auth utilities
jest.mock('@/lib/admin/auth', () => {
  const actual = jest.requireActual('@/lib/admin/auth');
  return {
    ...actual,
    parseSessionCookie: jest.fn(),
    generateTotpSecret: jest.fn().mockReturnValue('GENERATED_SECRET_123'),
    generateTotpUri: jest.fn().mockReturnValue('otpauth://totp/test'),
    generateBackupCodes: jest.fn().mockReturnValue([
      'A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0',
      'U1V2-W3X4', 'Y5Z6-A7B8', 'C9D0-E1F2', 'G3H4-I5J6', 'K7L8-M9N0',
    ]),
  };
});

describe('POST /api/admin/auth/2fa/setup', () => {
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
    id: 'session-id',
    user_id: 'user-123',
    token: 'session-token-123',
    two_factor_verified: true, // Must be verified to set up 2FA
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    ip_address: '127.0.0.1',
    user_agent: 'test-agent',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createRequest(cookieToken?: string): NextRequest {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (cookieToken) {
      headers['Cookie'] = `admin_session=${cookieToken}`;
    }

    return new NextRequest('http://localhost/api/admin/auth/2fa/setup', {
      method: 'POST',
      headers,
    });
  }

  // ============================================
  // AUTHENTICATION TESTS
  // ============================================

  describe('Authentication', () => {
    it('should return 401 if no session cookie', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue(null);

      const request = createRequest();
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Not authenticated');
    });

    it('should return 401 if session not found', async () => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('invalid-token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(null);

      const request = createRequest('invalid-token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid session');
    });

    it('should return 401 if session is expired', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: new Date(Date.now() - 1000).toISOString(),
      };

      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(expiredSession);

      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Session expired');
    });

    it('should return 403 if session not 2FA verified', async () => {
      const unverifiedSession = {
        ...mockSession,
        two_factor_verified: false,
      };

      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(unverifiedSession);

      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('2FA verification');
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

      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 400 if 2FA already enabled', async () => {
      const userWith2FA = {
        ...mockUser,
        two_factor_enabled: true,
      };

      (adminService.getUserById as jest.Mock).mockResolvedValue(userWith2FA);

      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already enabled');
    });
  });

  // ============================================
  // SUCCESSFUL SETUP TESTS
  // ============================================

  describe('Successful Setup', () => {
    beforeEach(() => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (adminService.storeTempSecret as jest.Mock).mockResolvedValue(true);
    });

    it('should generate and return TOTP secret', async () => {
      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.secret).toBe('GENERATED_SECRET_123');
    });

    it('should generate and return QR code', async () => {
      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(data.qrCodeUrl).toContain('data:image/png;base64');
    });

    it('should generate and return backup codes', async () => {
      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(data.backupCodes).toHaveLength(10);
      expect(data.backupCodes[0]).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });

    it('should store temporary secret', async () => {
      const request = createRequest('token');
      await POST(request);

      expect(adminService.storeTempSecret).toHaveBeenCalledWith(
        mockUser.id,
        'GENERATED_SECRET_123'
      );
    });

    it('should log 2FA setup started', async () => {
      const request = createRequest('token');
      await POST(request);

      expect(adminService.logAuditEvent).toHaveBeenCalledWith(
        '2fa_setup_started',
        expect.anything(),
        mockUser.id
      );
    });

    it('should return helpful message', async () => {
      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(data.message).toContain('Scan the QR code');
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    beforeEach(() => {
      (auth.parseSessionCookie as jest.Mock).mockReturnValue('token');
      (adminService.getSessionByToken as jest.Mock).mockResolvedValue(mockSession);
      (adminService.getUserById as jest.Mock).mockResolvedValue(mockUser);
    });

    it('should return 500 if storing secret fails', async () => {
      (adminService.storeTempSecret as jest.Mock).mockResolvedValue(false);

      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to initialize');
    });

    it('should return 500 for unexpected errors', async () => {
      (adminService.storeTempSecret as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = createRequest('token');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
