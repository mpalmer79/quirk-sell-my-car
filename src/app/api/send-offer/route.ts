import { NextRequest, NextResponse } from 'next/server';

/**
 * Send Offer API Route
 *
 * Uses EmailJS REST API server side if env vars are set.
 * Important: EmailJS REST API rate limit is 1 request per second.
 * This route sends dealer then customer with a delay to avoid 429 failures.
 */

const EMAILJS_API = 'https://api.emailjs.com/api/v1.0/email/send';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const DEALER_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_DEALER_TEMPLATE_ID || '';
const CUSTOMER_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_CUSTOMER_TEMPLATE_ID || '';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '';

const DEALER_EMAIL = 'steve.obrien@quirkcars.com';

type SendOfferRequest = {
  customerEmail: string;
  customerName?: string;
  offerAmount: number;
  expirationDate: string;
  offerId?: string;
  vehicleInfo: {
    vin?: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    bodyClass?: string;
    driveType?: string;
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
    keys?: 'one' | 'two' | 'none';
  };
};

function formatCondition(value: string | boolean | undefined | null): string {
  if (value === undefined || value === null) return 'Not specified';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function joinList(list?: string[]): string {
  if (!list || list.length === 0) return 'None reported';
  return list.join(', ');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type EmailJsResult = {
  ok: boolean;
  status: number;
  body: string;
};

async function sendEmailJSRequest(
  templateId: string,
  templateParams: Record<string, string>
): Promise<EmailJsResult> {
  const response = await fetch(EMAILJS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: templateId,
      user_id: PUBLIC_KEY,
      accessToken: PRIVATE_KEY || undefined,
      template_params: templateParams,
    }),
  });

  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}

export async function POST(request: NextRequest) {
  try {
    const data: SendOfferRequest = await request.json();

    // Required field validation
    if (!data.customerEmail || !data.vehicleInfo || !data.offerAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if server side EmailJS is configured
    const emailJSConfigured = Boolean(SERVICE_ID && DEALER_TEMPLATE_ID && PUBLIC_KEY);
    if (!emailJSConfigured) {
      return NextResponse.json(
        {
          success: true,
          message: 'Validation passed. EmailJS is not configured server side.',
          validated: true,
          serverEmailSent: false,
        },
        { status: 200 }
      );
    }

    const vehicleName = `${data.vehicleInfo.year} ${data.vehicleInfo.make} ${data.vehicleInfo.model}`;

    // Build template params
    const dealerParams: Record<string, string> = {
      to_email: DEALER_EMAIL,
      subject: `New Appraisal: ${vehicleName} - $${data.offerAmount.toLocaleString()}`,
      customer_email: data.customerEmail,
      customer_name: data.customerName || 'Not provided',
      vehicle_year: String(data.vehicleInfo.year),
      vehicle_make: data.vehicleInfo.make,
      vehicle_model: data.vehicleInfo.model,
      vehicle_trim: data.vehicleInfo.trim || 'N/A',
      vehicle_vin: data.vehicleInfo.vin || 'Not provided',
      vehicle_name: vehicleName,
      mileage: String(data.basics.mileage?.toLocaleString() || 'N/A'),
      zip_code: String(data.basics.zipCode || ''),
      color: data.basics.color || 'Not specified',
      transmission: data.basics.transmission || 'Not specified',
      drivetrain: data.basics.drivetrain || 'Not specified',
      engine: data.basics.engine || 'Not specified',
      sell_or_trade: formatCondition(data.basics.sellOrTrade),
      loan_or_lease: formatCondition(data.basics.loanOrLease),
      overall_condition: formatCondition(data.condition.overallCondition),
      accident_history: formatCondition(data.condition.accidentHistory),
      drivability: formatCondition(data.condition.drivability),
      mechanical_issues: joinList(data.condition.mechanicalIssues),
      engine_issues: joinList(data.condition.engineIssues),
      exterior_damage: joinList(data.condition.exteriorDamage),
      interior_damage: joinList(data.condition.interiorDamage),
      technology_issues: joinList(data.condition.technologyIssues),
      windshield_damage: formatCondition(data.condition.windshieldDamage),
      tires_replaced: formatCondition(data.condition.tiresReplaced),
      modifications: formatCondition(data.condition.modifications),
      smoked_in: formatCondition(data.condition.smokedIn),
      keys: formatCondition(data.condition.keys),
      offer_amount: `$${data.offerAmount.toLocaleString()}`,
      expiration_date: data.expirationDate,
      offer_id: data.offerId || 'N/A',
    };

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

    // Send dealer first
    const dealerResult = await sendEmailJSRequest(DEALER_TEMPLATE_ID, dealerParams);

    // Avoid EmailJS REST API 1 request per second limit (use a 5 second buffer)
    await sleep(5000);

    // Send customer second if configured
    let customerResult: EmailJsResult | null = null;
    if (CUSTOMER_TEMPLATE_ID) {
      customerResult = await sendEmailJSRequest(CUSTOMER_TEMPLATE_ID, customerParams);
    }

    const dealerSent = dealerResult.ok;
    const customerSent = customerResult ? customerResult.ok : false;

    if (!dealerSent && !customerSent) {
      return NextResponse.json(
        {
          error: 'EmailJS send failed',
          dealer: { status: dealerResult.status, body: dealerResult.body },
          customer: customerResult
            ? { status: customerResult.status, body: customerResult.body }
            : { skipped: true },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email send attempted',
      dealerSent,
      customerSent,
      dealer: { status: dealerResult.status },
      customer: customerResult ? { status: customerResult.status } : { skipped: true },
      serverEmailSent: true,
    });
  } catch (error) {
    console.error('Send offer error:', error);
    return NextResponse.json({ error: 'Failed to process offer request' }, { status: 500 });
  }
}
