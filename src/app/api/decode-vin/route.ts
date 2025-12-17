import { NextRequest, NextResponse } from 'next/server';
import { decodeVIN, isValidVIN } from '@/services/vinDecoder';
import { getVehicleImage } from '@/services/vehicleImage';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const vin = searchParams.get('vin');

  if (!vin) {
    return NextResponse.json(
      { error: 'VIN is required' },
      { status: 400 }
    );
  }

  if (!isValidVIN(vin)) {
    return NextResponse.json(
      { error: 'Invalid VIN format. VIN must be exactly 17 characters and cannot contain I, O, or Q.' },
      { status: 400 }
    );
  }

  try {
    const vehicleInfo = await decodeVIN(vin);
    const imageUrl = await getVehicleImage(vehicleInfo);

    return NextResponse.json({
      ...vehicleInfo,
      imageUrl,
    });
  } catch (error) {
    console.error('VIN decode error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to decode VIN' },
      { status: 500 }
    );
  }
}
