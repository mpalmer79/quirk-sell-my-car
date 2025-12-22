import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Quirk dealer notification email
const DEALER_EMAIL = 'mpalmer@quirkcars.com';
const FROM_EMAIL = 'offers@quirkautodealers.com'; // Must be verified domain in Resend

interface SendOfferRequest {
  customerEmail: string;
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

// Format condition value for display
function formatConditionValue(value: string | boolean | undefined): string {
  if (value === undefined || value === null) return 'Not specified';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Format array of issues for display
function formatIssuesList(issues: string[] | undefined): string {
  if (!issues || issues.length === 0) return 'None reported';
  return issues.map(issue => `• ${issue.replace(/-/g, ' ')}`).join('\n');
}

// Generate HTML email for dealer notification
function generateDealerEmailHtml(data: SendOfferRequest): string {
  const { vehicleInfo, basics, features, condition, offerAmount, expirationDate, offerId, customerEmail } = data;
  
  const featuresList = Object.entries(features)
    .filter(([_, values]) => values && values.length > 0)
    .map(([category, values]) => {
      const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${categoryName}:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${(values as string[]).join(', ')}</td></tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Vehicle Appraisal - ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="text-align: center; border-bottom: 3px solid #1a5632; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="color: #1a5632; margin: 0;">NEW VEHICLE APPRAISAL</h1>
      <p style="color: #666; margin-top: 10px;">Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
    </div>

    <!-- Offer Summary -->
    <div style="background-color: #1a5632; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
      <h2 style="margin: 0 0 10px 0;">OFFER AMOUNT</h2>
      <p style="font-size: 36px; font-weight: bold; margin: 0;">$${offerAmount.toLocaleString()}</p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Valid through: ${expirationDate}</p>
      ${offerId ? `<p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Offer ID: ${offerId}</p>` : ''}
    </div>

    <!-- Customer Contact -->
    <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
      <h3 style="margin: 0 0 10px 0; color: #0070cc;">📧 Customer Contact</h3>
      <p style="margin: 0; font-size: 18px;"><strong>${customerEmail}</strong></p>
    </div>

    <!-- Vehicle Information -->
    <h3 style="color: #1a5632; border-bottom: 2px solid #1a5632; padding-bottom: 10px;">🚗 Vehicle Information</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; width: 40%;"><strong>Year/Make/Model:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}</td></tr>
      ${vehicleInfo.trim ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Trim:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${vehicleInfo.trim}</td></tr>` : ''}
      ${vehicleInfo.vin ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>VIN:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${vehicleInfo.vin}</td></tr>` : ''}
    </table>

    <!-- Basic Details -->
    <h3 style="color: #1a5632; border-bottom: 2px solid #1a5632; padding-bottom: 10px;">📋 Basic Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; width: 40%;"><strong>Mileage:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${basics.mileage?.toLocaleString()} miles</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>ZIP Code:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${basics.zipCode}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Exterior Color:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${basics.color || 'Not specified'}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Transmission:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${basics.transmission || 'Not specified'}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Drivetrain:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${basics.drivetrain || 'Not specified'}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Engine:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${basics.engine || 'Not specified'}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Sell or Trade:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatConditionValue(basics.sellOrTrade)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Loan/Lease Status:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatConditionValue(basics.loanOrLease)}</td></tr>
    </table>

    ${featuresList ? `
    <!-- Features -->
    <h3 style="color: #1a5632; border-bottom: 2px solid #1a5632; padding-bottom: 10px;">⭐ Selected Features</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      ${featuresList}
    </table>
    ` : ''}

    <!-- Condition Assessment -->
    <h3 style="color: #1a5632; border-bottom: 2px solid #1a5632; padding-bottom: 10px;">🔍 Condition Assessment</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; width: 40%;"><strong>Overall Condition:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #0070cc;">${formatConditionValue(condition.overallCondition)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Accident History:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatConditionValue(condition.accidentHistory)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Drivability:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatConditionValue(condition.drivability)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Windshield:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatConditionValue(condition.windshieldDamage)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Tires Replaced:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatConditionValue(condition.tiresReplaced)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Modifications:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatConditionValue(condition.modifications)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Smoked In:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatConditionValue(condition.smokedIn)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Keys:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatConditionValue(condition.keys)}</td></tr>
    </table>

    <!-- Issues Reported -->
    <h3 style="color: #1a5632; border-bottom: 2px solid #1a5632; padding-bottom: 10px;">⚠️ Issues Reported</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; width: 40%; vertical-align: top;"><strong>Mechanical Issues:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; white-space: pre-line;">${formatIssuesList(condition.mechanicalIssues)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: top;"><strong>Engine Issues:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; white-space: pre-line;">${formatIssuesList(condition.engineIssues)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: top;"><strong>Exterior Damage:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; white-space: pre-line;">${formatIssuesList(condition.exteriorDamage)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: top;"><strong>Interior Damage:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; white-space: pre-line;">${formatIssuesList(condition.interiorDamage)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee; vertical-align: top;"><strong>Technology Issues:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; white-space: pre-line;">${formatIssuesList(condition.technologyIssues)}</td></tr>
    </table>

    <!-- Footer -->
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
      <p>This appraisal was submitted via quirk-sell-my-car.vercel.app</p>
      <p>© ${new Date().getFullYear()} Quirk Auto Dealers - 17+ Locations Across MA & NH</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate HTML email for customer confirmation
function generateCustomerEmailHtml(data: SendOfferRequest): string {
  const { vehicleInfo, offerAmount, expirationDate } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Vehicle Offer from Quirk Auto Dealers</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a5632; margin: 0;">QUIRK AUTO DEALERS</h1>
      <p style="color: #666; margin-top: 5px;">Thank you for your appraisal request!</p>
    </div>

    <!-- Greeting -->
    <p style="font-size: 16px; color: #333;">
      Thank you for taking the time to complete our online vehicle appraisal form. We appreciate your interest in selling or trading your vehicle with Quirk Auto Dealers.
    </p>

    <!-- Offer Box -->
    <div style="background-color: #1a5632; color: white; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <h2 style="margin: 0 0 5px 0; font-size: 16px; font-weight: normal;">Your Preliminary Offer for</h2>
      <h3 style="margin: 0 0 15px 0; font-size: 20px;">${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}</h3>
      <p style="font-size: 42px; font-weight: bold; margin: 0;">$${offerAmount.toLocaleString()}</p>
      <p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">
        <strong>Valid through: ${expirationDate}</strong>
      </p>
    </div>

    <!-- Important Notice -->
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0;">
      <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important Information</h4>
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>This offer is subject to final inspection by our professional appraiser.</strong> 
        The final value may vary based on the in-person verification of vehicle condition, 
        documentation, and any undisclosed issues.
      </p>
    </div>

    <!-- What to Bring -->
    <h3 style="color: #1a5632; margin-top: 30px;">📋 What to Bring</h3>
    <ul style="color: #333; line-height: 1.8;">
      <li><strong>Vehicle Title</strong> - Original title in your name (or payoff information if financed)</li>
      <li><strong>Valid ID</strong> - Driver's license or state-issued ID</li>
      <li><strong>Registration</strong> - Current vehicle registration</li>
      <li><strong>All Keys & Remotes</strong> - Including any spare keys or key fobs</li>
      <li><strong>Loan/Lease Payoff Info</strong> - If applicable, bring your account information</li>
    </ul>

    <!-- Payment Info -->
    <div style="background-color: #d4edda; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h4 style="margin: 0 0 10px 0; color: #155724;">💰 Same-Day Payment</h4>
      <p style="margin: 0; color: #155724; font-size: 14px;">
        Once our appraiser completes the final inspection and all paperwork is verified, 
        you'll receive <strong>same-day payment by check</strong>. The entire process 
        typically takes less than an hour!
      </p>
    </div>

    <!-- Locations -->
    <h3 style="color: #1a5632; margin-top: 30px;">📍 Visit Any of Our 17+ Locations</h3>
    <p style="color: #333;">
      Bring your vehicle to any Quirk Auto Dealers location across Massachusetts and New Hampshire. 
      No appointment necessary, but calling ahead can help expedite your visit.
    </p>
    <p style="text-align: center; margin: 20px 0;">
      <a href="https://www.quirkautodealers.com/locations" style="display: inline-block; background-color: #0070cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
        View All Locations →
      </a>
    </p>

    <!-- Contact -->
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <h4 style="margin: 0 0 15px 0; color: #333;">Questions? We're Here to Help!</h4>
      <p style="margin: 0; font-size: 18px;">
        <a href="tel:6032634552" style="color: #0070cc; text-decoration: none;">📞 (603) 263-4552</a>
      </p>
      <p style="margin: 10px 0 0 0;">
        <a href="mailto:sell@quirkautodealers.com" style="color: #0070cc; text-decoration: none;">✉️ sell@quirkautodealers.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0 0 10px 0;">We look forward to earning your business!</p>
      <p style="margin: 0;"><strong>Quirk Auto Dealers</strong></p>
      <p style="margin: 5px 0 0 0;">17+ Locations Across Massachusetts & New Hampshire</p>
      <p style="margin: 15px 0 0 0; font-size: 11px; color: #999;">
        This offer is valid for 7 days from the date of submission. Final offer may vary based on 
        in-person inspection. This is an automated email - please do not reply directly.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const data: SendOfferRequest = await request.json();

    // Validate required fields
    if (!data.customerEmail || !data.vehicleInfo || !data.offerAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const vehicleName = `${data.vehicleInfo.year} ${data.vehicleInfo.make} ${data.vehicleInfo.model}`;

    // Send email to dealer with full appraisal details
    const dealerEmailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: DEALER_EMAIL,
      subject: `🚗 New Appraisal: ${vehicleName} - $${data.offerAmount.toLocaleString()}`,
      html: generateDealerEmailHtml(data),
    });

    if (dealerEmailResult.error) {
      console.error('Failed to send dealer email:', dealerEmailResult.error);
    }

    // Send confirmation email to customer
    const customerEmailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Your Quirk Auto Offer: $${data.offerAmount.toLocaleString()} for your ${vehicleName}`,
      html: generateCustomerEmailHtml(data),
    });

    if (customerEmailResult.error) {
      console.error('Failed to send customer email:', customerEmailResult.error);
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Emails sent successfully',
      dealerEmailId: dealerEmailResult.data?.id,
      customerEmailId: customerEmailResult.data?.id,
    });

  } catch (error) {
    console.error('Send offer error:', error);
    return NextResponse.json(
      { error: 'Failed to send offer emails' },
      { status: 500 }
    );
  }
}
