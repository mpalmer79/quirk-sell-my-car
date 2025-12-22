// US Domestic Manufacturer Vehicle Specifications
// Ford, Chevrolet, GMC, RAM, Dodge, Jeep, Chrysler, Buick, Cadillac, Lincoln

import { VehicleSpecsDatabase } from '../types';

export const domesticSpecs: VehicleSpecsDatabase = {
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
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    maverick: {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    explorer: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    expedition: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    escape: {
      transmissions: ['Automatic, 8-Speed', 'CVT'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    edge: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6 Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
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
    transit: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6', 'V6 Turbo'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
    },
    'transit connect': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    ecosport: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    fusion: {
      transmissions: ['Automatic, 6-Speed', 'CVT'],
      engines: ['4-Cylinder', '4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'f-150 lightning': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
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
    'silverado 2500hd': {
      transmissions: ['Automatic, 6-Speed', 'Automatic, 10-Speed'],
      engines: ['V8', 'V8 Diesel'],
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
      transmissions: ['Automatic, 6-Speed', 'Automatic, 9-Speed'],
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
    trax: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    malibu: {
      transmissions: ['CVT', 'Automatic, 9-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    camaro: {
      transmissions: ['Automatic, 10-Speed', 'Manual'],
      engines: ['4-Cylinder Turbo', 'V6', 'V8'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    corvette: {
      transmissions: ['Automatic, 8-Speed'],
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
    'silverado ev': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['All Wheel Drive (AWD)'],
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
};
