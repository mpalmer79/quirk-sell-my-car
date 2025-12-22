// Vehicle Specifications Library
// Contains make/model specific transmission and engine options
// Used as fallback when VIN decoder doesn't provide specific info

export interface VehicleSpecOptions {
  transmissions: string[];
  engines: string[];
}

// Default options when no make/model match is found
export const DEFAULT_SPEC_OPTIONS: VehicleSpecOptions = {
  transmissions: ['Automatic', 'Manual'],
  engines: ['4-Cylinder', 'V6'],
};

// Make/Model specifications database
// Format: { make: { model: { transmissions: [...], engines: [...] } } }
const VEHICLE_SPECS: Record<string, Record<string, VehicleSpecOptions>> = {
  // =========================================================================
  // NISSAN
  // =========================================================================
  nissan: {
    sentra: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
    },
    altima: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    maxima: {
      transmissions: ['CVT'],
      engines: ['V6'],
    },
    versa: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
    },
    rogue: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    'rogue sport': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
    },
    murano: {
      transmissions: ['CVT'],
      engines: ['V6'],
    },
    pathfinder: {
      transmissions: ['Automatic, 9-Speed', 'CVT'],
      engines: ['V6'],
    },
    armada: {
      transmissions: ['Automatic, 7-Speed'],
      engines: ['V8'],
    },
    frontier: {
      transmissions: ['Automatic, 9-Speed', 'Manual'],
      engines: ['V6'],
    },
    titan: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V8'],
    },
    kicks: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
    },
    leaf: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    '370z': {
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['V6'],
    },
    z: {
      transmissions: ['Automatic, 9-Speed', 'Manual'],
      engines: ['V6 Turbo'],
    },
    gt_r: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['V6 Turbo'],
    },
  },

  // =========================================================================
  // TOYOTA
  // =========================================================================
  toyota: {
    camry: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', 'V6', 'Hybrid'],
    },
    corolla: {
      transmissions: ['CVT', 'Manual', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder', 'Hybrid'],
    },
    rav4: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', 'Hybrid'],
    },
    highlander: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'Hybrid'],
    },
    tacoma: {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder', 'V6'],
    },
    tundra: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
    },
    '4runner': {
      transmissions: ['Automatic, 5-Speed'],
      engines: ['V6'],
    },
    sienna: {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
    },
    prius: {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
    },
    avalon: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6', 'Hybrid'],
    },
    supra: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    sequoia: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
    },
    'land cruiser': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
    },
    venza: {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
    },
    'gr86': {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder'],
    },
    'crown': {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
  },

  // =========================================================================
  // HONDA
  // =========================================================================
  honda: {
    civic: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    accord: {
      transmissions: ['CVT', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    'cr-v': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    'hr-v': {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
    },
    pilot: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6'],
    },
    passport: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6'],
    },
    odyssey: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6'],
    },
    ridgeline: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
    },
    fit: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
    },
    insight: {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
    },
    'civic type r': {
      transmissions: ['Manual'],
      engines: ['4-Cylinder Turbo'],
    },
  },

  // =========================================================================
  // CHEVROLET
  // =========================================================================
  chevrolet: {
    silverado: {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8', 'V6 Diesel'],
    },
    'silverado 1500': {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8', 'V6 Diesel'],
    },
    colorado: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', '4-Cylinder Diesel'],
    },
    tahoe: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
    },
    suburban: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V6 Diesel'],
    },
    equinox: {
      transmissions: ['Automatic, 6-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo'],
    },
    traverse: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
    },
    blazer: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo', 'V6'],
    },
    trailblazer: {
      transmissions: ['CVT', 'Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    malibu: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
    },
    camaro: {
      transmissions: ['Automatic, 8-Speed', 'Automatic, 10-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8'],
    },
    corvette: {
      transmissions: ['Automatic, 8-Speed', 'Manual'],
      engines: ['V8'],
    },
    spark: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
    },
    bolt: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    'bolt euv': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
  },

  // =========================================================================
  // FORD
  // =========================================================================
  ford: {
    'f-150': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6', 'V6 Turbo', 'V8', 'Hybrid', 'Electric'],
    },
    'f-250': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V8 Diesel'],
    },
    'f-350': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V8', 'V8 Diesel'],
    },
    ranger: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    maverick: {
      transmissions: ['CVT', 'Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    explorer: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'Hybrid'],
    },
    escape: {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    edge: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    expedition: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo'],
    },
    bronco: {
      transmissions: ['Automatic, 10-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    'bronco sport': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    mustang: {
      transmissions: ['Automatic, 10-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V8'],
    },
    'mustang mach-e': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    fusion: {
      transmissions: ['Automatic, 6-Speed', 'CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo', 'Hybrid'],
    },
    ecosport: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    transit: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6', 'V6 Turbo'],
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
    },
    sonata: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    tucson: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo', 'Hybrid'],
    },
    'santa fe': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    palisade: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6'],
    },
    kona: {
      transmissions: ['CVT', 'Automatic, 8-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo', 'Electric'],
    },
    venue: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
    },
    'santa cruz': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    ioniq: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    'ioniq 5': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    'ioniq 6': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    veloster: {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo'],
    },
  },

  // =========================================================================
  // KIA
  // =========================================================================
  kia: {
    forte: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    k5: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
    },
    optima: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    sportage: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    sorento: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
    },
    telluride: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6'],
    },
    seltos: {
      transmissions: ['CVT', 'Automatic, 8-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    soul: {
      transmissions: ['CVT', 'Automatic'],
      engines: ['4-Cylinder', 'Electric'],
    },
    carnival: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6'],
    },
    stinger: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
    },
    ev6: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
    },
    niro: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['Hybrid', 'Electric'],
    },
  },

  // =========================================================================
  // SUBARU
  // =========================================================================
  subaru: {
    outback: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    forester: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
    },
    crosstrek: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder', 'Hybrid'],
    },
    ascent: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
    },
    impreza: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder'],
    },
    legacy: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
    },
    wrx: {
      transmissions: ['CVT', 'Manual'],
      engines: ['4-Cylinder Turbo'],
    },
    brz: {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder'],
    },
    solterra: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
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
 * Handles variations like "F-150" vs "f150", "CR-V" vs "crv", etc.
 */
function normalizeModelName(model: string): string {
  return model
    .toLowerCase()
    .trim()
    .replace(/[-\s]+/g, ' ') // Replace hyphens and multiple spaces with single space
    .replace(/\s+/g, ' '); // Collapse multiple spaces
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
 * Check if a make/model combination exists in the specs database
 * @param make - Vehicle make
 * @param model - Vehicle model
 * @returns true if specs exist for this make/model
 */
export function hasVehicleSpecs(make: string, model: string): boolean {
  const specs = getVehicleSpecs(make, model);
  return specs !== DEFAULT_SPEC_OPTIONS;
}
