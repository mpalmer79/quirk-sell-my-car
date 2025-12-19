import { NextRequest, NextResponse } from 'next/server';
import { getVehicleImageByMake } from '@/services/vehicleImage';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year');
  const make = searchParams.get('make');
  const model = searchParams.get('model');
  const bodyClass = searchParams.get('bodyClass');

  if (!year || !make || !model) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Use the vehicleImage service which prioritizes make + body type
  const vehicleInfo = {
    vin: '',
    year: parseInt(year, 10),
    make,
    model,
    bodyClass: bodyClass || undefined,
  };

  const imageUrl = getVehicleImageByMake(vehicleInfo);

  return NextResponse.json({ imageUrl, source: 'make-based' });
}
