
// Vehicle Types for Quirk Sell My Car

export interface VehicleInfo {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyClass?: string;
  driveType?: string;
  engineCylinders?: number;
  engineDisplacement?: string;
  fuelType?: string;
  transmissionStyle?: string;
  doors?: number;
  imageUrl?: string;
}

export interface VehicleBasics {
  mileage: number;
  zipCode: string;
  color: string;
  transmission: string;
  drivetrain: string;
  engine: string;
  sellOrTrade: 'sell' | 'trade' | 'not-sure';
  loanOrLease: 'loan' | 'lease' | 'neither';
}

export interface VehicleFeatures {
  entertainment: string[];
  accessoryPackages: string[];
  exterior: string[];
  safetyAndSecurity: string[];
  cargoAndTowing: string[];
  wheelsAndTires: string[];
  seats: string[];
}

export interface VehicleCondition {
  accidentHistory: 'none' | '1' | '2+';
  drivability: 'drivable' | 'not-drivable';
  mechanicalIssues: string[];
  engineIssues: string[];
  exteriorDamage: string[];
  interiorDamage: string[];
  technologyIssues: string[];
  windshieldDamage: 'minor' | 'major' | 'none';
  tiresReplaced: '1' | '2' | '3' | '4' | 'none';
  modifications: boolean;
  smokedIn: boolean;
  keys: '1' | '2+';
  overallCondition: 'like-new' | 'pretty-great' | 'just-okay' | 'kind-of-rough' | 'major-issues';
}

export interface OfferData {
  vehicleInfo: VehicleInfo;
  basics: VehicleBasics;
  features: VehicleFeatures;
  condition: VehicleCondition;
  email?: string;
  estimatedValue?: number;
  offerAmount?: number;
  offerExpiry?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

export const CONDITION_OPTIONS = {
  mechanicalIssues: [
    { id: 'ac', label: 'Air Conditioning' },
    { id: 'transmission', label: 'Transmission' },
    { id: 'tire-pressure', label: 'Tire Pressure' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'none', label: 'No mechanical or electrical issues' },
  ],
  engineIssues: [
    { id: 'check-engine', label: 'Check Engine Light' },
    { id: 'strange-noises', label: 'Strange Noises' },
    { id: 'vibration', label: 'Engine Vibration' },
    { id: 'smoke-steam', label: 'Smoke or Steam' },
    { id: 'other', label: 'Other engine issues' },
    { id: 'none', label: 'No engine issues' },
  ],
  exteriorDamage: [
    { id: 'minor', label: 'Minor Damage' },
    { id: 'fading-paint', label: 'Fading Paint' },
    { id: 'dents-scrapes', label: 'Dents or Scrapes' },
    { id: 'rust', label: 'Rust' },
    { id: 'hail', label: 'Hail Damage' },
    { id: 'none', label: 'No exterior damage' },
  ],
  interiorDamage: [
    { id: 'stains', label: 'Noticeable Stains' },
    { id: 'rips-tears', label: 'Rips or Tears in Seats' },
    { id: 'odors', label: 'Persistent Odors' },
    { id: 'damaged-panels', label: 'Damaged Dash/interior panels' },
    { id: 'none', label: 'No interior damage' },
  ],
  technologyIssues: [
    { id: 'sound-system', label: 'Sound System' },
    { id: 'display', label: 'Interior Display' },
    { id: 'backup-camera', label: 'Backup Camera' },
    { id: 'safety-sensors', label: 'Safety Sensors' },
    { id: 'missing-equipment', label: 'Missing Equipment' },
    { id: 'none', label: 'No technology system issues' },
  ],
};

export const FEATURE_OPTIONS = {
  entertainment: [
    { id: 'navigation', label: 'Navigation System' },
    { id: 'premium-sound', label: 'Premium Sound' },
  ],
  accessoryPackages: [
    { id: 'sport-appearance', label: 'Sport Appearance' },
    { id: 'trail-runner', label: 'Trail Runner Special Edition' },
    { id: 'premium-interior', label: 'Premium Interior Pkg' },
  ],
  exterior: [
    { id: 'pickup-shell', label: 'Pickup Shell' },
    { id: 'grille-guard', label: 'Grille Guard' },
    { id: 'running-boards', label: 'Running Boards' },
  ],
  safetyAndSecurity: [
    { id: 'lane-departure', label: 'Lane Departure Warning System' },
  ],
  cargoAndTowing: [
    { id: 'tonneau-cover', label: 'Hard Tonneau Cover' },
    { id: 'towing-pkg', label: 'Towing Pkg' },
    { id: 'bed-liner', label: 'Bed Liner' },
  ],
  wheelsAndTires: [
    { id: 'oversized-premium', label: 'Oversized Premium Wheels 20+' },
    { id: 'off-road-tires', label: 'Oversize Off-Road Tires' },
    { id: 'premium-wheels', label: 'Premium Wheels' },
  ],
  seats: [
    { id: 'leather', label: 'Leather' },
  ],
};
