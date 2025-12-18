import { getVehicleImage } from '@/services/vehicleImage';
import { VehicleInfo } from '@/types/vehicle';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('vehicleImage service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseVehicleInfo: VehicleInfo = {
    vin: '1GCVKNEC0MZ123456',
    year: 2021,
    make: 'CHEVROLET',
    model: 'Silverado 1500',
  };

  describe('getVehicleImage', () => {
    it('should return image URL from API when successful', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ imageUrl: 'https://example.com/car.jpg' }),
      } as Response);

      const result = await getVehicleImage(baseVehicleInfo);

      expect(result).toBe('https://example.com/car.jpg');
    });

    it('should call API with correct query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ imageUrl: 'https://example.com/car.jpg' }),
      } as Response);

      await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Pickup',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/vehicle-image?year=2021&make=CHEVROLET&model=Silverado+1500&bodyClass=Pickup'
      );
    });

    it('should handle empty bodyClass', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ imageUrl: 'https://example.com/car.jpg' }),
      } as Response);

      await getVehicleImage(baseVehicleInfo);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/vehicle-image?year=2021&make=CHEVROLET&model=Silverado+1500&bodyClass='
      );
    });

    it('should return SUV fallback image when API fails and bodyClass is SUV', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Sport Utility Vehicle',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format');
    });

    it('should return pickup fallback image when API fails and bodyClass is Pickup', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Pickup Truck',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format');
    });

    it('should return sedan fallback image when API fails and bodyClass is Sedan', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Sedan',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format');
    });

    it('should return coupe fallback image when API fails and bodyClass is Coupe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Coupe',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format');
    });

    it('should return van fallback image when API fails and bodyClass is Van', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Cargo Van',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format');
    });

    it('should return minivan fallback image for minivan body class', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Minivan',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format');
    });

    it('should return default image when API fails and bodyClass is unrecognized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Unknown Type',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format');
    });

    it('should return default image when API fails and no bodyClass', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage(baseVehicleInfo);

      expect(result).toBe('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format');
    });

    it('should handle fetch throwing an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'SUV',
      });

      // Should fall back to body type image
      expect(result).toBe('https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format');
    });

    it('should be case-insensitive for body class matching', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'PICKUP',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format');
    });

    it('should match crossover to SUV image', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Crossover Utility Vehicle',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format');
    });

    it('should match utility to SUV image', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await getVehicleImage({
        ...baseVehicleInfo,
        bodyClass: 'Sport Utility',
      });

      expect(result).toBe('https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format');
    });
  });
});
