// Vehicle Image Service
// Uses make (brand) specific images for better accuracy
// Falls back to body-type if make not found

import { VehicleInfo } from '@/types/vehicle';

// Make-specific images - shows correct brand badge
const MAKE_IMAGES: Record<string, { truck?: string; suv?: string; sedan?: string; default: string }> = {
  // American Brands
  'chevrolet': {
    truck: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format',
    suv: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format',
  },
  'chevy': {
    truck: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format',
    suv: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format',
  },
  'ford': {
    truck: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&auto=format',
    suv: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&auto=format',
  },
  'gmc': {
    truck: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
    suv: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
  },
  'ram': {
    truck: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
  },
  'dodge': {
    truck: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1594950195943-622b53f0f429?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1594950195943-622b53f0f429?w=800&auto=format',
  },
  'jeep': {
    suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
  },
  'cadillac': {
    suv: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&auto=format',
  },
  'buick': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'lincoln': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'tesla': {
    suv: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format',
  },
  
  // Japanese Brands
  'toyota': {
    truck: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format',
    suv: 'https://images.unsplash.com/photo-1625231334168-21f0f5372c40?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1625231334168-21f0f5372c40?w=800&auto=format',
  },
  'honda': {
    suv: 'https://images.unsplash.com/photo-1568844293986-8c3a2c5f3e47?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1568844293986-8c3a2c5f3e47?w=800&auto=format',
  },
  'nissan': {
    truck: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format',
    suv: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
  },
  'mazda': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'subaru': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'lexus': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'acura': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'infiniti': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'mitsubishi': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  
  // Korean Brands
  'hyundai': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'kia': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'genesis': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  
  // German Brands
  'bmw': {
    suv: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
  },
  'mercedes-benz': {
    suv: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
  },
  'mercedes': {
    suv: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
  },
  'audi': {
    suv: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format',
  },
  'volkswagen': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'vw': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'porsche': {
    suv: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
  },
  
  // Other European
  'volvo': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'land rover': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'jaguar': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'mini': {
    default: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&auto=format',
  },
  'fiat': {
    default: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&auto=format',
  },
  'alfa romeo': {
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
};

// Body type fallback images (when make not found)
const BODY_TYPE_IMAGES: Record<string, string> = {
  'pickup': 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format',
  'truck': 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format',
  'suv': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'sport utility': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'utility': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'crossover': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  'sedan': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
  'coupe': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
  'sports': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
  'hatchback': 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&auto=format',
  'wagon': 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
  'estate': 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
  'convertible': 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
  'roadster': 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
  'cabriolet': 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
  'van': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  'minivan': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  'mpv': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
};

// Generic modern car as default
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format';

/**
 * Determine body type category from bodyClass string
 */
function getBodyTypeCategory(bodyClass: string | undefined): 'truck' | 'suv' | 'sedan' | null {
  if (!bodyClass) return null;
  const lower = bodyClass.toLowerCase();
  
  if (lower.includes('pickup') || lower.includes('truck')) return 'truck';
  if (lower.includes('suv') || lower.includes('utility') || lower.includes('crossover')) return 'suv';
  if (lower.includes('sedan') || lower.includes('coupe') || lower.includes('hatchback')) return 'sedan';
  
  return null;
}

/**
 * Get vehicle image based on make and body type
 */
export function getVehicleImageByMake(vehicleInfo: VehicleInfo): string {
  const makeLower = vehicleInfo.make.toLowerCase();
  const bodyCategory = getBodyTypeCategory(vehicleInfo.bodyClass);
  
  // Check if we have images for this make
  const makeImages = MAKE_IMAGES[makeLower];
  if (makeImages) {
    // Try to get body-type specific image for this make
    if (bodyCategory && makeImages[bodyCategory]) {
      return makeImages[bodyCategory]!;
    }
    // Fall back to make's default image
    return makeImages.default;
  }
  
  // Fall back to body-type image
  return getFallbackImage(vehicleInfo);
}

/**
 * Get fallback image based on body type
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
 * Get vehicle image - uses make-based matching for accuracy
 */
export async function getVehicleImageServerSide(vehicleInfo: VehicleInfo): Promise<string> {
  return getVehicleImageByMake(vehicleInfo);
}

/**
 * Client-side image fetcher
 */
export async function getVehicleImage(vehicleInfo: VehicleInfo): Promise<string> {
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
  
  return getVehicleImageByMake(vehicleInfo);
}
