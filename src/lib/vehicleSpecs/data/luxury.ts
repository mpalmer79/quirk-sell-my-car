// Luxury Asian Manufacturer Vehicle Specifications
// Lexus, Acura, Infiniti, Genesis

import { VehicleSpecsDatabase } from '../types';

export const luxurySpecs: VehicleSpecsDatabase = {
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
};
