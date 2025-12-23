import { NextRequest, NextResponse } from 'next/server';
import {
  verifyTotpCode,
  parseSessionCookie,
  generateBackupCodes,
} from '@/lib/admin/auth';
import {
  getSessionByToken,
  getUserById,
  enable2FA,
  disable2FA,
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
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const session = await getSessionByToken(sessionToken);

    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Session must be fully verified
    if (!session.two_factor_verified) {
      return NextResponse.json(
        { error: 'Please complete 2FA verification first' },
        { status: 403 }
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

    // Check if secret exists (from setup step)
    if (!user.two_factor_secret) {
      return NextResponse.json(
        { error: 'Please complete 2FA setup first' },
        { status: 400 }
      );
    }

    // Already enabled?
    if (user.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const isValid = verifyTotpCode(code, user.two_factor_secret);

    if (!isValid) {
      await logAuditEvent('2fa_failed', request, user.id, {
        stage: 'enable',
        reason: 'invalid_code',
      });
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Generate fresh backup codes for the user
    const backupCodes = generateBackupCodes();

    // Enable 2FA
    const enabled = await enable2FA(user.id, backupCodes);

    if (!enabled) {
      return NextResponse.json(
        { error: 'Failed to enable 2FA' },
        { status: 500 }
      );
    }

    // Log success
    await logAuditEvent('2fa_enabled', request, user.id);

    return NextResponse.json({
      success: true,
      message: '2FA has been enabled successfully',
      backupCodes, // Return codes one final time for user to save
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required to disable 2FA' },
        { status: 400 }
      );
    }

    // Get session from cookie
    const cookieHeader = request.headers.get('cookie');
    const sessionToken = parseSessionCookie(cookieHeader);

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const session = await getSessionByToken(sessionToken);

    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Session must be fully verified (including 2FA)
    if (!session.two_factor_verified) {
      return NextResponse.json(
        { error: 'Please complete 2FA verification first' },
        { status: 403 }
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

    // Check if 2FA is enabled
    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const isValid = verifyTotpCode(code, user.two_factor_secret);

    if (!isValid) {
      await logAuditEvent('2fa_failed', request, user.id, {
        stage: 'disable',
        reason: 'invalid_code',
      });
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Disable 2FA
    const disabled = await disable2FA(user.id);

    if (!disabled) {
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      );
    }

    // Log success
    await logAuditEvent('2fa_disabled', request, user.id);

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
