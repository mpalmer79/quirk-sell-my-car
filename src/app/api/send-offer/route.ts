import { NextRequest, NextResponse } from 'next/server';

/**
 * Send Offer API Route
 * 
 * This route supports two modes:
 * 1. Server-side EmailJS (using REST API) - if EMAILJS env vars are set
 * 2. Validation-only mode - validates data and returns success for client-side sending
 * 
 * For best results, use client-side EmailJS directly via:
 *   import { sendOfferEmails } from '@/services/emailService';
 */

// EmailJS REST API endpoint
const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

// Environment variables
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const DEALER_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_DEALER_TEMPLATE_ID || '';
const CUSTOMER_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_CUSTOMER_TEMPLATE_ID || '';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || ''; // Optional: for server-side sending

const DEALER_EMAIL = 'mpalmer@quirkcars.com';

interface SendOfferRequest {
  customerEmail: string;
  customerName?: string;
  vehicleInfo: {
    year: number;
    make: string;
    model: string;
    trim?: string;
    vin?: string;
  };
  basics: {
    mileage: number;
    zipCode: string;
    color?: string;
    transmission?: string;
    drivetrain?: string;
    engine?: string;
    sellOrTrade?: string;
    loanOrLease?: string;
  };
  features: {
    entertainment?: string[];
    accessoryPackages?: string[];
    exterior?: string[];
    safetyAndSecurity?: string[];
    cargoAndTowing?: string[];
    wheelsAndTires?: string[];
    seats?: string[];
  };
  condition: {
    overallCondition?: string;
    accidentHistory?: string;
    drivability?: string;
    mechanicalIssues?: string[];
    engineIssues?: string[];
    exteriorDamage?: string[];
    interiorDamage?: string[];
    technologyIssues?: string[];
    windshieldDamage?: string;
    tiresReplaced?: string;
    modifications?: boolean;
    smokedIn?: boolean;
    keys?: string;
  };
  offerAmount: number;
  expirationDate: string;
  offerId?: string;
}

function formatCondition(value: string | boolean | undefined): string {
  if (value === undefined || value === null) return 'Not specified';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

async function sendEmailJSRequest(templateId: string, templateParams: Record<string, string>): Promise<boolean> {
  try {
    console.log('Sending EmailJS request:', { 
      service_id: SERVICE_ID, 
      template_id: templateId,
      user_id: PUBLIC_KEY ? 'SET' : 'MISSING',
    });
    
    const response = await fetch(EMAILJS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: templateId,
        user_id: PUBLIC_KEY,
        accessToken: PRIVATE_KEY || undefined,
        template_params: templateParams,
      }),
    });

    const responseText = await response.text();
    console.log('EmailJS response:', { 
      status: response.status, 
      ok: response.ok, 
      body: responseText 
    });

    return response.ok;
  } catch (error) {
    console.error('EmailJS request failed:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: SendOfferRequest = await request.json();

    // Validate required fields
    if (!data.customerEmail || !data.vehicleInfo || !data.offerAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const vehicleName = `${data.vehicleInfo.year} ${data.vehicleInfo.make} ${data.vehicleInfo.model}`;

    // Check if EmailJS is configured for server-side sending
    const emailJSConfigured = SERVICE_ID && DEALER_TEMPLATE_ID && PUBLIC_KEY;

    if (!emailJSConfigured) {
      // Return validation success - client should send emails directly
      console.log('EmailJS not configured server-side - returning validation success');
      return NextResponse.json({
        success: true,
        message: 'Validation passed - use client-side email sending',
        validated: true,
        serverEmailSent: false,
      });
    }

    // Build template parameters for dealer email
    const dealerParams: Record<string, string> = {
      to_email: DEALER_EMAIL,
      subject: `🚗 New Appraisal: ${vehicleName} - $${data.offerAmount.toLocaleString()}`,
      customer_email: data.customerEmail,
      customer_name: data.customerName || 'Not provided',
      vehicle_year: String(data.vehicleInfo.year),
      vehicle_make: data.vehicleInfo.make,
      vehicle_model: data.vehicleInfo.model,
      vehicle_trim: data.vehicleInfo.trim || 'N/A',
      vehicle_vin: data.vehicleInfo.vin || 'Not provided',
      vehicle_name: vehicleName,
      mileage: data.basics.mileage?.toLocaleString() || 'N/A',
      zip_code: data.basics.zipCode,
      color: data.basics.color || 'Not specified',
      transmission: data.basics.transmission || 'Not specified',
      drivetrain: data.basics.drivetrain || 'Not specified',
      engine: data.basics.engine || 'Not specified',
      sell_or_trade: formatCondition(data.basics.sellOrTrade),
      loan_or_lease: formatCondition(data.basics.loanOrLease),
      overall_condition: formatCondition(data.condition.overallCondition),
      accident_history: formatCondition(data.condition.accidentHistory),
      drivability: formatCondition(data.condition.drivability),
      offer_amount: `$${data.offerAmount.toLocaleString()}`,
      expiration_date: data.expirationDate,
      offer_id: data.offerId || 'N/A',
      submission_date: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    };

    // Build template parameters for customer email
    const customerParams: Record<string, string> = {
      to_email: data.customerEmail,
      to_name: data.customerName || 'Valued Customer',
      subject: `Your Quirk Auto Offer: $${data.offerAmount.toLocaleString()} for your ${vehicleName}`,
      vehicle_name: vehicleName,
      vehicle_year: String(data.vehicleInfo.year),
      vehicle_make: data.vehicleInfo.make,
      vehicle_model: data.vehicleInfo.model,
      offer_amount: `$${data.offerAmount.toLocaleString()}`,
      expiration_date: data.expirationDate,
      offer_id: data.offerId || '',
    };

    // Send emails
    const [dealerSent, customerSent] = await Promise.all([
      sendEmailJSRequest(DEALER_TEMPLATE_ID, dealerParams),
      CUSTOMER_TEMPLATE_ID ? sendEmailJSRequest(CUSTOMER_TEMPLATE_ID, customerParams) : Promise.resolve(false),
    ]);

    if (!customerSent && !dealerSent) {
      return NextResponse.json(
        { error: 'Failed to send emails' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Emails sent successfully',
      dealerSent,
      customerSent,
      serverEmailSent: true,
    });

  } catch (error) {
    console.error('Send offer error:', error);
    return NextResponse.json(
      { error: 'Failed to process offer request' },
      { status: 500 }
    );
  }
}
