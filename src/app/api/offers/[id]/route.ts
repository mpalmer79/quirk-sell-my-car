import { NextRequest, NextResponse } from 'next/server';
import { offerService, UpdateOfferInput, OfferStatus } from '@/lib/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/offers/[id]
 * Get a single offer by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  if (!offerService.isConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: 'Invalid offer ID format' },
      { status: 400 }
    );
  }

  try {
    const { offer, error } = await offerService.getById(id);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 });
  }
}

/**
 * PATCH /api/offers/[id]
 * Update an offer (status, customer info, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;

  if (!offerService.isConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: 'Invalid offer ID format' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const validStatuses: OfferStatus[] = [
      'pending', 'viewed', 'emailed', 'scheduled',
      'inspected', 'accepted', 'rejected', 'expired', 'completed'
    ];

    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updateInput: UpdateOfferInput = {};

    if (body.status) updateInput.status = body.status;
    if (body.status_notes !== undefined) updateInput.status_notes = body.status_notes;
    if (body.customer_email !== undefined) updateInput.customer_email = body.customer_email;
    if (body.customer_phone !== undefined) updateInput.customer_phone = body.customer_phone;
    if (body.customer_name !== undefined) updateInput.customer_name = body.customer_name;
    if (body.crm_lead_id !== undefined) updateInput.crm_lead_id = body.crm_lead_id;
    if (body.crm_synced_at !== undefined) updateInput.crm_synced_at = body.crm_synced_at;
    if (body.offer_amount !== undefined) updateInput.offer_amount = body.offer_amount;

    if (Object.keys(updateInput).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { offer, error } = await offerService.update(id, updateInput);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
