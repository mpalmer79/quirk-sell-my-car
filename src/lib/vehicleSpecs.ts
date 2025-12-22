// Vehicle Specifications Library
// Contains make/model specific transmission, engine, and drivetrain options
// Used as fallback when VIN decoder doesn't provide specific info

export interface VehicleSpecOptions {
  transmissions: string[];
  engines: string[];
  drivetrains: string[];
}

// All possible drivetrain options
export const ALL_DRIVETRAINS = [
  'Front Wheel Drive (FWD)',
  'Rear Wheel Drive (RWD)',
  '4WD / 4×4',
  'All Wheel Drive (AWD)',
];

// Default options when no make/model match is found
export const DEFAULT_SPEC_OPTIONS: VehicleSpecOptions = {
  transmissions: ['Automatic', 'Manual'],
  engines: ['4-Cylinder', 'V6'],
  drivetrains: ALL_DRIVETRAINS,
};

// Make/Model specifications database
// Format: { make: { model: { transmissions: [...], engines: [...], drivetrains: [...] } } }
const VEHICLE_SPECS: Record<string, Record<string, VehicleSpecOptions>> = {
  // =========================================================================
  // NISSAN
  // =========================================================================
  nissan: {
    sentra: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    altima: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    maxima: {
      transmissions: ['CVT'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    versa: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    rogue: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'rogue sport': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    murano: {
      transmissions: ['CVT'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    pathfinder: {
      transmissions: ['Automatic, 9-Speed', 'CVT'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    armada: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['V8'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    frontier: {
      transmissions: ['Automatic, 9-Speed', 'Manual'],
      engines: ['V6'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    titan: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V8'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    kicks: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    leaf: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    '370z': {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['V6'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    z: {
      transmissions: ['Automatic, 9-Speed', 'Manual'],
      engines: ['V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    'gt-r': {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['V6 Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // TOYOTA
  // =========================================================================
  toyota: {
    camry: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', 'V6', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    corolla: {
      transmissions: ['CVT', 'Manual', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    rav4: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    highlander: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    tacoma: {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder', 'V6'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    tundra: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    '4runner': {
      transmissions: ['Automatic, 5-Speed'],
      engines: ['V6'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    sienna: {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    prius: {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    avalon: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    supra: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    sequoia: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    'land cruiser': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
      drivetrains: ['4WD / 4×4'],
    },
    venza: {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    gr86: {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    crown: {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // HONDA
  // =========================================================================
  honda: {
    civic: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    accord: {
      transmissions: ['CVT', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    'cr-v': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'hr-v': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    pilot: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    passport: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    odyssey: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    ridgeline: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    fit: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    insight: {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    'civic type r': {
      transmissions: ['Manual'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
  },

  // =========================================================================
  // CHEVROLET
  // =========================================================================
  chevrolet: {
    silverado: {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    'silverado 1500': {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    colorado: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', '4-Cylinder Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    tahoe: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    suburban: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    equinox: {
      transmissions: ['Automatic, 6-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    traverse: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    blazer: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    trailblazer: {
      transmissions: ['CVT', 'Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    malibu: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    camaro: {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    corvette: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['V8'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    spark: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    bolt: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    'bolt euv': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
  },

  // =========================================================================
  // FORD
  // =========================================================================
  ford: {
    'f-150': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6', 'V6 Turbo', 'V8', 'Hybrid', 'Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    'f-250': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V8 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    'f-350': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V8 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    ranger: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    maverick: {
      transmissions: ['CVT', 'Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    explorer: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    escape: {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    edge: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    expedition: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    bronco: {
      transmissions: ['Automatic, 10-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['4WD / 4×4'],
    },
    'bronco sport': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    mustang: {
      transmissions: ['Automatic, 10-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V8'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    'mustang mach-e': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    fusion: {
      transmissions: ['Automatic, 6-Speed', 'CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    ecosport: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    transit: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6', 'V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // RAM
  // =========================================================================
  ram: {
    '1500': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8', 'V6 Diesel', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    '2500': {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 6-Speed'],
      engines: ['V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    '3500': {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 6-Speed'],
      engines: ['V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    promaster: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    'promaster city': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
  },

  // =========================================================================
  // GMC
  // =========================================================================
  gmc: {
    sierra: {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    'sierra 1500': {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    canyon: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', '4-Cylinder Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    yukon: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    'yukon xl': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    terrain: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    acadia: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    hummer: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // JEEP
  // =========================================================================
  jeep: {
    wrangler: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6', 'V6 Diesel', 'Hybrid'],
      drivetrains: ['4WD / 4×4'],
    },
    'grand cherokee': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8', 'V6 Diesel', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    cherokee: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['Front Wheel Drive (FWD)', '4WD / 4×4'],
    },
    compass: {
      transmissions: ['Automatic, 6-Speed', 'Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', '4WD / 4×4'],
    },
    renegade: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', '4WD / 4×4'],
    },
    gladiator: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['V6', 'V6 Diesel'],
      drivetrains: ['4WD / 4×4'],
    },
    'grand wagoneer': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V8'],
      drivetrains: ['4WD / 4×4'],
    },
    wagoneer: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V8'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
  },

  // =========================================================================
  // DODGE
  // =========================================================================
  dodge: {
    charger: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    challenger: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['V6', 'V8'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    durango: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    hornet: {
      transmissions: ['Automatic, 6-Speed', 'Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // HYUNDAI
  // =========================================================================
  hyundai: {
    elantra: {
      transmissions: ['CVT', 'Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder', '4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    sonata: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    tucson: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'santa fe': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    palisade: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    kona: {
      transmissions: ['CVT', 'Automatic, 8-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo', 'Electric'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    venue: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    'santa cruz': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    ioniq: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    'ioniq 5': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    'ioniq 6': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    veloster: {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
  },

  // =========================================================================
  // KIA
  // =========================================================================
  kia: {
    forte: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    k5: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    optima: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    sportage: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    sorento: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    telluride: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    seltos: {
      transmissions: ['CVT', 'Automatic, 8-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    soul: {
      transmissions: ['CVT', 'Automatic'],
      engines: ['4-Cylinder', 'Electric'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    carnival: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    stinger: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    ev6: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    niro: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['Hybrid', 'Electric'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
  },

  // =========================================================================
  // SUBARU
  // =========================================================================
  subaru: {
    outback: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    forester: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    crosstrek: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder', 'Hybrid'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    ascent: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    impreza: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    legacy: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    wrx: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    brz: {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    solterra: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // MAZDA
  // =========================================================================
  mazda: {
    mazda3: {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    mazda6: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    'cx-30': {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'cx-5': {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'cx-50': {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'cx-9': {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'cx-90': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    'mx-5': {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    'mx-5 miata': {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
  },

  // =========================================================================
  // BMW
  // =========================================================================
  bmw: {
    '3 series': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    '5 series': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    '7 series': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    x1: {
      transmissions: ['Automatic, 7-Speed', 'Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    x3: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    x5: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Hybrid'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    x7: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    ix: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    i4: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // MERCEDES-BENZ
  // =========================================================================
  'mercedes-benz': {
    'c-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    'e-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    's-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    'gle-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    'glc-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    'gls-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    eqe: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    eqs: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // AUDI
  // =========================================================================
  audi: {
    a3: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    a4: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    a6: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    a8: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    q3: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    q5: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    q7: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    q8: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    'e-tron': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    'e-tron gt': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // VOLKSWAGEN
  // =========================================================================
  volkswagen: {
    jetta: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    passat: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    tiguan: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    atlas: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'atlas cross sport': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    taos: {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    golf: {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    'golf gti': {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    'golf r': {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    id4: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    arteon: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // LEXUS
  // =========================================================================
  lexus: {
    es: {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder', 'V6', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    is: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    ls: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    rx: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    nx: {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    gx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo'],
      drivetrains: ['4WD / 4×4'],
    },
    lx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
      drivetrains: ['4WD / 4×4'],
    },
    ux: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', 'Hybrid', 'Electric'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    rz: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // ACURA
  // =========================================================================
  acura: {
    tlx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    integra: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    mdx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    rdx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // INFINITI
  // =========================================================================
  infiniti: {
    q50: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    q60: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    qx50: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    qx55: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    qx60: {
      transmissions: ['Automatic, 9-Speed', 'CVT'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    qx80: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['V8'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
  },

  // =========================================================================
  // TESLA
  // =========================================================================
  tesla: {
    'model 3': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    'model y': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    'model s': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    'model x': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    cybertruck: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // RIVIAN
  // =========================================================================
  rivian: {
    r1t: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    r1s: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // LUCID
  // =========================================================================
  lucid: {
    air: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // POLESTAR
  // =========================================================================
  polestar: {
    '2': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // GENESIS
  // =========================================================================
  genesis: {
    g70: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    g80: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    g90: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    gv70: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    gv80: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    gv60: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // CADILLAC
  // =========================================================================
  cadillac: {
    ct4: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    ct5: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    escalade: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    xt4: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    xt5: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    xt6: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    lyriq: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // LINCOLN
  // =========================================================================
  lincoln: {
    navigator: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    aviator: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    corsair: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    nautilus: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // BUICK
  // =========================================================================
  buick: {
    enclave: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    envision: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    encore: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'encore gx': {
      transmissions: ['CVT', 'Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // CHRYSLER
  // =========================================================================
  chrysler: {
    pacifica: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    '300': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // MITSUBISHI
  // =========================================================================
  mitsubishi: {
    outlander: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'outlander sport': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    eclipse: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'eclipse cross': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    mirage: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
  },

  // =========================================================================
  // VOLVO
  // =========================================================================
  volvo: {
    s60: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    s90: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    xc40: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Electric'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    xc60: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    xc90: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    c40: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // JAGUAR
  // =========================================================================
  jaguar: {
    'f-pace': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    'e-pace': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    'i-pace': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    'f-type': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // LAND ROVER
  // =========================================================================
  'land rover': {
    defender: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V8'],
      drivetrains: ['4WD / 4×4'],
    },
    discovery: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['4WD / 4×4'],
    },
    'range rover': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8', 'Hybrid'],
      drivetrains: ['4WD / 4×4'],
    },
    'range rover sport': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8', 'Hybrid'],
      drivetrains: ['4WD / 4×4'],
    },
    'range rover velar': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    'range rover evoque': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
  },

  // =========================================================================
  // PORSCHE
  // =========================================================================
  porsche: {
    '911': {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    cayenne: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Hybrid'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    macan: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    panamera: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    taycan: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    '718': {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
  },
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
 * Get vehicle specs (transmissions and engines) for a specific make/model
 * @param make - Vehicle make (e.g., "Nissan", "TOYOTA")
 * @param model - Vehicle model (e.g., "Sentra", "CAMRY")
 * @returns VehicleSpecOptions with available transmissions and engines
 */
export function getVehicleSpecs(make: string, model: string): VehicleSpecOptions {
  const makeLower = make.toLowerCase().trim();
  const modelNormalized = normalizeModelName(model);

  // Look up make
  const makeSpecs = VEHICLE_SPECS[makeLower];
  if (!makeSpecs) {
    return DEFAULT_SPEC_OPTIONS;
  }

  // Look up model - try exact match first
  if (makeSpecs[modelNormalized]) {
    return makeSpecs[modelNormalized];
  }

  // Try partial match (for variations like "1500" matching "silverado 1500")
  for (const [specModel, specs] of Object.entries(makeSpecs)) {
    if (specModel.includes(modelNormalized) || modelNormalized.includes(specModel)) {
      return specs;
    }
  }

  // No match found, return defaults
  return DEFAULT_SPEC_OPTIONS;
}

/**
 * Get available transmissions for a vehicle
 * @param make - Vehicle make
 * @param model - Vehicle model
 * @returns Array of available transmission options
 */
export function getAvailableTransmissions(make: string, model: string): string[] {
  const specs = getVehicleSpecs(make, model);
  return specs.transmissions;
}

/**
 * Get available engines for a vehicle
 * @param make - Vehicle make
 * @param model - Vehicle model
 * @returns Array of available engine options
 */
export function getAvailableEngines(make: string, model: string): string[] {
  const specs = getVehicleSpecs(make, model);
  return specs.engines;
}

/**
 * Get available drivetrains for a vehicle
 * @param make - Vehicle make
 * @param model - Vehicle model
 * @returns Array of available drivetrain options
 */
export function getAvailableDrivetrains(make: string, model: string): string[] {
  const specs = getVehicleSpecs(make, model);
  return specs.drivetrains;
}

/**
 * Check if a make/model combination exists in the specs database
 * @param make - Vehicle make
 * @param model - Vehicle model
 * @returns true if specs exist for this make/model
 */
export function hasVehicleSpecs(make: string, model: string): boolean {
  const specs = getVehicleSpecs(make, model);
  return specs !== DEFAULT_SPEC_OPTIONS;
}
