// Vehicle Specifications Types and Constants

export interface VehicleSpecOptions {
  transmissions: string[];
  engines: string[];
  drivetrains: string[];
}

export type VehicleSpecsDatabase = Record<string, Record<string, VehicleSpecOptions>>;

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
