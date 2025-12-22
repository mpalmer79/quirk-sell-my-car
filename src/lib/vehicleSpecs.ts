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
    },
    '2500': {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 6-Speed'],
      engines: ['V8', 'V6 Diesel'],
    },
    '3500': {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 6-Speed'],
      engines: ['V8', 'V6 Diesel'],
    },
    promaster: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
    },
    'promaster city': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder'],
    },
  },

  // =========================================================================
  // GMC
  // =========================================================================
  gmc: {
    sierra: {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8', 'V6 Diesel'],
    },
    'sierra 1500': {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8', 'V6 Diesel'],
    },
    canyon: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', '4-Cylinder Diesel'],
    },
    yukon: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
    },
    'yukon xl': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
    },
    terrain: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    acadia: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
    },
    hummer: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // JEEP
  // =========================================================================
  jeep: {
    wrangler: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6', 'V6 Diesel', 'Hybrid'],
    },
    'grand cherokee': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8', 'V6 Diesel', 'Hybrid'],
    },
    cherokee: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
    },
    compass: {
      transmissions: ['Automatic, 6-Speed', 'Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    renegade: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    gladiator: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['V6', 'V6 Diesel'],
    },
    'grand wagoneer': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V8'],
    },
    wagoneer: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V8'],
    },
  },

  // =========================================================================
  // DODGE
  // =========================================================================
  dodge: {
    charger: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8'],
    },
    challenger: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['V6', 'V8'],
    },
    durango: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8'],
    },
    hornet: {
      transmissions: ['Automatic, 6-Speed', 'Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
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
    },
    mazda6: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    'cx-30': {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    'cx-5': {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    'cx-50': {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    'cx-9': {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    'cx-90': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
    },
    'mx-5': {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder'],
    },
    'mx-5 miata': {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder'],
    },
  },

  // =========================================================================
  // BMW
  // =========================================================================
  bmw: {
    '3 series': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    '5 series': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
    },
    '7 series': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Electric'],
    },
    x1: {
      transmissions: ['Automatic, 7-Speed', 'Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    x3: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
    },
    x5: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Hybrid'],
    },
    x7: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo'],
    },
    ix: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    i4: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // MERCEDES-BENZ
  // =========================================================================
  'mercedes-benz': {
    'c-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    'e-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
    },
    's-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Hybrid'],
    },
    'gle-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Hybrid'],
    },
    'glc-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    'gls-class': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo'],
    },
    eqe: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    eqs: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // AUDI
  // =========================================================================
  audi: {
    a3: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    a4: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    a6: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    a8: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo'],
    },
    q3: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    q5: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    q7: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    q8: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo'],
    },
    'e-tron': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    'e-tron gt': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // VOLKSWAGEN
  // =========================================================================
  volkswagen: {
    jetta: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
    },
    passat: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    tiguan: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    atlas: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
    },
    'atlas cross sport': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
    },
    taos: {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    golf: {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
    },
    'golf gti': {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
    },
    'golf r': {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
    },
    id4: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    arteon: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
  },

  // =========================================================================
  // LEXUS
  // =========================================================================
  lexus: {
    es: {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder', 'V6', 'Hybrid'],
    },
    is: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
    },
    ls: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
    },
    rx: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    nx: {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    gx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo'],
    },
    lx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
    },
    ux: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', 'Hybrid', 'Electric'],
    },
    rz: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // ACURA
  // =========================================================================
  acura: {
    tlx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    integra: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder Turbo'],
    },
    mdx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6', 'Hybrid'],
    },
    rdx: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
  },

  // =========================================================================
  // INFINITI
  // =========================================================================
  infiniti: {
    q50: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V6 Turbo'],
    },
    q60: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['V6 Turbo'],
    },
    qx50: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
    },
    qx55: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
    },
    qx60: {
      transmissions: ['Automatic, 9-Speed', 'CVT'],
      engines: ['V6'],
    },
    qx80: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['V8'],
    },
  },

  // =========================================================================
  // TESLA
  // =========================================================================
  tesla: {
    'model 3': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    'model y': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    'model s': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    'model x': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    cybertruck: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // RIVIAN
  // =========================================================================
  rivian: {
    r1t: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    r1s: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // LUCID
  // =========================================================================
  lucid: {
    air: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // POLESTAR
  // =========================================================================
  polestar: {
    '2': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // GENESIS
  // =========================================================================
  genesis: {
    g70: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    g80: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Electric'],
    },
    g90: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo'],
    },
    gv70: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo', 'Electric'],
    },
    gv80: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    gv60: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // CADILLAC
  // =========================================================================
  cadillac: {
    ct4: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    ct5: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
    },
    escalade: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
    },
    xt4: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    xt5: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    xt6: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
    },
    lyriq: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // LINCOLN
  // =========================================================================
  lincoln: {
    navigator: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo'],
    },
    aviator: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
    },
    corsair: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    nautilus: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
  },

  // =========================================================================
  // BUICK
  // =========================================================================
  buick: {
    enclave: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
    },
    envision: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    encore: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    'encore gx': {
      transmissions: ['CVT', 'Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
  },

  // =========================================================================
  // CHRYSLER
  // =========================================================================
  chrysler: {
    pacifica: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6', 'Hybrid'],
    },
    '300': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8'],
    },
  },

  // =========================================================================
  // MITSUBISHI
  // =========================================================================
  mitsubishi: {
    outlander: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', 'Hybrid'],
    },
    'outlander sport': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
    },
    eclipse: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
    },
    'eclipse cross': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
    },
    mirage: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
    },
  },

  // =========================================================================
  // VOLVO
  // =========================================================================
  volvo: {
    s60: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    s90: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    xc40: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Electric'],
    },
    xc60: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    xc90: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    c40: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // JAGUAR
  // =========================================================================
  jaguar: {
    'f-pace': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8'],
    },
    'e-pace': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    'i-pace': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    'f-type': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8'],
    },
  },

  // =========================================================================
  // LAND ROVER
  // =========================================================================
  'land rover': {
    defender: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V8'],
    },
    discovery: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
    },
    'range rover': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8', 'Hybrid'],
    },
    'range rover sport': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'V8', 'Hybrid'],
    },
    'range rover velar': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
    },
    'range rover evoque': {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
  },

  // =========================================================================
  // PORSCHE
  // =========================================================================
  porsche: {
    '911': {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['V6 Turbo'],
    },
    cayenne: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Hybrid'],
    },
    macan: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    panamera: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6 Turbo', 'V8 Turbo', 'Hybrid'],
    },
    taycan: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    '718': {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6'],
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
