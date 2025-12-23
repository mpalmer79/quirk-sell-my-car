import { NextRequest, NextResponse } from 'next/server';
import { parseSessionCookie, createLogoutCookie } from '@/lib/admin/auth';
import {
  getSessionByToken,
  deleteSession,
  logAuditEvent,
} from '@/lib/admin/adminService';

export async function POST(request: NextRequest) {
  try {
    // Get session from cookie
    const cookieHeader = request.headers.get('cookie');
    const sessionToken = parseSessionCookie(cookieHeader);

    if (sessionToken) {
      // Get session to log the user ID
      const session = await getSessionByToken(sessionToken);

      if (session) {
        // Log the logout
        await logAuditEvent('logout', request, session.user_id);

        // Delete the session
        await deleteSession(sessionToken);
      }
    }

    // Clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.headers.set('Set-Cookie', createLogoutCookie());

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    // Even on error, clear the cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out',
    });

    response.headers.set('Set-Cookie', createLogoutCookie());

    return response;
  }
}
