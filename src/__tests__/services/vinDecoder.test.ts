import { decodeVIN, isValidVIN, getAvailableTrims } from '@/services/vinDecoder';
import { VehicleInfo } from '@/types/vehicle';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('vinDecoder service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidVIN', () => {
    it('returns true for valid 17-character VIN', () => {
      expect(isValidVIN('1GCVKNEC0MZ123456')).toBe(true);
    });

    it('returns true for lowercase VIN', () => {
      expect(isValidVIN('1gcvknec0mz123456')).toBe(true);
    });

    it('returns false for VIN with less than 17 characters', () => {
      expect(isValidVIN('1GCVKNEC0MZ12345')).toBe(false);
    });

    it('returns false for VIN with more than 17 characters', () => {
      expect(isValidVIN('1GCVKNEC0MZ1234567')).toBe(false);
    });

    it('returns false for VIN containing I', () => {
      expect(isValidVIN('1GCVKNEC0MZI23456')).toBe(false);
    });

    it('returns false for VIN containing O', () => {
      expect(isValidVIN('1GCVKNEC0MZO23456')).toBe(false);
    });

    it('returns false for VIN containing Q', () => {
      expect(isValidVIN('1GCVKNEC0MZQ23456')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidVIN('')).toBe(false);
    });

    it('trims whitespace', () => {
      expect(isValidVIN('  1GCVKNEC0MZ123456  ')).toBe(true);
    });
  });

  describe('decodeVIN', () => {
    const mockNHTSAResponse = {
      Count: 136,
      Message: 'Results returned successfully',
      Results: [
        { Variable: 'Model Year', Value: '2021' },
        { Variable: 'Make', Value: 'CHEVROLET' },
        { Variable: 'Model', Value: 'Silverado 1500' },
        { Variable: 'Trim', Value: 'LT' },
        { Variable: 'Body Class', Value: 'Pickup' },
        { Variable: 'Drive Type', Value: '4WD' },
        { Variable: 'Engine Number of Cylinders', Value: '8' },
        { Variable: 'Displacement (L)', Value: '5.3' },
        { Variable: 'Fuel Type - Primary', Value: 'Gasoline' },
        { Variable: 'Transmission Style', Value: 'Automatic' },
        { Variable: 'Doors', Value: '4' },
      ],
    };

    it('decodes valid VIN successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNHTSAResponse,
      } as Response);

      const result = await decodeVIN('1GCVKNEC0MZ123456');

      expect(result.vin).toBe('1GCVKNEC0MZ123456');
      expect(result.year).toBe(2021);
      expect(result.make).toBe('CHEVROLET');
      expect(result.model).toBe('Silverado 1500');
    });

    it('calls NHTSA API with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNHTSAResponse,
      } as Response);

      await decodeVIN('1GCVKNEC0MZ123456');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/1GCVKNEC0MZ123456?format=json'
      );
    });

    it('throws error for VIN with wrong length', async () => {
      await expect(decodeVIN('SHORT')).rejects.toThrow('VIN must be exactly 17 characters');
    });

    it('throws error for VIN with invalid characters', async () => {
      await expect(decodeVIN('1GCVKNEC0MZI23456')).rejects.toThrow(
        'VIN contains invalid characters'
      );
    });

    it('throws error when API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(decodeVIN('1GCVKNEC0MZ123456')).rejects.toThrow('Failed to decode VIN');
    });

    it('throws error when required fields missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Results: [{ Variable: 'Model Year', Value: '2021' }],
        }),
      } as Response);

      await expect(decodeVIN('1GCVKNEC0MZ123456')).rejects.toThrow(
        'Unable to decode VIN'
      );
    });
  });

  describe('getAvailableTrims', () => {
    it('returns pickup trims for Pickup body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'CHEVY',
        model: 'Silverado',
        bodyClass: 'Pickup',
      };
      const trims = getAvailableTrims(vehicle);
      expect(trims).toContain('LT');
      expect(trims).toContain('High Country');
    });

    it('returns SUV trims for SUV body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'CHEVY',
        model: 'Tahoe',
        bodyClass: 'SUV Standard',
      };
      const trims = getAvailableTrims(vehicle);
      expect(trims).toContain('LS');
      expect(trims).toContain('Premier');
    });

    it('returns default trims for unknown body class', () => {
      const vehicle: VehicleInfo = {
        vin: '123',
        year: 2021,
        make: 'CHEVY',
        model: 'Unknown',
        bodyClass: 'Unknown',
      };
      const trims = getAvailableTrims(vehicle);
      expect(trims).toContain('Base');
      expect(trims).toContain('Premium');
    });
  });
});
