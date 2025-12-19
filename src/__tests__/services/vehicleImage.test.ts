import { getVehicleImage, getVehicleImageByMake, getFallbackImage } from '@/services/vehicleImage';
import { VehicleInfo } from '@/types/vehicle';

describe('vehicleImage service - Make + Body Type', () => {
  describe('getVehicleImageByMake', () => {
    // NISSAN tests
    it('returns truck image for NISSAN Pickup', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2025,
        make: 'NISSAN',
        model: 'Frontier',
        bodyClass: 'Pickup',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    it('returns SUV image for NISSAN SUV', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'NISSAN',
        model: 'Rogue',
        bodyClass: 'Sport Utility Vehicle (SUV)',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    // TOYOTA tests
    it('returns truck image for TOYOTA Pickup', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'TOYOTA',
        model: 'Tacoma',
        bodyClass: 'Crew Cab Pickup',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    it('returns SUV image for TOYOTA SUV', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'TOYOTA',
        model: 'RAV4',
        bodyClass: 'Sport Utility Vehicle (SUV)',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    // CHEVROLET tests
    it('returns truck image for CHEVROLET Pickup', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'CHEVROLET',
        model: 'Silverado',
        bodyClass: 'Crew Cab Pickup',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    it('returns sedan image for CHEVROLET Sedan', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'CHEVROLET',
        model: 'Malibu',
        bodyClass: 'Sedan',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    // FORD tests
    it('returns truck image for FORD Pickup', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'FORD',
        model: 'F-150',
        bodyClass: 'Crew Cab Pickup',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    // Case insensitivity tests
    it('handles lowercase make', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'nissan',
        model: 'Frontier',
        bodyClass: 'Pickup',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    it('handles mixed case make', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'Chevrolet',
        model: 'Silverado',
        bodyClass: 'Pickup',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    // Fallback tests
    it('falls back to body type when make unknown', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'UNKNOWN_MAKE',
        model: 'Vehicle',
        bodyClass: 'Pickup',
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });

    it('returns default when no body class', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'UNKNOWN',
        model: 'Vehicle',
        bodyClass: undefined,
      };
      
      const result = getVehicleImageByMake(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });
  });

  describe('getVehicleImage (async)', () => {
    it('returns same result as sync version', async () => {
      const vehicleInfo: VehicleInfo = {
        year: 2025,
        make: 'NISSAN',
        model: 'Frontier',
        bodyClass: 'Pickup',
      };
      
      const asyncResult = await getVehicleImage(vehicleInfo);
      const syncResult = getVehicleImageByMake(vehicleInfo);
      
      expect(asyncResult).toBe(syncResult);
    });
  });

  describe('getFallbackImage', () => {
    it('returns body type image as fallback', () => {
      const vehicleInfo: VehicleInfo = {
        year: 2024,
        make: 'TOYOTA',
        model: 'Camry',
        bodyClass: 'Sedan',
      };
      
      const result = getFallbackImage(vehicleInfo);
      expect(result).toContain('unsplash.com');
    });
  });

  describe('body type detection', () => {
    const testCases = [
      { bodyClass: 'Pickup', expectedType: 'truck' },
      { bodyClass: 'Crew Cab Pickup', expectedType: 'truck' },
      { bodyClass: 'Extended Cab Pickup', expectedType: 'truck' },
      { bodyClass: 'Sport Utility Vehicle (SUV)', expectedType: 'suv' },
      { bodyClass: 'Crossover Utility Vehicle', expectedType: 'suv' },
      { bodyClass: 'Sedan', expectedType: 'sedan' },
      { bodyClass: '4-Door Sedan', expectedType: 'sedan' },
      { bodyClass: 'Coupe', expectedType: 'coupe' },
      { bodyClass: 'Hatchback', expectedType: 'hatchback' },
      { bodyClass: 'Minivan', expectedType: 'van' },
      { bodyClass: 'Passenger Van', expectedType: 'van' },
      { bodyClass: 'Station Wagon', expectedType: 'wagon' },
      { bodyClass: 'Convertible', expectedType: 'convertible' },
    ];

    testCases.forEach(({ bodyClass }) => {
      it(`correctly handles ${bodyClass}`, () => {
        const vehicleInfo: VehicleInfo = {
          year: 2024,
          make: 'TOYOTA',
          model: 'Test',
          bodyClass,
        };
        
        const result = getVehicleImageByMake(vehicleInfo);
        expect(result).toContain('unsplash.com');
      });
    });
  });
});
