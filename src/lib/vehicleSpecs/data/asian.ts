// Asian Manufacturer Vehicle Specifications
// Toyota, Honda, Nissan, Hyundai, Kia, Mazda, Subaru, Mitsubishi

import { VehicleSpecsDatabase } from '../types';

export const asianSpecs: VehicleSpecsDatabase = {
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
    'corolla cross': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'rav4': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    highlander: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    '4runner': {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder', 'V6'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    tacoma: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    tundra: {
      transmissions: ['Automatic, 5-Speed'],
      engines: ['V6'],
      drivetrains: ['Rear Wheel Drive (RWD)', '4WD / 4×4'],
    },
    sequoia: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
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
    'prius prime': {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)'],
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
    'gr86': {
      transmissions: ['Automatic, 6-Speed', 'Manual'],
      engines: ['4-Cylinder'],
      drivetrains: ['Rear Wheel Drive (RWD)'],
    },
    venza: {
      transmissions: ['CVT'],
      engines: ['Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'land cruiser': {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6 Turbo', 'Hybrid'],
      drivetrains: ['4WD / 4×4'],
    },
    crown: {
      transmissions: ['CVT', 'Automatic, 8-Speed'],
      engines: ['Hybrid', 'V6 Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'grand highlander': {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    'bz4x': {
      transmissions: ['Automatic'],
      engines: ['Electric'],
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
    ridgeline: {
      transmissions: ['Automatic, 9-Speed'],
      engines: ['V6'],
      drivetrains: ['All Wheel Drive (AWD)'],
    },
    odyssey: {
      transmissions: ['Automatic, 10-Speed'],
      engines: ['V6'],
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
    prologue: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
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
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    ioniq: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['Hybrid'],
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
      transmissions: ['Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
  },

  // =========================================================================
  // KIA
  // =========================================================================
  kia: {
    forte: {
      transmissions: ['CVT', 'Automatic, 7-Speed', 'Manual'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    k5: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    optima: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    sportage: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    sorento: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['4-Cylinder Turbo', 'V6', 'Hybrid'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    telluride: {
      transmissions: ['Automatic, 8-Speed'],
      engines: ['V6'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    seltos: {
      transmissions: ['CVT', 'Automatic, 7-Speed'],
      engines: ['4-Cylinder', '4-Cylinder Turbo'],
      drivetrains: ['Front Wheel Drive (FWD)', 'All Wheel Drive (AWD)'],
    },
    soul: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder'],
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
    niro: {
      transmissions: ['Automatic, 6-Speed'],
      engines: ['Hybrid', 'Electric'],
      drivetrains: ['Front Wheel Drive (FWD)'],
    },
    ev6: {
      transmissions: ['Automatic'],
      engines: ['Electric'],
      drivetrains: ['Rear Wheel Drive (RWD)', 'All Wheel Drive (AWD)'],
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
    ascent: {
      transmissions: ['CVT'],
      engines: ['4-Cylinder Turbo'],
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
};
