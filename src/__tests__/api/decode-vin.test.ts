/**
 * @jest-environment node
 */

import { GET } from '@/app/api/decode-vin/route';
import { NextRequest } from 'next/server';

// Mock fetch for node environment
global.fetch = jest.fn();

jest.mock('@/services/vinDecoder', () => ({
  decodeVIN: jest.fn(),
  isValidVIN: jest.fn(),
}));

jest.mock('@/services/vehicleImage', () => ({
  getVehicleImage: jest.fn(),
}));

import { decodeVIN, isValidVIN } from '@/services/vinDecoder';
import { getVehicleImage } from '@/services/vehicleImage';

const mockDecodeVIN = decodeVIN as jest.MockedFunction<typeof decodeVIN>;
const mockIsValidVIN = isValidVIN as jest.MockedFunction<typeof isValidVIN>;
const mockGetVehicleImage = getVehicleImage as jest.MockedFunction<typeof getVehicleImage>;

const createRequest = (vin?: string) => {
  const url = vin 
    ? `http://localhost:3000/api/decode-vin?vin=${vin}`
    : 'http://localhost:3000/api/decode-vin';
  return new NextRequest(url);
};

describe('GET /api/decode-vin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when VIN not provided', async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VIN is required');
  });

  it('returns 400 for invalid VIN', async () => {
    mockIsValidVIN.mockReturnValue(false);

    const request = createRequest('INVALID');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid VIN format');
  });

  it('returns vehicle info for valid VIN', async () => {
    const mockVehicle = {
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado',
    };

    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockResolvedValue(mockVehicle);
    mockGetVehicleImage.mockResolvedValue('https://example.com/car.jpg');

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.vin).toBe('1GCVKNEC0MZ123456');
    expect(data.imageUrl).toBe('https://example.com/car.jpg');
  });

  it('calls decodeVIN with VIN', async () => {
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockResolvedValue({
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVY',
      model: 'Silverado',
    });
    mockGetVehicleImage.mockResolvedValue('https://example.com/car.jpg');

    const request = createRequest('1GCVKNEC0MZ123456');
    await GET(request);

    expect(mockDecodeVIN).toHaveBeenCalledWith('1GCVKNEC0MZ123456');
  });

  it('returns 500 when decodeVIN throws', async () => {
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockRejectedValue(new Error('API error'));

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API error');
  });

  it('validates VIN before decoding', async () => {
    mockIsValidVIN.mockReturnValue(false);

    const request = createRequest('SHORTVIN');
    await GET(request);

    expect(mockIsValidVIN).toHaveBeenCalledWith('SHORTVIN');
    expect(mockDecodeVIN).not.toHaveBeenCalled();
  });
});
