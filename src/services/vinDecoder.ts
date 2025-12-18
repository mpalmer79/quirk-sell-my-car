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

/**
 * Validates a VIN format
 * @param vin - The VIN to validate
 * @returns true if valid, false otherwise
 */
export function isValidVIN(vin: string): boolean {
  if (!vin || typeof vin !== 'string') return false;
  
  const cleanVin = vin.trim().toUpperCase();
  
  // Must be exactly 17 characters
  if (cleanVin.length !== 17) return false;
  
  // Cannot contain I, O, or Q
  if (/[IOQ]/i.test(cleanVin)) return false;
  
  // Must be alphanumeric
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) return false;
  
  return true;
}

/**
 * Decodes a VIN using the NHTSA vPIC API
 * @param vin - The 17-character VIN to decode
 * @returns Promise<VehicleInfo> with decoded vehicle information
 * @throws Error if VIN is invalid or decode fails
 */
export async function decodeVIN(vin: string): Promise<VehicleInfo> {
  const cleanVin = vin.trim().toUpperCase();
  
  // Validate VIN
  if (!isValidVIN(cleanVin)) {
    throw new Error('Invalid VIN format. VIN must be 17 characters and cannot contain I, O, or Q.');
  }

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${cleanVin}?format=json`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }
    
    const data: NHTSAResponse = await response.json();
    
    // Helper to extract values from NHTSA response
    const getValue = (variableName: string): string | null => {
      const result = data.Results.find((r) => r.Variable === variableName);
      const value = result?.Value;
      // NHTSA returns "Not Applicable" or empty strings for unavailable data
      if (!value || value === 'Not Applicable' || value.trim() === '') {
        return null;
      }
      return value.trim();
    };
    
    // Required fields
    const year = getValue('Model Year');
    const make = getValue('Make');
    const model = getValue('Model');
    
    if (!year || !make || !model) {
      throw new Error('Unable to decode VIN - required vehicle information not found');
    }
    
    // Parse doors as number
    const doorsStr = getValue('Doors');
    const doors = doorsStr ? parseInt(doorsStr, 10) : undefined;
    
    return {
      vin: cleanVin,
      year: parseInt(year, 10),
      make,
      model,
      trim: getValue('Trim') || undefined,
      bodyClass: getValue('Body Class') || undefined,
      // Drivetrain info
      driveType: getValue('Drive Type') || undefined,
      // Engine info
      engineCylinders: getValue('Engine Number of Cylinders') || undefined,
      displacement: getValue('Displacement (L)') || undefined,
      fuelType: getValue('Fuel Type - Primary') || undefined,
      electrificationLevel: getValue('Electrification Level') || undefined,
      // Transmission info
      transmissionStyle: getValue('Transmission Style') || undefined,
      transmissionSpeeds: getValue('Transmission Speeds') || undefined,
      // Other
      doors: isNaN(doors!) ? undefined : doors,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to decode VIN. Please try again.');
  }
}

/**
 * Get a display-friendly engine description from VehicleInfo
 * @param info - VehicleInfo object
 * @returns Human-readable engine description or null
 */
export function getEngineDescription(info: VehicleInfo): string | null {
  const parts: string[] = [];
  
  if (info.displacement) {
    parts.push(`${info.displacement}L`);
  }
  
  if (info.engineCylinders) {
    const cyl = parseInt(info.engineCylinders, 10);
    if (cyl === 4) parts.push('4-Cylinder');
    else if (cyl === 6) parts.push('V6');
    else if (cyl === 8) parts.push('V8');
    else if (cyl === 10) parts.push('V10');
    else if (cyl === 12) parts.push('V12');
    else parts.push(`${cyl}-Cylinder`);
  }
  
  if (info.fuelType) {
    const fuel = info.fuelType.toLowerCase();
    if (fuel.includes('diesel')) parts.push('Diesel');
    else if (fuel.includes('flex')) parts.push('Flex Fuel');
    else if (fuel.includes('electric')) parts.push('Electric');
  }
  
  if (info.electrificationLevel) {
    const elec = info.electrificationLevel.toLowerCase();
    if (elec.includes('bev') || elec.includes('battery electric')) {
      return 'Electric';
    }
    if (elec.includes('hybrid')) {
      parts.push('Hybrid');
    }
  }
  
  return parts.length > 0 ? parts.join(' ') : null;
}

/**
 * Get a display-friendly transmission description from VehicleInfo
 * @param info - VehicleInfo object
 * @returns Human-readable transmission description or null
 */
export function getTransmissionDescription(info: VehicleInfo): string | null {
  if (!info.transmissionStyle) return null;
  
  const style = info.transmissionStyle.toLowerCase();
  const speeds = info.transmissionSpeeds;
  
  if (style.includes('cvt') || style.includes('continuously variable')) {
    return 'CVT';
  }
  
  if (style.includes('manual')) {
    return speeds ? `${speeds}-Speed Manual` : 'Manual';
  }
  
  if (style.includes('automatic') || style.includes('auto')) {
    return speeds ? `${speeds}-Speed Automatic` : 'Automatic';
  }
  
  return info.transmissionStyle;
}

/**
 * Get a display-friendly drivetrain description from VehicleInfo
 * @param info - VehicleInfo object
 * @returns Human-readable drivetrain description or null
 */
export function getDrivetrainDescription(info: VehicleInfo): string | null {
  if (!info.driveType) return null;
  
  const drive = info.driveType.toLowerCase();
  
  if (drive.includes('fwd') || drive.includes('front wheel') || drive.includes('front-wheel')) {
    return 'Front Wheel Drive (FWD)';
  }
  if (drive.includes('rwd') || drive.includes('rear wheel') || drive.includes('rear-wheel')) {
    return 'Rear Wheel Drive (RWD)';
  }
  if (drive.includes('4wd') || drive.includes('4x4') || drive.includes('four wheel') || drive.includes('four-wheel')) {
    return '4WD / 4×4';
  }
  if (drive.includes('awd') || drive.includes('all wheel') || drive.includes('all-wheel')) {
    return 'All Wheel Drive (AWD)';
  }
  
  return info.driveType;
}
