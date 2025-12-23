import { NextRequest, NextResponse } from 'next/server';
import { parseSessionCookie } from '@/lib/admin/auth';
import { getSessionByToken, getUserById } from '@/lib/admin/adminService';

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const cookieHeader = request.headers.get('cookie');
    const sessionToken = parseSessionCookie(cookieHeader);

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false, error: 'No session' },
        { status: 401 }
      );
    }

    // Get session
    const session = await getSessionByToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { authenticated: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    // Get user
    const user = await getUserById(session.user_id);

    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: 'User not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      twoFactorVerified: session.two_factor_verified,
      twoFactorRequired: user.two_factor_enabled && !session.two_factor_verified,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.two_factor_enabled,
        lastLoginAt: user.last_login_at,
      },
      session: {
        expiresAt: session.expires_at,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
