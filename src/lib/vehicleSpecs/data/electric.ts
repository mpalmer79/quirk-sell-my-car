// Electric Vehicle Manufacturer Specifications
// Tesla, Rivian, Lucid, Polestar

import { VehicleSpecsDatabase } from '../types';

export const electricSpecs: VehicleSpecsDatabase = {
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
};
