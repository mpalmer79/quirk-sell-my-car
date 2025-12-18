/**
 * @jest-environment node
 */

import { GET } from '@/app/api/decode-vin/route';
import { NextRequest } from 'next/server';

// Mock the services
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

describe('GET /api/decode-vin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (vin?: string) => {
    const url = vin 
      ? `http://localhost:3000/api/decode-vin?vin=${vin}`
      : 'http://localhost:3000/api/decode-vin';
    return new NextRequest(url);
  };

  it('should return 400 when VIN is not provided', async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VIN is required');
  });

  it('should return 400 when VIN is invalid', async () => {
    mockIsValidVIN.mockReturnValue(false);

    const request = createRequest('INVALID');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid VIN format. VIN must be exactly 17 characters and cannot contain I, O, or Q.');
  });

  it('should return vehicle info with image when VIN is valid', async () => {
    const mockVehicleInfo = {
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado 1500',
      trim: 'LT',
      bodyClass: 'Pickup',
    };

    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockResolvedValue(mockVehicleInfo);
    mockGetVehicleImage.mockResolvedValue('https://example.com/car.jpg');

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      ...mockVehicleInfo,
      imageUrl: 'https://example.com/car.jpg',
    });
  });

  it('should call decodeVIN with the provided VIN', async () => {
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockResolvedValue({
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado 1500',
    });
    mockGetVehicleImage.mockResolvedValue('https://example.com/car.jpg');

    const request = createRequest('1GCVKNEC0MZ123456');
    await GET(request);

    expect(mockDecodeVIN).toHaveBeenCalledWith('1GCVKNEC0MZ123456');
  });

  it('should call getVehicleImage with vehicle info', async () => {
    const mockVehicleInfo = {
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado 1500',
    };

    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockResolvedValue(mockVehicleInfo);
    mockGetVehicleImage.mockResolvedValue('https://example.com/car.jpg');

    const request = createRequest('1GCVKNEC0MZ123456');
    await GET(request);

    expect(mockGetVehicleImage).toHaveBeenCalledWith(mockVehicleInfo);
  });

  it('should return 500 when decodeVIN throws an error', async () => {
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockRejectedValue(new Error('NHTSA API unavailable'));

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('NHTSA API unavailable');
  });

  it('should return generic error message for non-Error exceptions', async () => {
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockRejectedValue('Unknown error');

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to decode VIN');
  });

  it('should validate VIN before decoding', async () => {
    mockIsValidVIN.mockReturnValue(false);

    const request = createRequest('SHORTVIN');
    await GET(request);

    expect(mockIsValidVIN).toHaveBeenCalledWith('SHORTVIN');
    expect(mockDecodeVIN).not.toHaveBeenCalled();
  });
});
