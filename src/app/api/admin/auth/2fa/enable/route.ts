import { NextRequest, NextResponse } from 'next/server';
// TODO: Uncomment when implementing
// import { createClient } from '@supabase/supabase-js';
// import { authenticator } from 'otplib';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    // TODO: Implement enable:
    // 1. Get authenticated user from session
    // 2. Verify code against stored secret
    // 3. Set two_factor_enabled = true
    // 4. Log audit event

    // STUB RESPONSE
    return NextResponse.json({
      success: true,
      message: '2FA enable groundwork - implementation pending',
    });

  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required to disable 2FA' }, { status: 400 });
    }

    // TODO: Implement disable:
    // 1. Get authenticated user
    // 2. Verify code
    // 3. Set two_factor_enabled = false, clear secret
    // 4. Delete backup codes
    // 5. Log audit event

    // STUB RESPONSE
    return NextResponse.json({
      success: true,
      message: '2FA disable groundwork - implementation pending',
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
