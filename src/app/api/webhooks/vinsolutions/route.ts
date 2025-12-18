import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { VinSolutionsWebhookPayload, WebhookEvent } from '@/services/crm';

// Verify webhook signature from VIN Solutions
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Log webhook events (in production, use proper logging service)
function logWebhookEvent(event: WebhookEvent, data: Record<string, unknown>): void {
  console.log(JSON.stringify({
    type: 'WEBHOOK_EVENT',
    event,
    timestamp: new Date().toISOString(),
    data,
  }));
}

// Handle different webhook events
async function handleWebhookEvent(payload: VinSolutionsWebhookPayload): Promise<void> {
  switch (payload.event) {
    case 'lead.assigned':
      // Lead was assigned to a sales rep
      logWebhookEvent(payload.event, payload.data);
      // Could trigger notification to customer that someone will contact them
      break;

    case 'appraisal.completed':
      // Appraisal was completed by appraiser
      logWebhookEvent(payload.event, payload.data);
      // Could send email to customer with final offer
      break;

    case 'appointment.scheduled':
      // Appointment was scheduled
      logWebhookEvent(payload.event, payload.data);
      // Could send confirmation email/SMS to customer
      break;

    case 'lead.updated':
    case 'customer.updated':
    case 'customer.created':
    case 'lead.created':
    case 'appraisal.created':
    case 'appointment.completed':
      // Log other events for monitoring
      logWebhookEvent(payload.event, payload.data);
      break;

    default:
      console.warn(`Unhandled webhook event: ${payload.event}`);
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.VINSOLUTIONS_WEBHOOK_SECRET;

  // If no secret configured, reject webhooks
  if (!webhookSecret) {
    console.warn('VINSOLUTIONS_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 501 }
    );
  }

  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify signature
    const signature = request.headers.get('x-vinsolutions-signature');
    if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: VinSolutionsWebhookPayload = JSON.parse(rawBody);

    // Verify dealer ID matches
    const expectedDealerId = process.env.VINSOLUTIONS_DEALER_ID;
    if (expectedDealerId && payload.dealerId !== expectedDealerId) {
      console.error(`Dealer ID mismatch: expected ${expectedDealerId}, got ${payload.dealerId}`);
      return NextResponse.json(
        { error: 'Invalid dealer ID' },
        { status: 403 }
      );
    }

    // Process the webhook event
    await handleWebhookEvent(payload);

    // Acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook verification (some CRM systems ping this)
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge');
  
  if (challenge) {
    // Echo back challenge for webhook verification
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ status: 'Webhook endpoint active' });
}
