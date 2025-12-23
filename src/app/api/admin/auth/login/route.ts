import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPassword,
  isAccountLocked,
  shouldLockAccount,
  getLockoutExpiry,
  createSessionCookie,
} from '@/lib/admin/auth';
import {
  getUserByEmail,
  incrementFailedAttempts,
  resetFailedAttempts,
  lockAccount,
  updateLastLogin,
  createSession,
  logAuditEvent,
} from '@/lib/admin/adminService';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Look up user
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      // Don't reveal whether email exists
      await logAuditEvent('failed_login', request, undefined, {
        email: normalizedEmail,
        reason: 'user_not_found',
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (isAccountLocked(user.locked_until)) {
      await logAuditEvent('failed_login', request, user.id, {
        reason: 'account_locked',
      });
      return NextResponse.json(
        {
          error: 'Account is temporarily locked. Please try again later.',
          lockedUntil: user.locked_until,
        },
        { status: 423 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      // Increment failed attempts
      const attempts = await incrementFailedAttempts(user.id);

      // Check if should lock account
      if (shouldLockAccount(attempts)) {
        const lockExpiry = getLockoutExpiry();
        await lockAccount(user.id, lockExpiry);
        await logAuditEvent('account_locked', request, user.id, {
          failed_attempts: attempts,
        });
        return NextResponse.json(
          {
            error: 'Too many failed attempts. Account has been temporarily locked.',
            lockedUntil: lockExpiry.toISOString(),
          },
          { status: 423 }
        );
      }

      await logAuditEvent('failed_login', request, user.id, {
        reason: 'invalid_password',
        attempts,
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Password is valid - reset failed attempts
    await resetFailedAttempts(user.id);

    // Check if 2FA is enabled
    if (user.two_factor_enabled && user.two_factor_secret) {
      // Create a partial session (not 2FA verified yet)
      const session = await createSession(user.id, request, false);

      if (!session) {
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }

      // Set cookie for the partial session
      const response = NextResponse.json({
        success: true,
        requires2FA: true,
        message: 'Please enter your 2FA code',
      });

      response.headers.set(
        'Set-Cookie',
        createSessionCookie(session.token, session.expiresAt)
      );

      return response;
    }

    // No 2FA - create full session
    const session = await createSession(user.id, request, true);

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Update last login
    await updateLastLogin(user.id);

    // Log successful login
    await logAuditEvent('login', request, user.id);

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      requires2FA: false,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    response.headers.set(
      'Set-Cookie',
      createSessionCookie(session.token, session.expiresAt)
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
