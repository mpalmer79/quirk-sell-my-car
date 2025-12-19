import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { VinSolutionsWebhookPayload, WebhookEvent } from '@/services/crm';
import { logWebhookReceived, logWebhookError, logSecurityViolation } from '@/lib/security/auditLog';
import { logger } from '@/lib/logger';

// Verify webhook signature from VIN Solutions
function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Handle different webhook events
async function handleWebhookEvent(
  request: NextRequest,
  payload: VinSolutionsWebhookPayload
): Promise<void> {
  logWebhookReceived(request, 'vinsolutions', payload.event);

  switch (payload.event) {
    case 'lead.assigned':
      logger.info('Lead assigned', {
        event: payload.event,
        leadId: payload.data?.leadId,
        assignedTo: payload.data?.assignedTo,
      });
      break;

    case 'appraisal.completed':
      logger.info('Appraisal completed', {
        event: payload.event,
        appraisalId: payload.data?.appraisalId,
        vin: payload.data?.vin,
      });
      break;

    case 'appointment.scheduled':
      logger.info('Appointment scheduled', {
        event: payload.event,
        appointmentId: payload.data?.appointmentId,
        scheduledTime: payload.data?.scheduledTime,
      });
      break;

    case 'lead.updated':
    case 'customer.updated':
    case 'customer.created':
    case 'lead.created':
    case 'appraisal.created':
    case 'appointment.completed':
      logger.debug('Webhook event received', {
        event: payload.event,
        entityId: payload.data?.id || payload.data?.leadId,
      });
      break;

    default:
      logger.warn('Unhandled webhook event', { event: payload.event });
  }
}

export async function POST(request: NextRequest) {
  const timer = logger.startTimer();
  const webhookSecret = process.env.VINSOLUTIONS_WEBHOOK_SECRET;

  // If no secret configured, reject webhooks
  if (!webhookSecret) {
    logger.warn('VINSOLUTIONS_WEBHOOK_SECRET not configured');
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
      logSecurityViolation(request, 'Invalid webhook signature', {
        source: 'vinsolutions',
        hasSignature: !!signature,
      });
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
      logSecurityViolation(request, 'Dealer ID mismatch', {
        source: 'vinsolutions',
        expected: expectedDealerId,
        received: payload.dealerId,
      });
      return NextResponse.json(
        { error: 'Invalid dealer ID' },
        { status: 403 }
      );
    }

    // Process the webhook event
    await handleWebhookEvent(request, payload);

    const durationMs = timer.end();
    logger.debug('Webhook processed', { event: payload.event, durationMs });

    // Acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error) {
    const durationMs = timer.end();
    const err = error instanceof Error ? error : new Error('Failed to process webhook');
    
    logWebhookError(request, 'vinsolutions', err);
    logger.error('Webhook processing error', { durationMs }, err);
    
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
    logger.debug('Webhook challenge received', { challenge: challenge.substring(0, 8) + '...' });
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ status: 'Webhook endpoint active' });
}
