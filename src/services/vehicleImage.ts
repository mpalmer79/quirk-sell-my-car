// Vehicle Image Service
// Supports both client-side (browser) and server-side (API routes) usage

import { VehicleInfo } from '@/types/vehicle';

// Body type images - fallback if API fails
const BODY_TYPE_IMAGES: Record<string, string> = {
  'suv': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'sport utility': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'utility': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'crossover': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'pickup': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format',
  'truck': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format',
  'sedan': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
  'coupe': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
  'hatchback': 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&auto=format',
  'wagon': 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
  'convertible': 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
  'van': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  'minivan': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
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
 * Fetch vehicle image from Pexels API directly (server-side only)
 * Use this in API routes instead of calling another API route
 */
export async function getVehicleImageServerSide(vehicleInfo: VehicleInfo): Promise<string> {
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  
  if (!pexelsApiKey) {
    console.warn('PEXELS_API_KEY not configured, using fallback image');
    return getFallbackImage(vehicleInfo);
  }

  try {
    const searchQuery = `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`.trim();
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': pexelsApiKey,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.large;
      }
    }
  } catch (error) {
    console.error('Pexels API error:', error);
  }

  return getFallbackImage(vehicleInfo);
}

/**
 * Client-side image fetcher
 * Calls the /api/vehicle-image endpoint which handles Pexels server-side
 * Only use this in client components (browser context)
 */
export async function getVehicleImage(vehicleInfo: VehicleInfo): Promise<string> {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (!isBrowser) {
    // Server-side: call Pexels directly
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
