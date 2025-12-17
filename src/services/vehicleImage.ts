// Vehicle Image Service

import { VehicleInfo } from '@/types/vehicle';

// Stock images mapped by make for reliable fallbacks
const STOCK_IMAGES: Record<string, string> = {
  chevrolet: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format',
  ford: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format',
  toyota: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format',
  honda: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&auto=format',
  jeep: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
  ram: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format',
  dodge: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format',
  gmc: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  nissan: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
  hyundai: 'https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=800&auto=format',
  kia: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&auto=format',
  subaru: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
  mazda: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&auto=format',
  bmw: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
  mercedes: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
  audi: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format',
  volkswagen: 'https://images.unsplash.com/photo-1622353219448-46a009f0d44f?w=800&auto=format',
  lexus: 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&auto=format',
  acura: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format',
  infiniti: 'https://images.unsplash.com/photo-1612911912313-daa19c39a389?w=800&auto=format',
  cadillac: 'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=800&auto=format',
  buick: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800&auto=format',
  tesla: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format',
  default: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format',
};

// Body type images for more specific matching
const BODY_TYPE_IMAGES: Record<string, string> = {
  pickup: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format',
  truck: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format',
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
  sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format',
  coupe: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
  hatchback: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&auto=format',
  wagon: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
  convertible: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
  van: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  minivan: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
};

export async function getVehicleImage(vehicleInfo: VehicleInfo): Promise<string> {
  // Try to match by make first
  const makeLower = vehicleInfo.make.toLowerCase();
  
  if (STOCK_IMAGES[makeLower]) {
    return STOCK_IMAGES[makeLower];
  }
  
  // Try to match by body type
  if (vehicleInfo.bodyClass) {
    const bodyLower = vehicleInfo.bodyClass.toLowerCase();
    for (const [type, url] of Object.entries(BODY_TYPE_IMAGES)) {
      if (bodyLower.includes(type)) {
        return url;
      }
    }
  }
  
  // Return default car image
  return STOCK_IMAGES['default'];
}

// For production, you could use Pexels API
export async function searchVehicleImagePexels(
  vehicleInfo: VehicleInfo
): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    return null;
  }
  
  const query = `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`;
  
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large;
    }
    
    return null;
  } catch {
    return null;
  }
}
