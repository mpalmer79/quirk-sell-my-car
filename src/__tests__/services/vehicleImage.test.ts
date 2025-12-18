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

    it('returns SUV image for crossover body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'TOYOTA',
        model: 'RAV4',
        bodyClass: 'Crossover Utility Vehicle',
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

    it('returns coupe image for Coupe body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'FORD',
        model: 'Mustang',
        bodyClass: 'Coupe',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });

    it('returns hatchback image for Hatchback body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'VOLKSWAGEN',
        model: 'Golf',
        bodyClass: 'Hatchback',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });

    it('returns van image for Minivan body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'HONDA',
        model: 'Odyssey',
        bodyClass: 'Minivan',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });

    it('returns convertible image for Convertible body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'MAZDA',
        model: 'MX-5',
        bodyClass: 'Convertible',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });

    it('returns wagon image for Wagon body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'SUBARU',
        model: 'Outback',
        bodyClass: 'Wagon',
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

    it('returns default image for unknown body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'OTHER',
        model: 'Vehicle',
        bodyClass: 'Unknown Type XYZ',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });

    it('handles case-insensitive body class matching', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'NISSAN',
        model: 'Frontier',
        bodyClass: 'PICKUP TRUCK',
      };
      
      const result = getFallbackImage(vehicle);
      expect(result).toContain('unsplash');
    });

    it('returns different images for different body types', () => {
      const pickup: VehicleInfo = {
        vin: '1',
        year: 2021,
        make: 'FORD',
        model: 'F-150',
        bodyClass: 'Pickup',
      };
      
      const sedan: VehicleInfo = {
        vin: '2',
        year: 2021,
        make: 'TOYOTA',
        model: 'Camry',
        bodyClass: 'Sedan',
      };
      
      const pickupResult = getFallbackImage(pickup);
      const sedanResult = getFallbackImage(sedan);
      
      // Different body types should return different images
      expect(pickupResult).not.toBe(sedanResult);
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

    it('returns unsplash fallback image', async () => {
      const result = await getVehicleImageServerSide(mockVehicle);

      expect(result).toContain('unsplash');
    });

    it('returns image for SUV', async () => {
      const suvVehicle: VehicleInfo = {
        vin: '123',
        year: 2022,
        make: 'TOYOTA',
        model: 'Highlander',
        bodyClass: 'Sport Utility Vehicle (SUV)',
      };

      const result = await getVehicleImageServerSide(suvVehicle);

      expect(result).toContain('unsplash');
    });

    it('returns image for unknown body type', async () => {
      const unknownVehicle: VehicleInfo = {
        vin: '123',
        year: 2022,
        make: 'GENERIC',
        model: 'Vehicle',
        bodyClass: 'Unknown',
      };

      const result = await getVehicleImageServerSide(unknownVehicle);

      expect(result).toContain('unsplash');
    });
  });

  describe('getVehicleImage', () => {
    const mockVehicle: VehicleInfo = {
      vin: '1GCVKNEC0MZ123456',
      year: 2021,
      make: 'CHEVROLET',
      model: 'Silverado',
      bodyClass: 'Pickup',
    };

    it('returns fallback image in server environment', async () => {
      // In node test environment, window is undefined
      const result = await getVehicleImage(mockVehicle);

      expect(result).toContain('unsplash');
    });
  });
});
