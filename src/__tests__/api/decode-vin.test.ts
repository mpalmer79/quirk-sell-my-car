import { GET } from '@/app/api/decode-vin/route';
import { NextRequest } from 'next/server';

// Mock the vinDecoder service
const mockDecodeVIN = jest.fn();
const mockIsValidVIN = jest.fn();

jest.mock('@/services/vinDecoder', () => ({
  decodeVIN: (...args: unknown[]) => mockDecodeVIN(...args),
  isValidVIN: (...args: unknown[]) => mockIsValidVIN(...args),
}));

describe('GET /api/decode-vin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: VIN validation passes
    mockIsValidVIN.mockReturnValue(true);
  });

  const createRequest = (vin?: string) => {
    const url = vin
      ? `http://localhost:3000/api/decode-vin?vin=${vin}`
      : 'http://localhost:3000/api/decode-vin';
    return new NextRequest(url);
  };

  it('returns 400 when VIN not provided', async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VIN parameter is required');
  });

  it('returns 400 for VIN with wrong length', async () => {
    mockIsValidVIN.mockReturnValue(false);
    
    const request = createRequest('ABC123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid VIN format');
  });

  it('returns 400 for VIN with invalid characters', async () => {
    mockIsValidVIN.mockReturnValue(false);
    
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
    
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockResolvedValue(mockVehicle);

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.vin).toBe('1GCVKNEC0MZ123456');
    expect(data.year).toBe(2021);
    expect(data.make).toBe('CHEVROLET');
    expect(data.model).toBe('Silverado');
  });

  it('calls decodeVIN with uppercase VIN', async () => {
    const mockVehicle = {
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado',
    };
    
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockResolvedValue(mockVehicle);

    const request = createRequest('1gcvknec0mz123456'); // lowercase
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

  it('handles network errors gracefully', async () => {
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockRejectedValue(new Error('Network error'));

    const request = createRequest('1GCVKNEC0MZ123456');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Network error');
  });

  it('trims whitespace from VIN', async () => {
    const mockVehicle = {
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado',
    };
    
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockResolvedValue(mockVehicle);

    const request = createRequest('  1GCVKNEC0MZ123456  ');
    await GET(request);

    expect(mockDecodeVIN).toHaveBeenCalledWith('1GCVKNEC0MZ123456');
  });
});
