// Vehicle Specifications Library
// Main export file - combines all make/model data and exports functions

import { VehicleSpecOptions, VehicleSpecsDatabase, ALL_DRIVETRAINS, DEFAULT_SPEC_OPTIONS } from './types';
import { asianSpecs } from './data/asian';
import { domesticSpecs } from './data/domestic';
import { europeanSpecs } from './data/european';
import { luxurySpecs } from './data/luxury';
import { electricSpecs } from './data/electric';

// Re-export types and constants
export { VehicleSpecOptions, ALL_DRIVETRAINS, DEFAULT_SPEC_OPTIONS };

// Combine all vehicle specs into single database
const VEHICLE_SPECS: VehicleSpecsDatabase = {
  ...asianSpecs,
  ...domesticSpecs,
  ...europeanSpecs,
  ...luxurySpecs,
  ...electricSpecs,
};

/**
 * Normalize model name for lookup
 * Handles variations like "F-150" vs "f-150", "CR-V" vs "cr-v", etc.
 * IMPORTANT: Preserves hyphens to match keys in VEHICLE_SPECS
 */
function normalizeModelName(model: string): string {
  return model
    .toLowerCase()
    .trim();
}

/**
 * Get vehicle specs (transmissions, engines, drivetrains) for a specific make/model
 * @param make - Vehicle make (e.g., "Nissan", "TOYOTA")
 * @param model - Vehicle model (e.g., "Sentra", "CAMRY")
 * @returns VehicleSpecOptions with available transmissions, engines, and drivetrains
 */
export function getVehicleSpecs(make: string, model: string): VehicleSpecOptions {
  const makeLower = make.toLowerCase().trim();
  const modelNormalized = normalizeModelName(model);

  // Look up make
  const makeSpecs = VEHICLE_SPECS[makeLower];
  if (!makeSpecs) {
    return DEFAULT_SPEC_OPTIONS;
  }

  // Look up model (try exact match first)
  let modelSpecs = makeSpecs[modelNormalized];
  
  // If no exact match, try partial matching for common variations
  if (!modelSpecs) {
    // Try removing spaces and special characters for matching
    const modelClean = modelNormalized.replace(/[\s-]/g, '');
    
    for (const [key, specs] of Object.entries(makeSpecs)) {
      const keyClean = key.replace(/[\s-]/g, '');
      if (keyClean === modelClean || key.includes(modelNormalized) || modelNormalized.includes(key)) {
        modelSpecs = specs;
        break;
      }
    }
  }

  if (!modelSpecs) {
    return DEFAULT_SPEC_OPTIONS;
  }

  return modelSpecs;
}

/**
 * Get available transmissions for a specific make/model
 */
export function getAvailableTransmissions(make: string, model: string): string[] {
  const specs = getVehicleSpecs(make, model);
  return specs.transmissions;
}

/**
 * Get available engines for a specific make/model
 */
export function getAvailableEngines(make: string, model: string): string[] {
  const specs = getVehicleSpecs(make, model);
  return specs.engines;
}

/**
 * Get available drivetrains for a specific make/model
 */
export function getAvailableDrivetrains(make: string, model: string): string[] {
  const specs = getVehicleSpecs(make, model);
  return specs.drivetrains;
}

/**
 * Check if a make exists in the database
 */
export function isMakeSupported(make: string): boolean {
  return make.toLowerCase().trim() in VEHICLE_SPECS;
}

/**
 * Check if a specific make/model combination exists (alias: hasVehicleSpecs)
 */
export function isModelSupported(make: string, model: string): boolean {
  const specs = getVehicleSpecs(make, model);
  return specs !== DEFAULT_SPEC_OPTIONS;
}

/**
 * Check if specs exist for a make/model (legacy alias)
 */
export function hasVehicleSpecs(make: string, model: string): boolean {
  return isModelSupported(make, model);
}

/**
 * Get all supported makes
 */
export function getSupportedMakes(): string[] {
  return Object.keys(VEHICLE_SPECS).map(make => 
    make.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
}

/**
 * Get all supported models for a make
 */
export function getSupportedModels(make: string): string[] {
  const makeLower = make.toLowerCase().trim();
  const makeSpecs = VEHICLE_SPECS[makeLower];
  
  if (!makeSpecs) {
    return [];
  }
  
  return Object.keys(makeSpecs).map(model =>
    model.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  );
}
