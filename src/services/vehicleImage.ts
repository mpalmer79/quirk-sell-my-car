// Vehicle Image Service - MAKE + BODY TYPE VERSION
// Matches: NISSAN + Truck, TOYOTA + SUV, CHEVROLET + Sedan, etc.
// 
// HOW TO ADD VERIFIED IMAGES:
// 1. Find an Unsplash photo of the correct make + body type
// 2. Add/update the URL in MAKE_BODY_IMAGES below
// 3. The photo ID is the part after "photo-" in the URL

import { VehicleInfo } from '@/types/vehicle';

// =============================================================================
// MAKE + BODY TYPE IMAGES
// Format: 'make': { bodyType: 'unsplash-url' }
// =============================================================================

const MAKE_BODY_IMAGES: Record<string, Record<string, string>> = {
  // -------------------------------------------------------------------------
  // AMERICAN BRANDS
  // -------------------------------------------------------------------------
  'chevrolet': {
    truck: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format', // Silverado
    suv: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format', // Tahoe/Suburban style
    sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format', // Generic Chevy sedan
    default: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format',
  },
  'chevy': {
    truck: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format',
    suv: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format',
  },
  'ford': {
    truck: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&auto=format', // F-150
    suv: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format', // Explorer/Bronco style
    sedan: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format', // Fusion style
    default: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&auto=format',
  },
  'gmc': {
    truck: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format', // Sierra
    suv: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format', // Yukon style
    default: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
  },
  'ram': {
    truck: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format', // Ram 1500
    default: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
  },
  'dodge': {
    truck: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=800&auto=format',
    suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format', // Durango
    sedan: 'https://images.unsplash.com/photo-1594950195943-622b53f0f429?w=800&auto=format', // Charger
    default: 'https://images.unsplash.com/photo-1594950195943-622b53f0f429?w=800&auto=format',
  },
  'jeep': {
    suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format', // Wrangler/Cherokee
    truck: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format', // Gladiator
    default: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
  },
  'cadillac': {
    suv: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&auto=format', // Escalade
    sedan: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&auto=format', // CT5
    default: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&auto=format',
  },
  'buick': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Enclave
    sedan: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'lincoln': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Navigator
    sedan: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'tesla': {
    suv: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format', // Model X
    sedan: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format', // Model S/3
    hatchback: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format', // Model 3
    default: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format',
  },

  // -------------------------------------------------------------------------
  // JAPANESE BRANDS
  // -------------------------------------------------------------------------
  'toyota': {
    truck: 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&auto=format', // Tacoma/Tundra
    suv: 'https://images.unsplash.com/photo-1625231334168-21f0f5372c40?w=800&auto=format', // RAV4/4Runner
    sedan: 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&auto=format', // Camry
    hatchback: 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&auto=format', // Corolla HB
    default: 'https://images.unsplash.com/photo-1625231334168-21f0f5372c40?w=800&auto=format',
  },
  'honda': {
    truck: 'https://images.unsplash.com/photo-1568844293986-8c3a2c5f3e47?w=800&auto=format', // Ridgeline
    suv: 'https://images.unsplash.com/photo-1568844293986-8c3a2c5f3e47?w=800&auto=format', // CR-V/Pilot
    sedan: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format', // Accord/Civic
    hatchback: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format', // Civic HB
    van: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format', // Odyssey
    default: 'https://images.unsplash.com/photo-1568844293986-8c3a2c5f3e47?w=800&auto=format',
  },
  'nissan': {
    // UPDATED: Using actual Nissan sedan images
    truck: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format', // Frontier/Titan
    suv: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format', // Rogue/Pathfinder
    sedan: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format', // Nissan sedan - silver/gray
    hatchback: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format', // Versa HB
    default: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format',
  },
  'mazda': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // CX-5/CX-9
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Mazda3/6
    hatchback: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Mazda3 HB
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'subaru': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Outback/Forester
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Legacy/Impreza
    wagon: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Outback
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'lexus': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // RX/NX
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // ES/IS
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'acura': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // MDX/RDX
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // TLX/ILX
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'infiniti': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // QX60/QX80
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Q50/Q70
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'mitsubishi': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Outlander
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Mirage
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },

  // -------------------------------------------------------------------------
  // KOREAN BRANDS
  // -------------------------------------------------------------------------
  'hyundai': {
    truck: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format', // Santa Cruz
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Tucson/Palisade
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Sonata/Elantra
    hatchback: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Veloster
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'kia': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Telluride/Sportage
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // K5/Forte
    van: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format', // Carnival
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'genesis': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // GV80
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // G80/G90
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },

  // -------------------------------------------------------------------------
  // GERMAN BRANDS
  // -------------------------------------------------------------------------
  'bmw': {
    suv: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format', // X3/X5
    sedan: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format', // 3/5 Series
    coupe: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format', // 4 Series
    default: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
  },
  'mercedes-benz': {
    suv: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format', // GLE/GLC
    sedan: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format', // C/E/S Class
    coupe: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
  },
  'mercedes': {
    suv: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
    coupe: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
  },
  'audi': {
    suv: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format', // Q5/Q7
    sedan: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format', // A4/A6
    hatchback: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format', // A3
    default: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format',
  },
  'volkswagen': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Tiguan/Atlas
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Jetta/Passat
    hatchback: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Golf
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'vw': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    hatchback: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'porsche': {
    suv: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format', // Cayenne/Macan
    sedan: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format', // Panamera
    coupe: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format', // 911
    default: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
  },

  // -------------------------------------------------------------------------
  // BRITISH/EUROPEAN BRANDS
  // -------------------------------------------------------------------------
  'land rover': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'jaguar': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'volvo': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // XC60/XC90
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // S60/S90
    wagon: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // V60/V90
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'mini': {
    hatchback: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Countryman
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },

  // -------------------------------------------------------------------------
  // OTHER BRANDS
  // -------------------------------------------------------------------------
  'alfa romeo': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Stelvio
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Giulia
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'fiat': {
    hatchback: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // 500
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'maserati': {
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Levante
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Ghibli/Quattroporte
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'rivian': {
    truck: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format', // R1T
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // R1S
    default: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
  },
  'lucid': {
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Air
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
  'polestar': {
    sedan: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format', // Polestar 2
    suv: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', // Polestar 3
    default: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
  },
};

// =============================================================================
// GENERIC BODY TYPE FALLBACKS
// Used when make is not found in MAKE_BODY_IMAGES
// =============================================================================

const BODY_TYPE_FALLBACKS: Record<string, string> = {
  // Trucks
  truck: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format',
  pickup: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format',
  
  // SUVs
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
  crossover: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
  utility: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format',
  
  // Sedans - using a neutral silver/gray sedan image
  sedan: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format',
  saloon: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format',
  
  // Coupes
  coupe: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format',
  
  // Hatchbacks
  hatchback: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
  
  // Vans
  van: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  minivan: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
  
  // Wagons
  wagon: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format',
  
  // Convertibles
  convertible: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
  roadster: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format',
};

// Default image when nothing matches - generic car silhouette
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalize body class to simple type (truck, suv, sedan, etc.)
 */
function getBodyType(bodyClass: string | undefined): string {
  if (!bodyClass) return 'default';
  
  const lower = bodyClass.toLowerCase();
  
  // Check for truck first (pickup, crew cab, etc.)
  if (lower.includes('pickup') || lower.includes('truck') || lower.includes('cab')) {
    return 'truck';
  }
  
  // Check for SUV/Crossover
  if (lower.includes('suv') || lower.includes('utility') || lower.includes('crossover')) {
    return 'suv';
  }
  
  // Check for sedan
  if (lower.includes('sedan') || lower.includes('saloon')) {
    return 'sedan';
  }
  
  // Check for coupe
  if (lower.includes('coupe') || lower.includes('2-door')) {
    return 'coupe';
  }
  
  // Check for hatchback
  if (lower.includes('hatchback') || lower.includes('liftback')) {
    return 'hatchback';
  }
  
  // Check for van
  if (lower.includes('van') || lower.includes('mpv')) {
    return 'van';
  }
  
  // Check for wagon
  if (lower.includes('wagon') || lower.includes('estate')) {
    return 'wagon';
  }
  
  // Check for convertible
  if (lower.includes('convertible') || lower.includes('roadster') || lower.includes('cabriolet')) {
    return 'convertible';
  }
  
  return 'default';
}

/**
 * Get body type fallback image
 */
function getBodyTypeFallback(bodyClass: string | undefined): string {
  if (!bodyClass) return DEFAULT_IMAGE;
  
  const lower = bodyClass.toLowerCase();
  
  for (const [keyword, url] of Object.entries(BODY_TYPE_FALLBACKS)) {
    if (lower.includes(keyword)) {
      return url;
    }
  }
  
  return DEFAULT_IMAGE;
}

// =============================================================================
// MAIN EXPORTS
// =============================================================================

/**
 * Get vehicle image based on make + body type
 * Priority: 1) Make + Body Type, 2) Make Default, 3) Body Type Fallback, 4) Default
 */
export function getVehicleImageByMake(vehicleInfo: VehicleInfo): string {
  const makeLower = vehicleInfo.make.toLowerCase().trim();
  const bodyType = getBodyType(vehicleInfo.bodyClass);
  
  // 1. Try make + body type
  const makeImages = MAKE_BODY_IMAGES[makeLower];
  if (makeImages) {
    // Try specific body type for this make
    if (makeImages[bodyType]) {
      return makeImages[bodyType];
    }
    // Fall back to make's default
    if (makeImages.default) {
      return makeImages.default;
    }
  }
  
  // 2. Fall back to generic body type image
  return getBodyTypeFallback(vehicleInfo.bodyClass);
}

/**
 * Fallback image getter (for compatibility)
 */
export function getFallbackImage(vehicleInfo: VehicleInfo): string {
  return getBodyTypeFallback(vehicleInfo.bodyClass);
}

/**
 * Server-side image fetcher
 */
export async function getVehicleImageServerSide(vehicleInfo: VehicleInfo): Promise<string> {
  return getVehicleImageByMake(vehicleInfo);
}

/**
 * Client-side image fetcher (async for compatibility)
 */
export async function getVehicleImage(vehicleInfo: VehicleInfo): Promise<string> {
  return getVehicleImageByMake(vehicleInfo);
}
