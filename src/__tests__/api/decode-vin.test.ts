/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

// Mock modules BEFORE importing the route
jest.mock('@/services/vinDecoder', () => ({
  decodeVIN: jest.fn(),
  isValidVIN: jest.fn(),
}));

jest.mock('@/services/vehicleImage', () => ({
  getVehicleImageServerSide: jest.fn(),
  getVehicleImage: jest.fn(),
  getFallbackImage: jest.fn(),
}));

// Now import everything
import { GET } from '@/app/api/decode-vin/route';
import { rateLimitStore } from '@/lib/security';
import { decodeVIN, isValidVIN } from '@/services/vinDecoder';
import { getVehicleImageServerSide } from '@/services/vehicleImage';

const mockDecodeVIN = decodeVIN as jest.MockedFunction<typeof decodeVIN>;
const mockIsValidVIN = isValidVIN as jest.MockedFunction<typeof isValidVIN>;
const mockGetVehicleImageServerSide = getVehicleImageServerSide as jest.MockedFunction<typeof getVehicleImageServerSide>;

// Counter for unique IPs
let ipCounter = 0;

function getUniqueIp(): string {
  ipCounter++;
  return `10.0.${Math.floor(ipCounter / 255)}.${ipCounter % 255}`;
}

const createRequest = (vin?: string, customIp?: string) => {
  const ip = customIp || getUniqueIp();
  const url = vin 
    ? `http://localhost:3000/api/decode-vin?vin=${vin}`
    : 'http://localhost:3000/api/decode-vin';
  return new NextRequest(url, {
    headers: {
      'x-forwarded-for': ip,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'accept': 'application/json',
      'accept-language': 'en-US,en;q=0.9',
    },
  });
};

describe('GET /api/decode-vin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks to default behavior
    mockDecodeVIN.mockReset();
    mockIsValidVIN.mockReset();
    mockGetVehicleImageServerSide.mockReset();
    // Clear rate limiter
    rateLimitStore.clear();
  });

  it('returns 400 when VIN not provided', async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VIN is required');
  });

  it('returns 400 for VIN with wrong length', async () => {
    const request = createRequest('SHORTVIN');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid VIN format');
  });

  it('returns 400 for VIN with invalid characters', async () => {
    const request = createRequest('1GCVKNEC0MZ12345I'); // Contains I
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

    mockDecodeVIN.mockResolvedValue(mockVehicle);
    mockGetVehicleImageServerSide.mockResolvedValue('https://example.com/car.jpg');

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.vin).toBe('1GCVKNEC0MZ123456');
    expect(data.imageUrl).toBe('https://example.com/car.jpg');
  });

  it('calls decodeVIN with uppercase VIN', async () => {
    mockDecodeVIN.mockResolvedValue({
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVY',
      model: 'Silverado',
    });
    mockGetVehicleImageServerSide.mockResolvedValue('https://example.com/car.jpg');

    const request = createRequest('1gcvknec0mz123456'); // lowercase
    await GET(request);

    expect(mockDecodeVIN).toHaveBeenCalledWith('1GCVKNEC0MZ123456'); // uppercase
  });

  it('returns 500 when decodeVIN throws', async () => {
    mockDecodeVIN.mockRejectedValue(new Error('API error'));

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API error');
  });

  it('calls getVehicleImageServerSide with vehicle info', async () => {
    const mockVehicle = {
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado',
    };

    mockDecodeVIN.mockResolvedValue(mockVehicle);
    mockGetVehicleImageServerSide.mockResolvedValue('https://example.com/car.jpg');

    const request = createRequest('1GCVKNEC0MZ123456');
    await GET(request);

    expect(mockGetVehicleImageServerSide).toHaveBeenCalledWith(mockVehicle);
  });

  it('includes rate limit headers in response', async () => {
    const mockVehicle = {
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado',
    };

    mockDecodeVIN.mockResolvedValue(mockVehicle);
    mockGetVehicleImageServerSide.mockResolvedValue('https://example.com/car.jpg');

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);

    expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
  });

  describe('rate limiting', () => {
    it('returns 429 when rate limit exceeded', async () => {
      const testIp = '192.168.50.50';
      
      mockDecodeVIN.mockResolvedValue({
        vin: '1GCVKNEC0MZ123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
      });
      mockGetVehicleImageServerSide.mockResolvedValue('https://example.com/car.jpg');

      // Make 20 requests (the limit for decode-vin)
      for (let i = 0; i < 20; i++) {
        const req = createRequest('1GCVKNEC0MZ123456', testIp);
        await GET(req);
      }

      // 21st request should be rate limited
      const request = createRequest('1GCVKNEC0MZ123456', testIp);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Too many requests');
    });
  });
});
