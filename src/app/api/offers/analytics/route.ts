import { NextRequest, NextResponse } from 'next/server';
import { offerService } from '@/lib/database';

/**
 * GET /api/offers/analytics
 * Get offer analytics and statistics
 */
export async function GET(request: NextRequest) {
  // Check if database is configured
  if (!offerService.isConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get('days') || '30');

  // Validate days parameter
  if (isNaN(days) || days < 1 || days > 365) {
    return NextResponse.json(
      { error: 'Days must be between 1 and 365' },
      { status: 400 }
    );
  }

  try {
    const analytics = await offerService.getAnalytics(days);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
