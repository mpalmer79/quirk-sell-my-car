import { NextRequest, NextResponse } from 'next/server';
// TODO: Uncomment when implementing
// import { createClient } from '@supabase/supabase-js';
// import bcrypt from 'bcryptjs';
// import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // TODO: Implement full authentication:
    // 1. Look up user by email
    // 2. Check if account is locked
    // 3. Verify password with bcrypt
    // 4. Create session token
    // 5. Store session in database
    // 6. Set httpOnly cookie
    // 7. Return requires2FA flag

    // STUB RESPONSE - Remove when implementing
    return NextResponse.json({
      success: true,
      requires2FA: false,
      message: '2FA groundwork - implementation pending',
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
