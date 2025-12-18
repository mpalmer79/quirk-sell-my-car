import { NextRequest, NextResponse } from 'next/server';
import { decodeVIN } from '@/services/vinDecoder';
import { getVehicleImageServerSide } from '@/services/vehicleImage';
import {
  checkRateLimit,
  logRateLimitHit,
  logVinLookup,
  validateInput,
  vinSchema,
  sanitizeVin,
  quickBotCheck,
  logBotDetection,
  detectBot,
} from '@/lib/security';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // ===== Rate Limiting =====
  const rateLimitResult = checkRateLimit(request, '/api/decode-vin');
  
  if (!rateLimitResult.allowed) {
    logRateLimitHit(request, '/api/decode-vin', rateLimitResult.blocked);
    
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfter || 60),
        }
      }
    );
  }

  // ===== Bot Detection =====
  const botResult = detectBot(request);
  if (botResult.isBot && botResult.confidence >= 80) {
    logBotDetection(request, botResult.confidence, botResult.reasons);
    
    return NextResponse.json(
      { error: 'Request could not be processed.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawVin = searchParams.get('vin');

    // ===== Input Validation =====
    if (!rawVin) {
      return NextResponse.json(
        { error: 'VIN is required' },
        { status: 400 }
      );
    }

    // Sanitize VIN
    const vin = sanitizeVin(rawVin);

    // Validate VIN format (basic check - full validation in vinSchema)
    if (vin.length !== 17) {
      logVinLookup(request, vin, false, { reason: 'Invalid length' });
      
      return NextResponse.json(
        { error: 'Invalid VIN format. VIN must be exactly 17 characters.' },
        { status: 400 }
      );
    }

    // Validate VIN characters
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      logVinLookup(request, vin, false, { reason: 'Invalid characters' });
      
      return NextResponse.json(
        { error: 'Invalid VIN format. VIN contains invalid characters.' },
        { status: 400 }
      );
    }

    // ===== Decode VIN =====
    const vehicleInfo = await decodeVIN(vin);
    
    // Get vehicle image
    const imageUrl = await getVehicleImageServerSide(vehicleInfo);

    logVinLookup(request, vin, true, {
      year: vehicleInfo.year,
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      ...vehicleInfo,
      imageUrl,
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        // Cache for 1 hour - VIN data doesn't change
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('VIN decode error:', errorMessage);
    
    logVinLookup(
      request,
      'unknown',
      false,
      { error: errorMessage, durationMs: Date.now() - startTime }
    );

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
