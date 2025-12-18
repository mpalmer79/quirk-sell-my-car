// Vehicle Types

export interface VehicleInfo {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyClass?: string;
  driveType?: string;
  engineCylinders?: string;
  displacement?: string;
  fuelType?: string;
  transmissionStyle?: string;
  transmissionSpeeds?: string;
  electrificationLevel?: string;
  doors?: number;
}

export interface VehicleBasics {
  mileage?: number;
  zipCode?: string;
  color?: string;
  transmission?: string;
  drivetrain?: string;
  engine?: string;
  sellOrTrade?: 'sell' | 'trade' | 'not-sure';
  loanOrLease?: 'loan' | 'lease' | 'neither';
}

export interface VehicleFeatures {
  selectedFeatures: string[];
  additionalInfo?: string;
}

export interface VehicleCondition {
  exterior: number;
  interior: number;
  mechanical: number;
  tires: number;
  hasAccidentHistory: boolean;
  accidentDetails?: string;
  hasMajorRepairs: boolean;
  repairDetails?: string;
  titleStatus: 'clean' | 'rebuilt' | 'salvage' | 'lemon' | 'other';
  keys: number;
}

export interface OfferData {
  estimatedValue: number;
  lowValue: number;
  highValue: number;
  confidenceScore: number;
  validUntil: string;
  confirmationNumber: string;
}

export const VEHICLE_COLORS = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Navy',
  'Green',
  'Brown',
  'Tan',
  'Gold',
  'Orange',
  'Purple',
  'Yellow',
  'Other',
] as const;

export const CONDITION_OPTIONS = [
  { value: 1, label: 'Poor', description: 'Major mechanical or cosmetic issues, needs significant repairs' },
  { value: 2, label: 'Fair', description: 'Shows wear, may need some repairs, everything works' },
  { value: 3, label: 'Good', description: 'Normal wear for age, well maintained, no major issues' },
  { value: 4, label: 'Very Good', description: 'Minor wear only, excellent maintenance history' },
  { value: 5, label: 'Excellent', description: 'Like new condition, garage kept, meticulously maintained' },
] as const;

export const FEATURE_OPTIONS = [
  // Safety Features
  { id: 'backup-camera', label: 'Backup Camera', category: 'Safety' },
  { id: 'blind-spot', label: 'Blind Spot Monitoring', category: 'Safety' },
  { id: 'lane-departure', label: 'Lane Departure Warning', category: 'Safety' },
  { id: 'collision-warning', label: 'Forward Collision Warning', category: 'Safety' },
  { id: 'adaptive-cruise', label: 'Adaptive Cruise Control', category: 'Safety' },
  { id: 'parking-sensors', label: 'Parking Sensors', category: 'Safety' },
  
  // Comfort Features
  { id: 'leather-seats', label: 'Leather Seats', category: 'Comfort' },
  { id: 'heated-seats', label: 'Heated Seats', category: 'Comfort' },
  { id: 'cooled-seats', label: 'Cooled/Ventilated Seats', category: 'Comfort' },
  { id: 'sunroof', label: 'Sunroof/Moonroof', category: 'Comfort' },
  { id: 'power-seats', label: 'Power Adjustable Seats', category: 'Comfort' },
  { id: 'memory-seats', label: 'Memory Seats', category: 'Comfort' },
  { id: 'third-row', label: 'Third Row Seating', category: 'Comfort' },
  
  // Technology Features
  { id: 'navigation', label: 'Navigation System', category: 'Technology' },
  { id: 'premium-audio', label: 'Premium Audio System', category: 'Technology' },
  { id: 'apple-carplay', label: 'Apple CarPlay', category: 'Technology' },
  { id: 'android-auto', label: 'Android Auto', category: 'Technology' },
  { id: 'bluetooth', label: 'Bluetooth', category: 'Technology' },
  { id: 'wireless-charging', label: 'Wireless Phone Charging', category: 'Technology' },
  { id: 'heads-up', label: 'Heads-Up Display', category: 'Technology' },
  
  // Exterior Features
  { id: 'alloy-wheels', label: 'Alloy Wheels', category: 'Exterior' },
  { id: 'roof-rack', label: 'Roof Rack', category: 'Exterior' },
  { id: 'running-boards', label: 'Running Boards', category: 'Exterior' },
  { id: 'tow-package', label: 'Tow Package', category: 'Exterior' },
  { id: 'led-headlights', label: 'LED Headlights', category: 'Exterior' },
  
  // Performance Features
  { id: 'remote-start', label: 'Remote Start', category: 'Performance' },
  { id: 'keyless-entry', label: 'Keyless Entry', category: 'Performance' },
  { id: 'push-start', label: 'Push Button Start', category: 'Performance' },
  { id: 'sport-mode', label: 'Sport Mode', category: 'Performance' },
] as const;

export type VehicleColor = typeof VEHICLE_COLORS[number];
export type ConditionOption = typeof CONDITION_OPTIONS[number];
export type FeatureOption = typeof FEATURE_OPTIONS[number];
