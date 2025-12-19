// Vehicle Image Service
// Uses body-type specific images for reliability
// Pexels/Imagin Studio removed - unreliable for specific vehicle matches

import { VehicleInfo } from '@/types/vehicle';

// High-quality curated images by body type
// These are reliable and always show the correct type of vehicle
const BODY_TYPE_IMAGES: Record<string, string> = {
  // Trucks/Pickups - Modern pickup truck
  'pickup': 'https://images.unsplash.com/photo-1590656364826-5f13d56f6f09?w=800&auto=format',
  'truck': 'https://images.unsplash.com/photo-1590656364826-5f13d56f6f09?w=800&auto=format',
  
  // SUVs/Crossovers - Modern SUV
  'suv': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'sport utility': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'utility': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'crossover': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  
  // Sedans - Modern sedan
  'sedan': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
  
  // Coupes/Sports - Sports car
  'coupe': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
  'sports': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
  
  // Hatchbacks
  'hatchback': 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&auto=format',
  
  // Wagons
  'wagon': 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
  'estate': 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
  
  // Convertibles
  'convertible': 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
  'roadster': 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
  'cabriolet': 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
  
  // Vans/Minivans
  'van': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  'minivan': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  'mpv': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
};

// Generic modern car as default
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format';

/**
 * Get fallback image based on body type
 * Works in any environment (client or server)
 */
export function getFallbackImage(vehicleInfo: VehicleInfo): string {
  if (vehicleInfo.bodyClass) {
    const bodyLower = vehicleInfo.bodyClass.toLowerCase();
    for (const [type, url] of Object.entries(BODY_TYPE_IMAGES)) {
      if (bodyLower.includes(type)) {
        return url;
      }
    }
  }
  return DEFAULT_IMAGE;
}

/**
 * Get vehicle image - uses body-type matching for reliability
 * Pexels/Imagin APIs removed - too unreliable (return wrong vehicles)
 * Body-type images always show correct type of vehicle
 */
export async function getVehicleImageServerSide(vehicleInfo: VehicleInfo): Promise<string> {
  // Use body-type image for reliability
  // This ensures a pickup shows a pickup, SUV shows an SUV, etc.
  return getFallbackImage(vehicleInfo);
}

/**
 * Client-side image fetcher
 * Returns body-type appropriate image
 */
export async function getVehicleImage(vehicleInfo: VehicleInfo): Promise<string> {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (!isBrowser) {
    return getVehicleImageServerSide(vehicleInfo);
  }

  // Client-side: use the API route
  try {
    const params = new URLSearchParams({
      year: vehicleInfo.year.toString(),
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      bodyClass: vehicleInfo.bodyClass || '',
    });
    
    const response = await fetch(`/api/vehicle-image?${params}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl;
    }
  } catch (error) {
    console.error('Error fetching vehicle image:', error);
  }
  
  return getFallbackImage(vehicleInfo);
}
