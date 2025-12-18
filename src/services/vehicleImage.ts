// Vehicle Image Service
// Multi-source fallback chain: Imagin Studio → Pexels → Body Type → Default

import { VehicleInfo } from '@/types/vehicle';

// Body type images - curated fallbacks for each vehicle type
const BODY_TYPE_IMAGES: Record<string, string> = {
  // Trucks/Pickups
  'pickup': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format',
  'truck': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format',
  
  // SUVs/Crossovers
  'suv': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'sport utility': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'utility': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'crossover': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  
  // Sedans
  'sedan': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
  
  // Coupes/Sports
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
  
  // Vans
  'van': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  'minivan': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  'mpv': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
};

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
 * Get body type keyword for search queries
 */
function getBodyTypeKeyword(bodyClass?: string): string {
  if (!bodyClass) return '';
  
  const bodyLower = bodyClass.toLowerCase();
  
  if (bodyLower.includes('pickup') || bodyLower.includes('truck')) return 'truck';
  if (bodyLower.includes('suv') || bodyLower.includes('utility') || bodyLower.includes('crossover')) return 'suv';
  if (bodyLower.includes('sedan')) return 'sedan';
  if (bodyLower.includes('coupe')) return 'coupe';
  if (bodyLower.includes('hatchback')) return 'hatchback';
  if (bodyLower.includes('wagon')) return 'wagon';
  if (bodyLower.includes('convertible') || bodyLower.includes('roadster')) return 'convertible';
  if (bodyLower.includes('van')) return 'van';
  
  return '';
}

/**
 * Normalize make name for API compatibility
 */
function normalizeMake(make: string): string {
  const makeMap: Record<string, string> = {
    'CHEVROLET': 'chevrolet',
    'CHEVY': 'chevrolet',
    'MERCEDES-BENZ': 'mercedes',
    'MERCEDES': 'mercedes',
    'BMW': 'bmw',
    'VOLKSWAGEN': 'volkswagen',
    'VW': 'volkswagen',
    'LAND ROVER': 'land-rover',
    'ALFA ROMEO': 'alfa-romeo',
    'ASTON MARTIN': 'aston-martin',
    'ROLLS-ROYCE': 'rolls-royce',
  };
  
  const upperMake = make.toUpperCase();
  return makeMap[upperMake] || make.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Normalize model name for API compatibility
 */
function normalizeModel(model: string): string {
  // Remove common suffixes and clean up
  return model
    .toLowerCase()
    .replace(/\s+(crew|extended|regular)\s+cab/i, '')
    .replace(/\s+(short|long)\s+bed/i, '')
    .replace(/\s+4wd|awd|2wd|fwd|rwd/i, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Try to get image from Imagin Studio API (most accurate)
 * Free tier: Uses a demo customer key
 */
async function getImaginStudioImage(vehicleInfo: VehicleInfo): Promise<string | null> {
  try {
    const make = normalizeMake(vehicleInfo.make);
    const model = normalizeModel(vehicleInfo.model);
    
    // Imagin Studio URL - generates CGI renders of actual vehicles
    // Using the demo customer key for free tier
    const imaginUrl = `https://cdn.imagin.studio/getimage?customer=hrjavascript-mastery&make=${make}&modelFamily=${model}&modelYear=${vehicleInfo.year}&angle=front-side`;
    
    // Verify the image exists by making a HEAD request
    const response = await fetch(imaginUrl, { method: 'HEAD' });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      // Make sure it returns an actual image, not an error page
      if (contentType && contentType.startsWith('image/')) {
        return imaginUrl;
      }
    }
  } catch (error) {
    console.warn('Imagin Studio error:', error);
  }
  
  return null;
}

/**
 * Try to get image from Pexels API with improved query
 */
async function getPexelsImage(vehicleInfo: VehicleInfo, apiKey: string): Promise<string | null> {
  try {
    const bodyType = getBodyTypeKeyword(vehicleInfo.bodyClass);
    
    // Build a more specific search query
    // Include body type to help filter results
    const queries = [
      // Try specific query first
      `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} ${bodyType}`.trim(),
      // Fallback to just make/model with body type
      `${vehicleInfo.make} ${vehicleInfo.model} ${bodyType}`.trim(),
      // Last resort: just make with body type
      `${vehicleInfo.make} ${bodyType} car`.trim(),
    ];
    
    for (const query of queries) {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
        {
          headers: {
            'Authorization': apiKey,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          // Try to find a photo that looks like the right vehicle
          // Prefer photos with the make name in alt text
          const makeLower = vehicleInfo.make.toLowerCase();
          const preferredPhoto = data.photos.find((p: { alt?: string }) => 
            p.alt?.toLowerCase().includes(makeLower)
          );
          
          const photo = preferredPhoto || data.photos[0];
          return photo.src.large;
        }
      }
    }
  } catch (error) {
    console.warn('Pexels API error:', error);
  }
  
  return null;
}

/**
 * Fetch vehicle image from multiple sources (server-side only)
 * Fallback chain: Imagin Studio → Pexels → Body Type → Default
 */
export async function getVehicleImageServerSide(vehicleInfo: VehicleInfo): Promise<string> {
  // 1. Try Imagin Studio first (most accurate)
  const imaginImage = await getImaginStudioImage(vehicleInfo);
  if (imaginImage) {
    return imaginImage;
  }
  
  // 2. Try Pexels if API key is configured
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (pexelsApiKey) {
    const pexelsImage = await getPexelsImage(vehicleInfo, pexelsApiKey);
    if (pexelsImage) {
      return pexelsImage;
    }
  }
  
  // 3. Fall back to body type image
  return getFallbackImage(vehicleInfo);
}

/**
 * Client-side image fetcher
 * Calls the /api/vehicle-image endpoint which handles the multi-source lookup
 * Only use this in client components (browser context)
 */
export async function getVehicleImage(vehicleInfo: VehicleInfo): Promise<string> {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (!isBrowser) {
    // Server-side: use the multi-source lookup directly
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
  
  // Fallback if API fails
  return getFallbackImage(vehicleInfo);
}
