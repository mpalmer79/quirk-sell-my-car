import { NextRequest, NextResponse } from 'next/server';
import { submitTradeInOffer, TradeInSubmission } from '@/services/crm';

// Rate limiting for offer submissions
const submissionRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_SUBMISSIONS = 5; // 5 submissions per hour per IP

function checkSubmissionRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = submissionRateLimit.get(ip);

  if (!record || now > record.resetTime) {
    submissionRateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  // Rate limit check
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'anonymous';
  
  if (!checkSubmissionRateLimit(ip)) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Too many submissions. Please try again later or call (603) 263-4552.' 
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['customer', 'vehicle', 'basics', 'offer'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate customer info
    const { customer } = body;
    if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
      return NextResponse.json(
        { success: false, error: 'Please provide complete contact information' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Phone validation (basic - at least 10 digits)
    const phoneDigits = customer.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid phone number' },
        { status: 400 }
      );
    }

    // Submit to CRM
    const submission: TradeInSubmission = {
      customer: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: phoneDigits,
        zipCode: customer.zipCode?.trim(),
        preferredContact: customer.preferredContact,
      },
      vehicle: body.vehicle,
      basics: body.basics,
      features: body.features || {},
      condition: body.condition || {},
      offer: body.offer,
      source: 'Website',
      notes: body.notes,
      consentToContact: body.consentToContact !== false, // Default to true
    };

    const result = await submitTradeInOffer(submission);

    if (result.success) {
      return NextResponse.json({
        success: true,
        confirmationNumber: result.confirmationNumber,
        message: 'Your offer request has been submitted! A Quirk representative will contact you shortly.',
      });
    } else {
      // Log the error but return user-friendly message
      console.error('CRM submission failed:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Unable to submit your request. Please call (603) 263-4552 for immediate assistance.',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Submit offer error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please call (603) 263-4552 for assistance.' 
      },
      { status: 500 }
    );
  }
}
