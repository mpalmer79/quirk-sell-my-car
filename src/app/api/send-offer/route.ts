import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || '';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Quirk Auto';
const DEALER_EMAIL = process.env.SENDGRID_DEALER_EMAIL || 'steve.obrien@quirkcars.com';

// Optional but strongly recommended: use SendGrid Dynamic Templates
const DEALER_TEMPLATE_ID = process.env.SENDGRID_DEALER_TEMPLATE_ID || '';
const CUSTOMER_TEMPLATE_ID = process.env.SENDGRID_CUSTOMER_TEMPLATE_ID || '';

// Optional: if you want a delay between dealer and customer sends
const SEND_DELAY_MS = Number(process.env.SENDGRID_SEND_DELAY_MS || '0'); // set to 5000 if desired

type SendOfferRequest = {
  customerEmail: string;
  customerName?: string;
  offerAmount: number;
  expirationDate: string;
  offerId?: string;
  status?: string;
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

type BadgeStyle = {
  label: string;
  bg: string;
  border: string;
  text: string;
};

type TierStyle = {
  label: string;
  bg: string;
  border: string;
  text: string;
  pillBg: string;
  pillText: string;
};

function sleep(ms: number): Promise<void> {
  if (!ms || ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getStatusBadge(statusRaw: string | undefined): BadgeStyle {
  const status = (statusRaw || 'PENDING').toUpperCase();

  if (status === 'APPROVED') {
    return { label: 'APPROVED', bg: '#ecfdf5', border: '#6ee7b7', text: '#065f46' };
  }
  if (status === 'CONTACTED') {
    return { label: 'CONTACTED', bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' };
  }
  if (status === 'CLOSED') {
    return { label: 'CLOSED', bg: '#f3f4f6', border: '#d1d5db', text: '#111827' };
  }

  return { label: 'PENDING', bg: '#fff7ed', border: '#fdba74', text: '#9a3412' };
}

function getOfferTier(offerAmount: number): TierStyle {
  // Adjust these thresholds if you want different tiers
  if (offerAmount >= 25000) {
    return {
      label: 'HIGH OFFER',
      bg: '#ecfdf5',
      border: '#6ee7b7',
      text: '#065f46',
      pillBg: '#10b981',
      pillText: '#ffffff',
    };
  }

  if (offerAmount >= 15000) {
    return {
      label: 'MID OFFER',
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1d4ed8',
      pillBg: '#2563eb',
      pillText: '#ffffff',
    };
  }

  return {
    label: 'LOW OFFER',
    bg: '#fff1f2',
    border: '#fda4af',
    text: '#9f1239',
    pillBg: '#e11d48',
    pillText: '#ffffff',
  };
}

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

// Fallback HTML if template IDs are not configured
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

async function sendEmailHtml(params: {
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
      err?.response?.body ? JSON.stringify(err.response.body) : err?.message || 'Unknown SendGrid error';
    return { ok: false, error: message };
  }
}

async function sendEmailTemplate(params: {
  to: string;
  subject: string;
  templateId: string;
  dynamicTemplateData: Record<string, any>;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const [resp] = await sgMail.send({
      to: params.to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: params.subject,
      templateId: params.templateId,
      dynamicTemplateData: params.dynamicTemplateData,
    });

    const statusCode = resp?.statusCode || 0;
    if (statusCode >= 200 && statusCode < 300) return { ok: true };
    return { ok: false, error: `SendGrid unexpected status ${statusCode}` };
  } catch (err: any) {
    const message =
      err?.response?.body ? JSON.stringify(err.response.body) : err?.message || 'Unknown SendGrid error';
    return { ok: false, error: message };
  }
}

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID();

  try {
    const data: SendOfferRequest = await request.json();

    if (!data.customerEmail || !data.vehicleInfo || !data.offerAmount) {
      return NextResponse.json({ error: 'Missing required fields', correlationId }, { status: 400 });
    }

    if (!safeEmail(data.customerEmail)) {
      return NextResponse.json({ error: 'Invalid email format', correlationId }, { status: 400 });
    }

    // Ensure offerId always exists for deep links
    data.offerId = data.offerId || crypto.randomUUID();

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

    // Deep links
    const dashboardUrl = 'https://quirk-sell-my-car.vercel.app/admin/offers';
    const offerUrl = `${dashboardUrl}?offerId=${encodeURIComponent(data.offerId)}`;

    // Badge + tier (computed here, passed to template)
    const statusBadge = getStatusBadge(data.status);
    const tier = getOfferTier(Number(data.offerAmount));

    // Shared dynamic data (matches your template variables)
    const sharedTemplateData = {
      offerId: data.offerId,
      offerAmount: `$${Number(data.offerAmount).toLocaleString()}`,
      expirationDate: data.expirationDate,
      customerName: data.customerName || 'Not provided',
      customerEmail: data.customerEmail,
      vehicleName,
      vin: data.vehicleInfo.vin || 'Not provided',
      mileage: data.basics?.mileage ? `${Number(data.basics.mileage).toLocaleString()} miles` : 'N/A',
      overallCondition: formatCondition(data.condition?.overallCondition),

      // deep links
      dashboardUrl,
      offerUrl,

      // status badge
      statusLabel: statusBadge.label,
      statusBg: statusBadge.bg,
      statusBorder: statusBadge.border,
      statusText: statusBadge.text,

      // offer tier conditional styling
      offerTierLabel: tier.label,
      offerTierBg: tier.bg,
      offerTierBorder: tier.border,
      offerTierText: tier.text,
      offerTierPillBg: tier.pillBg,
      offerTierPillText: tier.pillText,
    };

    const useTemplates = Boolean(DEALER_TEMPLATE_ID && CUSTOMER_TEMPLATE_ID);

    // Dealer send
    const dealerResult = useTemplates
      ? await sendEmailTemplate({
          to: DEALER_EMAIL,
          subject: dealerSubject,
          templateId: DEALER_TEMPLATE_ID,
          dynamicTemplateData: sharedTemplateData,
        })
      : await sendEmailHtml({
          to: DEALER_EMAIL,
          subject: dealerSubject,
          html: buildDealerHtml(data),
        });

    // Optional delay between dealer and customer sends
    if (SEND_DELAY_MS > 0) {
      await sleep(SEND_DELAY_MS);
    }

    // Customer send
    const customerResult = useTemplates
      ? await sendEmailTemplate({
          to: data.customerEmail,
          subject: customerSubject,
          templateId: CUSTOMER_TEMPLATE_ID,
          dynamicTemplateData: sharedTemplateData,
        })
      : await sendEmailHtml({
          to: data.customerEmail,
          subject: customerSubject,
          html: buildCustomerHtml(data),
        });

    return NextResponse.json(
      {
        success: true,
        message: 'Offer created. Email send attempted.',
        correlationId,
        serverEmailSent: true,
        dealerSent: dealerResult.ok,
        customerSent: customerResult.ok,
        dealerError: dealerResult.error || null,
        customerError: customerResult.error || null,
        usingTemplates: useTemplates,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('send-offer route error', { error });
    return NextResponse.json({ error: 'Failed to process offer request' }, { status: 500 });
  }
}
