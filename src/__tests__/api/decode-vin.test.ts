/**
 * @jest-environment node
 */

// Mock next/server before any imports
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url: string) => ({
      nextUrl: new URL(url),
      headers: new Headers(),
    })),
    NextResponse: {
      json: jest.fn((data: unknown, init?: { status?: number }) => ({
        status: init?.status || 200,
        json: async () => data,
        headers: new Headers(),
      })),
    },
  };
});

// Mock the vinDecoder service
const mockDecodeVIN = jest.fn();
const mockIsValidVIN = jest.fn();

jest.mock('@/services/vinDecoder', () => ({
  decodeVIN: (...args: unknown[]) => mockDecodeVIN(...args),
  isValidVIN: (...args: unknown[]) => mockIsValidVIN(...args),
}));

// Import after mocks
import { GET } from '@/app/api/decode-vin/route';

describe('GET /api/decode-vin', () => {
  // Mock console.error to prevent Jest setup from failing on expected errors
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: VIN validation passes
    mockIsValidVIN.mockReturnValue(true);
    // Suppress console.error during tests (route.ts logs errors)
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error = originalConsoleError;
  });

  const createMockRequest = (vin?: string) => {
    const url = vin
      ? `http://localhost:3000/api/decode-vin?vin=${vin}`
      : 'http://localhost:3000/api/decode-vin';
    return {
      nextUrl: new URL(url),
      headers: new Headers(),
    };
  };

  it('returns 400 when VIN not provided', async () => {
    const request = createMockRequest();
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VIN parameter is required');
  });

  it('returns 400 for invalid VIN format', async () => {
    mockIsValidVIN.mockReturnValue(false);
    
    const request = createMockRequest('ABC123');
    const response = await GET(request as any);
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

    const request = createMockRequest('1GCVKNEC0MZ123456');
    const response = await GET(request as any);
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

    const request = createMockRequest('1gcvknec0mz123456');
    await GET(request as any);

    expect(mockDecodeVIN).toHaveBeenCalledWith('1GCVKNEC0MZ123456');
  });

  it('returns 500 when decodeVIN throws', async () => {
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockRejectedValue(new Error('API error'));

    const request = createMockRequest('1GCVKNEC0MZ123456');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API error');
    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });

  it('handles network errors gracefully', async () => {
    mockIsValidVIN.mockReturnValue(true);
    mockDecodeVIN.mockRejectedValue(new Error('Network error'));

    const request = createMockRequest('1GCVKNEC0MZ123456');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Network error');
    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
  });
});
