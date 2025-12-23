import { NextRequest, NextResponse } from 'next/server';
import {
  verifyTotpCode,
  verifyBackupCode,
  parseSessionCookie,
  createSessionCookie,
} from '@/lib/admin/auth';
import {
  getSessionByToken,
  getUserById,
  updateSession,
  updateLastLogin,
  consumeBackupCode,
  logAuditEvent,
} from '@/lib/admin/adminService';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Get session from cookie
    const cookieHeader = request.headers.get('cookie');
    const sessionToken = parseSessionCookie(cookieHeader);

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in first.' },
        { status: 401 }
      );
    }

    // Get session
    const session = await getSessionByToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session. Please log in again.' },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    // Check if already verified
    if (session.two_factor_verified) {
      return NextResponse.json(
        { error: '2FA already verified for this session' },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserById(session.user_id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify 2FA is enabled
    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    // Normalize code (remove spaces and dashes)
    const normalizedCode = code.replace(/[\s-]/g, '');

    let verified = false;
    let usedBackupCode = false;
    let backupCodeIndex = -1;

    // First try TOTP verification (6 digits)
    if (/^\d{6}$/.test(normalizedCode)) {
      verified = verifyTotpCode(normalizedCode, user.two_factor_secret);
    }

    // If TOTP failed or code looks like backup code, try backup codes
    if (!verified && user.backup_codes && user.backup_codes.length > 0) {
      const backupResult = verifyBackupCode(normalizedCode, user.backup_codes);
      if (backupResult.valid) {
        verified = true;
        usedBackupCode = true;
        backupCodeIndex = backupResult.index;
      }
    }

    if (!verified) {
      await logAuditEvent('2fa_failed', request, user.id, {
        stage: 'verify',
        reason: 'invalid_code',
      });
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // If backup code was used, consume it
    if (usedBackupCode && backupCodeIndex >= 0 && user.backup_codes) {
      await consumeBackupCode(user.id, backupCodeIndex, user.backup_codes);
      await logAuditEvent('backup_code_used', request, user.id, {
        remaining_codes: user.backup_codes.length - 1,
      });
    }

    // Mark session as 2FA verified
    await updateSession(sessionToken, { two_factor_verified: true });

    // Update last login
    await updateLastLogin(user.id);

    // Log successful verification
    await logAuditEvent('2fa_verified', request, user.id, {
      method: usedBackupCode ? 'backup_code' : 'totp',
    });

    // Return success with refreshed cookie
    const response = NextResponse.json({
      success: true,
      message: '2FA verification successful',
      usedBackupCode,
      remainingBackupCodes: usedBackupCode && user.backup_codes
        ? user.backup_codes.length - 1
        : undefined,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    // Refresh the session cookie
    response.headers.set(
      'Set-Cookie',
      createSessionCookie(sessionToken, new Date(session.expires_at))
    );

    return response;
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
