/**
 * @jest-environment node
 */

import { getFallbackImage, getVehicleImageServerSide, getVehicleImage } from '@/services/vehicleImage';
import { VehicleInfo } from '@/types/vehicle';

// Mock fetch for API calls
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('vehicleImage service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('getFallbackImage', () => {
    it('returns SUV image for SUV body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Tahoe',
        bodyClass: 'Sport Utility Vehicle (SUV)',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });

    it('returns pickup image for Pickup body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
        bodyClass: 'Pickup',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });

    it('returns sedan image for Sedan body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Malibu',
        bodyClass: 'Sedan',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });

    it('returns default image when no body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Unknown',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });
  });

  describe('getVehicleImageServerSide', () => {
    const mockVehicle: VehicleInfo = {
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado',
      bodyClass: 'Pickup',
    };

    it('returns fallback image when PEXELS_API_KEY not set', async () => {
      const originalEnv = process.env.PEXELS_API_KEY;
      delete process.env.PEXELS_API_KEY;

      const result = await getVehicleImageServerSide(mockVehicle);

      expect(result).toContain('unsplash');
      expect(mockFetch).not.toHaveBeenCalled();

      if (originalEnv) {
        process.env.PEXELS_API_KEY = originalEnv;
      }
    });

    it('calls Pexels API when key is set', async () => {
      process.env.PEXELS_API_KEY = 'test-pexels-key';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [{ src: { large: 'https://pexels.com/photo.jpg' } }],
        }),
      } as Response);

      const result = await getVehicleImageServerSide(mockVehicle);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('api.pexels.com'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'test-pexels-key',
          }),
        })
      );
      expect(result).toBe('https://pexels.com/photo.jpg');

      delete process.env.PEXELS_API_KEY;
    });

    it('returns fallback on Pexels API error', async () => {
      process.env.PEXELS_API_KEY = 'test-pexels-key';
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImageServerSide(mockVehicle);

      expect(result).toContain('unsplash');

      delete process.env.PEXELS_API_KEY;
    });

    it('returns fallback when no photos found', async () => {
      process.env.PEXELS_API_KEY = 'test-pexels-key';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [],
        }),
      } as Response);

      const result = await getVehicleImageServerSide(mockVehicle);

      expect(result).toContain('unsplash');

      delete process.env.PEXELS_API_KEY;
    });
  });
});
