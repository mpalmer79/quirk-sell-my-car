// Vehicle Image Service

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

export async function getVehicleImage(vehicleInfo: VehicleInfo): Promise<string> {
  // Call our API route which handles Pexels server-side
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
  
  // Client-side fallback if API fails
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
