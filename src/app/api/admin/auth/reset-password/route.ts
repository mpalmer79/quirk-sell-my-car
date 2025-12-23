import { NextRequest, NextResponse } from 'next/server';
import {
  getPasswordResetByToken,
  markResetTokenUsed,
  updateUserPassword,
  getUserById,
  deleteAllUserSessions,
  logAuditEvent,
} from '@/lib/admin/adminService';
import { validatePassword, hashPassword } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate inputs
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Verify reset token
    const resetToken = await getPasswordResetByToken(token);
    
    if (!resetToken) {
      await logAuditEvent('password_reset_complete', request, undefined, {
        success: false,
        reason: 'invalid_or_expired_token',
      });
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    // Get user to verify they still exist
    const user = await getUserById(resetToken.user_id);
    
    if (!user) {
      await logAuditEvent('password_reset_complete', request, resetToken.user_id, {
        success: false,
        reason: 'user_not_found',
      });
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const passwordHash = await hashPassword(password);

    // Update user's password
    const updateSuccess = await updateUserPassword(user.id, passwordHash);
    
    if (!updateSuccess) {
      console.error('Failed to update password for user:', user.id);
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    // Mark token as used
    await markResetTokenUsed(resetToken.id);

    // Invalidate all existing sessions for security
    await deleteAllUserSessions(user.id);

    // Log successful reset
    await logAuditEvent('password_reset_complete', request, user.id, {
      success: true,
      sessions_invalidated: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify token is valid (for UI to check before showing form)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const resetToken = await getPasswordResetByToken(token);
    
    if (!resetToken) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid or expired reset link',
      });
    }

    // Get user email for display (masked)
    const user = await getUserById(resetToken.user_id);
    const maskedEmail = user 
      ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      : undefined;

    return NextResponse.json({
      valid: true,
      email: maskedEmail,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
