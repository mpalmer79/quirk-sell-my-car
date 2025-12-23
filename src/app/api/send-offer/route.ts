import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || '';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Quirk Auto';
const DEALER_EMAIL = process.env.SENDGRID_DEALER_EMAIL || 'steve.obrien@quirkcars.com';

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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildDealerHtml(data: SendOfferRequest): string {
  const vehicleName = `${data.vehicleInfo.year} ${data.vehicleInfo.make} ${data.vehicleInfo.model}`;
  const offer = `$${data.offerAmount.toLocaleString()}`;

  const rows: Array<[string, string]> = [
    ['Offer ID', data.offerId || 'N/A'],
    ['Offer Amount', offer],
    ['Expiration', data.expirationDate],
    ['Customer Email', data.customerEmail],
    ['Customer Name', data.customerName || 'Not provided'],
    ['Vehicle', vehicleName],
    ['VIN', data.vehicleInfo.vin || 'Not provided'],
    ['Trim', data.vehicleInfo.trim || 'N/A'],
    ['Mileage', data.basics.mileage ? data.basics.mileage.toLocaleString() : 'N/A'],
    ['Zip Code', data.basics.zipCode || ''],
    ['Color', data.basics.color || 'Not specified'],
    ['Transmission', data.basics.transmission || 'Not specified'],
    ['Drivetrain', data.basics.drivetrain || 'Not specified'],
    ['Engine', data.basics.engine || 'Not specified'],
    ['Sell or Trade', formatCondition(data.basics.sellOrTrade)],
    ['Loan or Lease', formatCondition(data.basics.loanOrLease)],
    ['Overall Condition', formatCondition(data.condition.overallCondition)],
    ['Accident History', formatCondition(data.condition.accidentHistory)],
    ['Drivability', formatCondition(data.condition.drivability)],
    ['Mechanical Issues', joinList(data.condition.mechanicalIssues)],
    ['Engine Issues', joinList(data.condition.engineIssues)],
    ['Exterior Damage', joinList(data.condition.exteriorDamage)],
    ['Interior Damage', joinList(data.condition.interiorDamage)],
    ['Technology Issues', joinList(data.condition.technologyIssues)],
    ['Windshield Damage', formatCondition(data.condition.windshieldDamage)],
    ['Tires Replaced', formatCondition(data.condition.tiresReplaced)],
    ['Modifications', formatCondition(data.condition.modifications)],
    ['Smoked In', formatCondition(data.condition.smokedIn)],
    ['Keys', formatCondition(data.condition.keys)],
  ];

  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;"><strong>${escapeHtml(
          k
        )}</strong></td><td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(String(v))}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.4;">
      <h2 style="margin:0 0 12px 0;">New Appraisal Offer Created</h2>
      <p style="margin:0 0 16px 0;">A customer completed the offer flow.</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px;">
        <tbody>${table}</tbody>
      </table>
    </div>
  `;
}

function buildCustomerHtml(data: SendOfferRequest): string {
  const vehicleName = `${data.vehicleInfo.year} ${data.vehicleInfo.make} ${data.vehicleInfo.model}`;
  const offer = `$${data.offerAmount.toLocaleString()}`;
  const name = data.customerName || 'there';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;">
      <h2 style="margin:0 0 12px 0;">Your Quirk Auto Offer</h2>
      <p style="margin:0 0 10px 0;">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 10px 0;">Here is your offer for your ${escapeHtml(vehicleName)}:</p>
      <p style="font-size:18px;margin:0 0 10px 0;"><strong>${escapeHtml(offer)}</strong></p>
      <p style="margin:0 0 10px 0;"><strong>Valid through:</strong> ${escapeHtml(data.expirationDate)}</p>
      <p style="margin:0 0 10px 0;"><strong>Offer ID:</strong> ${escapeHtml(data.offerId || '')}</p>
      <p style="margin:16px 0 0 0;">Next steps: schedule an appointment, bring your ID and registration, and we can pay you same day.</p>
      <p style="margin:16px 0 0 0;">Questions? Call (603) 263-4552.</p>
    </div>
  `;
}

function isConfigured(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!SENDGRID_API_KEY) missing.push('SENDGRID_API_KEY');
  if (!FROM_EMAIL) missing.push('SENDGRID_FROM_EMAIL');
  if (!DEALER_EMAIL) missing.push('SENDGRID_DEALER_EMAIL');
  return { ok: missing.length === 0, missing };
}

function safeEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const [resp] = await sgMail.send({
      to: params.to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: params.subject,
      html: params.html,
    });

    const statusCode = resp?.statusCode || 0;
    if (statusCode >= 200 && statusCode < 300) return { ok: true };

    return { ok: false, error: `SendGrid unexpected status ${statusCode}` };
  } catch (err: any) {
    const message =
      err?.response?.body
        ? JSON.stringify(err.response.body)
        : err?.message || 'Unknown SendGrid error';
    return { ok: false, error: message };
  }
}

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID();

  try {
    const data: SendOfferRequest = await request.json();

    if (!data.customerEmail || !data.vehicleInfo || !data.offerAmount) {
      return NextResponse.json(
        { error: 'Missing required fields', correlationId },
        { status: 400 }
      );
    }

    if (!safeEmail(data.customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', correlationId },
        { status: 400 }
      );
    }

    const config = isConfigured();
    if (!config.ok) {
      return NextResponse.json(
        {
          success: true,
          message: 'Offer created, email not configured on server.',
          correlationId,
          serverEmailSent: false,
          missingEnv: config.missing,
        },
        { status: 200 }
      );
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    const vehicleName = `${data.vehicleInfo.year} ${data.vehicleInfo.make} ${data.vehicleInfo.model}`;

    const dealerSubject = `New Appraisal: ${vehicleName} - $${data.offerAmount.toLocaleString()}`;
    const customerSubject = `Your Quirk Auto Offer: $${data.offerAmount.toLocaleString()} for your ${vehicleName}`;

    const dealerHtml = buildDealerHtml(data);
    const customerHtml = buildCustomerHtml(data);

    // Send sequentially. No need for a 5 second delay with SendGrid.
    const dealerResult = await sendEmail({
      to: DEALER_EMAIL,
      subject: dealerSubject,
      html: dealerHtml,
    });

    const customerResult = await sendEmail({
      to: data.customerEmail,
      subject: customerSubject,
      html: customerHtml,
    });

    const dealerSent = dealerResult.ok;
    const customerSent = customerResult.ok;

    // Never return 502 for the whole offer. Return status flags so UI can reflect truth.
    return NextResponse.json(
      {
        success: true,
        message: 'Offer created. Email send attempted.',
        correlationId,
        serverEmailSent: true,
        dealerSent,
        customerSent,
        dealerError: dealerResult.error || null,
        customerError: customerResult.error || null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('send-offer route error', { correlationId, error });
    return NextResponse.json(
      { error: 'Failed to process offer request', correlationId },
      { status: 500 }
    );
  }
}
