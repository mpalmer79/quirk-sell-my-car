import { NextRequest, NextResponse } from 'next/server';
import { offerService, CreateOfferInput, OfferQueryParams, OfferStatus } from '@/lib/database';

/**
 * GET /api/offers
 * List offers with optional filtering
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

  const params: OfferQueryParams = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    sort_by: (searchParams.get('sort_by') as OfferQueryParams['sort_by']) || 'created_at',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
  };

  // Optional filters
  const status = searchParams.get('status');
  if (status) {
    if (status.includes(',')) {
      params.status = status.split(',') as OfferStatus[];
    } else {
      params.status = status as OfferStatus;
    }
  }

  const vin = searchParams.get('vin');
  if (vin) params.vin = vin;

  const email = searchParams.get('email');
  if (email) params.email = email;

  const date_from = searchParams.get('date_from');
  if (date_from) params.date_from = date_from;

  const date_to = searchParams.get('date_to');
  if (date_to) params.date_to = date_to;

  const min_amount = searchParams.get('min_amount');
  if (min_amount) params.min_amount = parseInt(min_amount);

  const max_amount = searchParams.get('max_amount');
  if (max_amount) params.max_amount = parseInt(max_amount);

  try {
    const result = await offerService.list(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/offers
 * Create a new offer
 */
export async function POST(request: NextRequest) {
  // Check if database is configured
  if (!offerService.isConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['vin', 'year', 'make', 'model', 'mileage', 'estimated_value', 'offer_amount', 'offer_expiry'];
    const missingFields = requiredFields.filter(field => body[field] === undefined);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Get metadata from request
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    const offerInput: CreateOfferInput = {
      ...body,
      ip_address: ip,
      user_agent: userAgent,
    };

    const { offer, error } = await offerService.create(offerInput);

    if (error || !offer) {
      return NextResponse.json(
        { error: error || 'Failed to create offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
