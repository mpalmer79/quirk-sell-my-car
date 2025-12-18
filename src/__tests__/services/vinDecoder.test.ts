import { decodeVIN, isValidVIN, getAvailableTrims } from '@/services/vinDecoder';
import { VehicleInfo } from '@/types/vehicle';

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('vinDecoder service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidVIN', () => {
    it('should return true for a valid 17-character VIN', () => {
      expect(isValidVIN('1GCVKNEC0MZ123456')).toBe(true);
    });

    it('should return true for lowercase VIN (converts to uppercase)', () => {
      expect(isValidVIN('1gcvknec0mz123456')).toBe(true);
    });

    it('should return false for VIN with less than 17 characters', () => {
      expect(isValidVIN('1GCVKNEC0MZ12345')).toBe(false);
    });

    it('should return false for VIN with more than 17 characters', () => {
      expect(isValidVIN('1GCVKNEC0MZ1234567')).toBe(false);
    });

    it('should return false for VIN containing letter I', () => {
      expect(isValidVIN('1GCVKNEC0MZI23456')).toBe(false);
    });

    it('should return false for VIN containing letter O', () => {
      expect(isValidVIN('1GCVKNEC0MZO23456')).toBe(false);
    });

    it('should return false for VIN containing letter Q', () => {
      expect(isValidVIN('1GCVKNEC0MZQ23456')).toBe(false);
    });

    it('should return false for VIN with special characters', () => {
      expect(isValidVIN('1GCVKNEC0MZ12345!')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidVIN('')).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(isValidVIN('  1GCVKNEC0MZ123456  ')).toBe(true);
    });
  });

  describe('decodeVIN', () => {
    const mockNHTSAResponse = {
      Count: 136,
      Message: 'Results returned successfully',
      SearchCriteria: 'VIN:1GCVKNEC0MZ123456',
      Results: [
        { Variable: 'Model Year', Value: '2021' },
        { Variable: 'Make', Value: 'CHEVROLET' },
        { Variable: 'Model', Value: 'Silverado 1500' },
        { Variable: 'Trim', Value: 'LT' },
        { Variable: 'Body Class', Value: 'Pickup' },
        { Variable: 'Drive Type', Value: '4WD/4-Wheel Drive/4x4' },
        { Variable: 'Engine Number of Cylinders', Value: '8' },
        { Variable: 'Displacement (L)', Value: '5.3' },
        { Variable: 'Fuel Type - Primary', Value: 'Gasoline' },
        { Variable: 'Transmission Style', Value: 'Automatic' },
        { Variable: 'Doors', Value: '4' },
      ],
    };

    it('should successfully decode a valid VIN', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNHTSAResponse,
      } as Response);

      const result = await decodeVIN('1GCVKNEC0MZ123456');

      expect(result).toEqual({
        vin: '1GCVKNEC0MZ123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado 1500',
        trim: 'LT',
        bodyClass: 'Pickup',
        driveType: '4WD/4-Wheel Drive/4x4',
        engineCylinders: 8,
        engineDisplacement: '5.3',
        fuelType: 'Gasoline',
        transmissionStyle: 'Automatic',
        doors: 4,
      });
    });

    it('should call NHTSA API with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNHTSAResponse,
      } as Response);

      await decodeVIN('1GCVKNEC0MZ123456');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/1GCVKNEC0MZ123456?format=json'
      );
    });

    it('should convert VIN to uppercase', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNHTSAResponse,
      } as Response);

      await decodeVIN('1gcvknec0mz123456');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/1GCVKNEC0MZ123456?format=json'
      );
    });

    it('should throw error for VIN with incorrect length', async () => {
      await expect(decodeVIN('1GCVKNEC0MZ12345')).rejects.toThrow(
        'VIN must be exactly 17 characters'
      );
    });

    it('should throw error for VIN containing invalid characters', async () => {
      await expect(decodeVIN('1GCVKNEC0MZI23456')).rejects.toThrow(
        'VIN contains invalid characters (I, O, Q are not allowed)'
      );
    });

    it('should throw error when API returns non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(decodeVIN('1GCVKNEC0MZ123456')).rejects.toThrow(
        'Failed to decode VIN'
      );
    });

    it('should throw error when required fields are missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockNHTSAResponse,
          Results: [
            { Variable: 'Model Year', Value: '2021' },
            // Missing Make and Model
          ],
        }),
      } as Response);

      await expect(decodeVIN('1GCVKNEC0MZ123456')).rejects.toThrow(
        'Unable to decode VIN - vehicle information not found'
      );
    });

    it('should handle optional fields being null', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockNHTSAResponse,
          Results: [
            { Variable: 'Model Year', Value: '2021' },
            { Variable: 'Make', Value: 'CHEVROLET' },
            { Variable: 'Model', Value: 'Silverado 1500' },
            { Variable: 'Trim', Value: null },
            { Variable: 'Body Class', Value: null },
          ],
        }),
      } as Response);

      const result = await decodeVIN('1GCVKNEC0MZ123456');

      expect(result.trim).toBeUndefined();
      expect(result.bodyClass).toBeUndefined();
    });

    it('should handle fetch network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(decodeVIN('1GCVKNEC0MZ123456')).rejects.toThrow('Network error');
    });
  });

  describe('getAvailableTrims', () => {
    it('should return pickup trims for Pickup body class', () => {
      const vehicleInfo: VehicleInfo = {
        vin: '1GCVKNEC0MZ123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado 1500',
        bodyClass: 'Pickup',
      };

      const trims = getAvailableTrims(vehicleInfo);

      expect(trims).toEqual(['Base', 'LT', 'Z71', 'RST', 'High Country']);
    });

    it('should return SUV trims for SUV body class', () => {
      const vehicleInfo: VehicleInfo = {
        vin: '1GNEV13049R123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Tahoe',
        bodyClass: 'SUV - Standard',
      };

      const trims = getAvailableTrims(vehicleInfo);

      expect(trims).toEqual(['LS', 'LT', 'Premier', 'Z71', 'High Country']);
    });

    it('should return sedan trims for Sedan body class', () => {
      const vehicleInfo: VehicleInfo = {
        vin: '1G1BE5SM6H7123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Malibu',
        bodyClass: 'Sedan',
      };

      const trims = getAvailableTrims(vehicleInfo);

      expect(trims).toEqual(['LS', 'LT', 'Premier', 'RS']);
    });

    it('should return default trims when body class is not recognized', () => {
      const vehicleInfo: VehicleInfo = {
        vin: '1G1BE5SM6H7123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Unknown',
        bodyClass: 'Unknown Type',
      };

      const trims = getAvailableTrims(vehicleInfo);

      expect(trims).toEqual(['Base', 'Standard', 'Premium', 'Luxury']);
    });

    it('should return default trims when body class is undefined', () => {
      const vehicleInfo: VehicleInfo = {
        vin: '1G1BE5SM6H7123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Unknown',
      };

      const trims = getAvailableTrims(vehicleInfo);

      expect(trims).toEqual(['Base', 'Standard', 'Premium', 'Luxury']);
    });
  });
});
