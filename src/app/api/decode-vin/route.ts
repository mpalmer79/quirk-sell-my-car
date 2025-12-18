import { NextRequest, NextResponse } from 'next/server';
import { decodeVIN, isValidVIN } from '@/services/vinDecoder';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const vin = searchParams.get('vin');

  if (!vin) {
    return NextResponse.json(
      { error: 'VIN parameter is required' },
      { status: 400 }
    );
  }

  const cleanVin = vin.trim().toUpperCase();

  if (!isValidVIN(cleanVin)) {
    return NextResponse.json(
      { error: 'Invalid VIN format. VIN must be 17 characters and cannot contain I, O, or Q.' },
      { status: 400 }
    );
  }

  try {
    const vehicleInfo = await decodeVIN(cleanVin);
    return NextResponse.json(vehicleInfo);
  } catch (error) {
    console.error('VIN decode error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to decode VIN';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vin = body.vin;

    if (!vin) {
      return NextResponse.json(
        { error: 'VIN is required in request body' },
        { status: 400 }
      );
    }

    const cleanVin = String(vin).trim().toUpperCase();

    if (!isValidVIN(cleanVin)) {
      return NextResponse.json(
        { error: 'Invalid VIN format. VIN must be 17 characters and cannot contain I, O, or Q.' },
        { status: 400 }
      );
    }

    const vehicleInfo = await decodeVIN(cleanVin);
    return NextResponse.json(vehicleInfo);
  } catch (error) {
    console.error('VIN decode error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to decode VIN';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
