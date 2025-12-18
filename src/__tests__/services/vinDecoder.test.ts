import { decodeVIN, isValidVIN, getEngineDescription, getTransmissionDescription, getDrivetrainDescription } from '@/services/vinDecoder';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('vinDecoder service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidVIN', () => {
    it('returns true for valid 17-character VIN', () => {
      expect(isValidVIN('1GCVKNEC0MZ123456')).toBe(true);
    });

    it('returns false for VIN with wrong length', () => {
      expect(isValidVIN('ABC123')).toBe(false);
      expect(isValidVIN('')).toBe(false);
      expect(isValidVIN('1GCVKNEC0MZ12345678')).toBe(false);
    });

    it('returns false for VIN with invalid characters I, O, Q', () => {
      expect(isValidVIN('1GCVKNEC0MZ12345I')).toBe(false); // Contains I
      expect(isValidVIN('1GCVKNEC0MZ12345O')).toBe(false); // Contains O
      expect(isValidVIN('1GCVKNEC0MZ12345Q')).toBe(false); // Contains Q
    });

    it('handles null and undefined', () => {
      expect(isValidVIN(null as unknown as string)).toBe(false);
      expect(isValidVIN(undefined as unknown as string)).toBe(false);
    });

    it('is case insensitive', () => {
      expect(isValidVIN('1gcvknec0mz123456')).toBe(true);
      expect(isValidVIN('1GcVkNeC0Mz123456')).toBe(true);
    });
  });

  describe('decodeVIN', () => {
    const mockNHTSAResponse = {
      Results: [
        { Variable: 'Model Year', Value: '2021' },
        { Variable: 'Make', Value: 'CHEVROLET' },
        { Variable: 'Model', Value: 'Silverado' },
        { Variable: 'Trim', Value: 'LT' },
        { Variable: 'Body Class', Value: 'Pickup' },
        { Variable: 'Drive Type', Value: 'AWD' },
        { Variable: 'Engine Number of Cylinders', Value: '8' },
        { Variable: 'Displacement (L)', Value: '5.3' },
        { Variable: 'Fuel Type - Primary', Value: 'Gasoline' },
        { Variable: 'Transmission Style', Value: 'Automatic' },
        { Variable: 'Transmission Speeds', Value: '10' },
        { Variable: 'Electrification Level', Value: null },
        { Variable: 'Doors', Value: '4' },
      ],
    };

    it('returns vehicle info for valid VIN', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNHTSAResponse,
      });

      const result = await decodeVIN('1GCVKNEC0MZ123456');

      expect(result.vin).toBe('1GCVKNEC0MZ123456');
      expect(result.year).toBe(2021);
      expect(result.make).toBe('CHEVROLET');
      expect(result.model).toBe('Silverado');
      expect(result.trim).toBe('LT');
      expect(result.bodyClass).toBe('Pickup');
      expect(result.driveType).toBe('AWD');
      expect(result.engineCylinders).toBe('8');
      expect(result.displacement).toBe('5.3');
      expect(result.transmissionStyle).toBe('Automatic');
      expect(result.transmissionSpeeds).toBe('10');
      expect(result.doors).toBe(4);
    });

    it('throws error for VIN with wrong length', async () => {
      await expect(decodeVIN('ABC123')).rejects.toThrow('Invalid VIN format');
    });

    it('throws error for VIN with invalid characters', async () => {
      await expect(decodeVIN('1GCVKNEC0MZ12345I')).rejects.toThrow('Invalid VIN format');
    });

    it('throws error when API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(decodeVIN('1GCVKNEC0MZ123456')).rejects.toThrow('NHTSA API error');
    });

    it('throws error when required fields missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Results: [
            { Variable: 'Model Year', Value: null },
            { Variable: 'Make', Value: null },
            { Variable: 'Model', Value: null },
          ],
        }),
      });

      await expect(decodeVIN('1GCVKNEC0MZ123456')).rejects.toThrow('required vehicle information not found');
    });

    it('converts VIN to uppercase', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNHTSAResponse,
      });

      const result = await decodeVIN('1gcvknec0mz123456');

      expect(result.vin).toBe('1GCVKNEC0MZ123456');
    });

    it('trims whitespace from VIN', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNHTSAResponse,
      });

      const result = await decodeVIN('  1GCVKNEC0MZ123456  ');

      expect(result.vin).toBe('1GCVKNEC0MZ123456');
    });

    it('filters out "Not Applicable" values', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Results: [
            { Variable: 'Model Year', Value: '2021' },
            { Variable: 'Make', Value: 'NISSAN' },
            { Variable: 'Model', Value: 'Sentra' },
            { Variable: 'Trim', Value: 'Not Applicable' },
            { Variable: 'Body Class', Value: 'Sedan' },
          ],
        }),
      });

      const result = await decodeVIN('1N4BL4BV5KC123456');

      expect(result.trim).toBeUndefined();
    });
  });

  describe('getEngineDescription', () => {
    it('returns description for V8 engine', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
        engineCylinders: '8',
        displacement: '5.3',
      };
      
      const desc = getEngineDescription(info);
      expect(desc).toContain('5.3L');
      expect(desc).toContain('V8');
    });

    it('returns Electric for BEV', () => {
      const info = {
        vin: 'TEST',
        year: 2023,
        make: 'TESLA',
        model: 'Model 3',
        electrificationLevel: 'BEV',
      };
      
      expect(getEngineDescription(info)).toBe('Electric');
    });

    it('includes Hybrid when applicable', () => {
      const info = {
        vin: 'TEST',
        year: 2023,
        make: 'TOYOTA',
        model: 'Prius',
        engineCylinders: '4',
        electrificationLevel: 'Hybrid',
      };
      
      const desc = getEngineDescription(info);
      expect(desc).toContain('Hybrid');
    });

    it('returns null when no engine info', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
      };
      
      expect(getEngineDescription(info)).toBeNull();
    });
  });

  describe('getTransmissionDescription', () => {
    it('returns CVT for CVT transmission', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'NISSAN',
        model: 'Sentra',
        transmissionStyle: 'Continuously Variable Transmission (CVT)',
      };
      
      expect(getTransmissionDescription(info)).toBe('CVT');
    });

    it('returns speed count for automatic', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
        transmissionStyle: 'Automatic',
        transmissionSpeeds: '10',
      };
      
      expect(getTransmissionDescription(info)).toBe('10-Speed Automatic');
    });

    it('returns Manual for manual transmission', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'FORD',
        model: 'Mustang',
        transmissionStyle: 'Manual',
        transmissionSpeeds: '6',
      };
      
      expect(getTransmissionDescription(info)).toBe('6-Speed Manual');
    });

    it('returns null when no transmission info', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
      };
      
      expect(getTransmissionDescription(info)).toBeNull();
    });
  });

  describe('getDrivetrainDescription', () => {
    it('returns FWD description', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'NISSAN',
        model: 'Sentra',
        driveType: 'FWD',
      };
      
      expect(getDrivetrainDescription(info)).toBe('Front Wheel Drive (FWD)');
    });

    it('returns AWD description', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'SUBARU',
        model: 'Outback',
        driveType: 'All-Wheel Drive',
      };
      
      expect(getDrivetrainDescription(info)).toBe('All Wheel Drive (AWD)');
    });

    it('returns 4WD description', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'JEEP',
        model: 'Wrangler',
        driveType: '4WD',
      };
      
      expect(getDrivetrainDescription(info)).toBe('4WD / 4×4');
    });

    it('returns RWD description', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'BMW',
        model: '3 Series',
        driveType: 'Rear-Wheel Drive',
      };
      
      expect(getDrivetrainDescription(info)).toBe('Rear Wheel Drive (RWD)');
    });

    it('returns null when no drivetrain info', () => {
      const info = {
        vin: 'TEST',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
      };
      
      expect(getDrivetrainDescription(info)).toBeNull();
    });
  });
});
