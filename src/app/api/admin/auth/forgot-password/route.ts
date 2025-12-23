import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import {
  getUserByEmail,
  createPasswordResetToken,
  logAuditEvent,
} from '@/lib/admin/adminService';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || '';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Quirk Auto';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://quirk-sell-my-car.vercel.app';

// Rate limiting: track recent requests per email
const recentRequests = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const lastRequest = recentRequests.get(email);
  
  if (!lastRequest) {
    recentRequests.set(email, now);
    return false;
  }
  
  if (now - lastRequest < RATE_LIMIT_WINDOW_MS) {
    return true;
  }
  
  recentRequests.set(email, now);
  return false;
}

function buildResetEmailHtml(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #00264d; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset Request</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 20px 0;">You requested to reset your password for the Quirk Admin Dashboard.</p>
        
        <p style="margin: 0 0 20px 0;">Click the button below to set a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: #0070cc; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin: 0 0 20px 0; word-break: break-all; color: #0070cc; font-size: 14px;">
          ${resetUrl}
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <p style="margin: 0; color: #666; font-size: 13px;">
          <strong>This link expires in 1 hour.</strong>
        </p>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 13px;">
          If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p style="margin: 0;">Quirk Auto Dealers</p>
        <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (isRateLimited(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    // Always return success to prevent email enumeration
    // But only actually send email if user exists
    const successResponse = NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });

    // Check if user exists
    const user = await getUserByEmail(normalizedEmail);
    
    if (!user) {
      // Log attempt but don't reveal user doesn't exist
      await logAuditEvent('password_reset_request', request, undefined, {
        email: normalizedEmail,
        user_found: false,
      });
      return successResponse;
    }

    // Create reset token
    const tokenResult = await createPasswordResetToken(user.id);
    
    if (!tokenResult) {
      console.error('Failed to create password reset token');
      // Still return success to prevent enumeration
      return successResponse;
    }

    // Log the reset request
    await logAuditEvent('password_reset_request', request, user.id, {
      email: normalizedEmail,
      user_found: true,
      token_created: true,
    });

    // Check SendGrid configuration
    if (!SENDGRID_API_KEY || !FROM_EMAIL) {
      console.error('SendGrid not configured for password reset emails');
      return successResponse;
    }

    // Build reset URL
    const resetUrl = `${APP_URL}/admin/reset-password?token=${tokenResult.token}`;

    // Send email
    try {
      sgMail.setApiKey(SENDGRID_API_KEY);
      
      await sgMail.send({
        to: normalizedEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Reset Your Quirk Admin Password',
        html: buildResetEmailHtml(resetUrl),
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to prevent enumeration
    }

    return successResponse;
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
