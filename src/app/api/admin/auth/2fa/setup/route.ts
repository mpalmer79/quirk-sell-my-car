import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import {
  generateTotpSecret,
  generateTotpUri,
  generateBackupCodes,
  parseSessionCookie,
} from '@/lib/admin/auth';
import {
  getSessionByToken,
  getUserById,
  storeTempSecret,
  logAuditEvent,
} from '@/lib/admin/adminService';

export async function POST(request: NextRequest) {
  try {
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

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // For 2FA setup, session must be fully verified (2FA already verified or not required)
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

    // Check if 2FA is already enabled
    if (user.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled. Disable it first to set up again.' },
        { status: 400 }
      );
    }

    // Generate TOTP secret
    const secret = generateTotpSecret();

    // Generate otpauth URI for QR code
    const otpauthUri = generateTotpUri(user.email, secret);

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(otpauthUri, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Generate backup codes (we'll store them when 2FA is enabled)
    const backupCodes = generateBackupCodes();

    // Store the secret temporarily (not enabled yet)
    const stored = await storeTempSecret(user.id, secret);

    if (!stored) {
      return NextResponse.json(
        { error: 'Failed to initialize 2FA setup' },
        { status: 500 }
      );
    }

    // Log the setup attempt
    await logAuditEvent('2fa_setup_started', request, user.id);

    return NextResponse.json({
      success: true,
      secret,
      qrCodeUrl,
      backupCodes,
      message: 'Scan the QR code with your authenticator app, then verify with a code',
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
