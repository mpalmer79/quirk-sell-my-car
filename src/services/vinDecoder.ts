
// VIN Decoder Service using NHTSA vPIC API (free, no key required)

import { VehicleInfo } from '@/types/vehicle';

interface NHTSAResult {
  Variable: string;
  Value: string | null;
}

interface NHTSAResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAResult[];
}

export async function decodeVIN(vin: string): Promise<VehicleInfo> {
  const cleanVin = vin.trim().toUpperCase();
  
  // Validate VIN length
  if (cleanVin.length !== 17) {
    throw new Error('VIN must be exactly 17 characters');
  }
  
  // Validate VIN characters (no I, O, Q allowed)
  if (/[IOQ]/i.test(cleanVin)) {
    throw new Error('VIN contains invalid characters (I, O, Q are not allowed)');
  }

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${cleanVin}?format=json`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to decode VIN');
    }
    
    const data: NHTSAResponse = await response.json();
    
    // Extract relevant fields from NHTSA response
    const getValue = (variableName: string): string | null => {
      const result = data.Results.find((r) => r.Variable === variableName);
      return result?.Value || null;
    };
    
    const year = getValue('Model Year');
    const make = getValue('Make');
    const model = getValue('Model');
    
    if (!year || !make || !model) {
      throw new Error('Unable to decode VIN - vehicle information not found');
    }
    
    return {
      vin: cleanVin,
      year: parseInt(year, 10),
      make,
      model,
      trim: getValue('Trim') || undefined,
      bodyClass: getValue('Body Class') || undefined,
      driveType: getValue('Drive Type') || undefined,
      engineCylinders: getValue('Engine Number of Cylinders')
        ? parseInt(getValue('Engine Number of Cylinders')!, 10)
        : undefined,
      engineDisplacement: getValue('Displacement (L)') || undefined,
      fuelType: getValue('Fuel Type - Primary') || undefined,
      transmissionStyle: getValue('Transmission Style') || undefined,
      doors: getValue('Doors') ? parseInt(getValue('Doors')!, 10) : undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to decode VIN');
  }
}

// Get available trims for a vehicle (mock - in production, use a commercial API)
export function getAvailableTrims(vehicleInfo: VehicleInfo): string[] {
  // This would typically come from a commercial API
  // For demo purposes, return common trims based on body class
  const trims: Record<string, string[]> = {
    'Pickup': ['Base', 'LT', 'Z71', 'RST', 'High Country'],
    'SUV': ['LS', 'LT', 'Premier', 'Z71', 'High Country'],
    'Sedan': ['LS', 'LT', 'Premier', 'RS'],
    'default': ['Base', 'Standard', 'Premium', 'Luxury'],
  };
  
  const bodyType = vehicleInfo.bodyClass?.split(' ')[0] || 'default';
  return trims[bodyType] || trims['default'];
}

// Validate VIN format
export function isValidVIN(vin: string): boolean {
  const cleanVin = vin.trim().toUpperCase();
  
  // Check length
  if (cleanVin.length !== 17) return false;
  
  // Check for invalid characters
  if (/[IOQ]/i.test(cleanVin)) return false;
  
  // Check that it only contains valid characters
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) return false;
  
  return true;
}
