// European Manufacturer Vehicle Specifications
// BMW, Mercedes-Benz, Audi, Volkswagen, Volvo, Jaguar, Land Rover, Porsche

import { VehicleSpecsDatabase } from '../types';

export const europeanSpecs: VehicleSpecsDatabase = {
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
