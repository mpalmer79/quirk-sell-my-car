import { getVehicleImage } from '@/services/vehicleImage';
import { VehicleInfo } from '@/types/vehicle';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('vehicleImage service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseVehicle: VehicleInfo = {
    vin: '1GCVKNEC0MZ123456',
    year: 2021,
    make: 'CHEVROLET',
    model: 'Silverado 1500',
  };

  it('returns image URL from API when successful', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/car.jpg' }),
    } as Response);

    const result = await getVehicleImage(baseVehicle);
    expect(result).toBe('https://example.com/car.jpg');
  });

  it('calls API with correct parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ imageUrl: 'https://example.com/car.jpg' }),
    } as Response);

    await getVehicleImage({ ...baseVehicle, bodyClass: 'Pickup' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/vehicle-image?')
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('year=2021')
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('make=CHEVROLET')
    );
  });

  it('returns SUV fallback for SUV body type when API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);

    const result = await getVehicleImage({ ...baseVehicle, bodyClass: 'Sport Utility Vehicle' });
    expect(result).toContain('unsplash.com');
  });

  it('returns pickup fallback for Pickup body type when API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);

    const result = await getVehicleImage({ ...baseVehicle, bodyClass: 'Pickup' });
    expect(result).toContain('unsplash.com');
  });

  it('returns sedan fallback for Sedan body type when API fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);

    const result = await getVehicleImage({ ...baseVehicle, bodyClass: 'Sedan' });
    expect(result).toContain('unsplash.com');
  });

  it('returns default fallback when API fails and body type unknown', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);

    const result = await getVehicleImage(baseVehicle);
    expect(result).toContain('unsplash.com');
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getVehicleImage({ ...baseVehicle, bodyClass: 'SUV' });
    expect(result).toContain('unsplash.com');
  });
});
