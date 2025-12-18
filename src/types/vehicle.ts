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
  engineDisplacement?: string;
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
  entertainment: string[];
  accessoryPackages: string[];
  exterior: string[];
  safetyAndSecurity: string[];
  cargoAndTowing: string[];
  wheelsAndTires: string[];
  seats: string[];
}

export interface VehicleCondition {
  accidentHistory?: 'none' | '1' | '2+';
  drivability?: 'drivable' | 'not-drivable';
  mechanicalIssues?: string[];
  engineIssues?: string[];
  exteriorDamage?: string[];
  interiorDamage?: string[];
  technologyIssues?: string[];
  windshieldDamage?: 'minor' | 'major' | 'none';
  tiresReplaced?: '1' | '2' | '3' | '4' | 'none';
  modifications?: boolean;
  smokedIn?: boolean;
  keys?: '1' | '2+';
  overallCondition?: 'like-new' | 'pretty-great' | 'just-okay' | 'kind-of-rough' | 'major-issues';
}

export interface OfferData {
  vehicleInfo: VehicleInfo;
  basics: VehicleBasics;
  features: VehicleFeatures;
  condition: VehicleCondition;
  estimatedValue: number;
  offerAmount: number;
  offerExpiry: string;
  isPreliminary: boolean;
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

// Condition options for multi-select fields
export const CONDITION_OPTIONS = {
  mechanicalIssues: [
    { id: 'none', label: 'None / No Issues' },
    { id: 'ac-heat', label: 'A/C or Heating' },
    { id: 'brakes', label: 'Brakes' },
    { id: 'suspension', label: 'Suspension' },
    { id: 'steering', label: 'Steering' },
    { id: 'transmission', label: 'Transmission Issues' },
    { id: 'electrical', label: 'Electrical Problems' },
    { id: 'exhaust', label: 'Exhaust System' },
  ],
  engineIssues: [
    { id: 'none', label: 'None / Runs Great' },
    { id: 'check-engine', label: 'Check Engine Light On' },
    { id: 'oil-leak', label: 'Oil Leak' },
    { id: 'overheating', label: 'Overheating' },
    { id: 'rough-idle', label: 'Rough Idle' },
    { id: 'wont-start', label: 'Won\'t Start' },
    { id: 'smoke', label: 'Smoke from Exhaust' },
    { id: 'noise', label: 'Unusual Noise' },
  ],
  exteriorDamage: [
    { id: 'none', label: 'None / Like New' },
    { id: 'scratches', label: 'Minor Scratches' },
    { id: 'dents', label: 'Dents' },
    { id: 'rust', label: 'Rust' },
    { id: 'paint-fade', label: 'Paint Fading' },
    { id: 'bumper', label: 'Bumper Damage' },
    { id: 'body-panel', label: 'Body Panel Damage' },
    { id: 'lights', label: 'Broken Lights' },
  ],
  interiorDamage: [
    { id: 'none', label: 'None / Like New' },
    { id: 'seat-wear', label: 'Seat Wear/Tears' },
    { id: 'carpet-stains', label: 'Carpet Stains' },
    { id: 'dashboard', label: 'Dashboard Cracks' },
    { id: 'headliner', label: 'Headliner Sagging' },
    { id: 'odor', label: 'Persistent Odor' },
    { id: 'missing-parts', label: 'Missing Parts' },
  ],
  technologyIssues: [
    { id: 'none', label: 'None / All Working' },
    { id: 'radio', label: 'Radio/Sound System' },
    { id: 'navigation', label: 'Navigation System' },
    { id: 'bluetooth', label: 'Bluetooth' },
    { id: 'backup-camera', label: 'Backup Camera' },
    { id: 'display', label: 'Display Screen' },
    { id: 'sensors', label: 'Parking Sensors' },
  ],
};

// Feature options organized by category
export const FEATURE_OPTIONS = {
  entertainment: [
    { id: 'premium-audio', label: 'Premium Audio System' },
    { id: 'navigation', label: 'Navigation System' },
    { id: 'bluetooth', label: 'Bluetooth' },
    { id: 'apple-carplay', label: 'Apple CarPlay' },
    { id: 'android-auto', label: 'Android Auto' },
    { id: 'satellite-radio', label: 'Satellite Radio' },
    { id: 'rear-entertainment', label: 'Rear Entertainment' },
    { id: 'wifi-hotspot', label: 'WiFi Hotspot' },
  ],
  accessoryPackages: [
    { id: 'sport-package', label: 'Sport Package' },
    { id: 'luxury-package', label: 'Luxury Package' },
    { id: 'technology-package', label: 'Technology Package' },
    { id: 'appearance-package', label: 'Appearance Package' },
    { id: 'cold-weather', label: 'Cold Weather Package' },
    { id: 'tow-package', label: 'Tow Package' },
    { id: 'off-road', label: 'Off-Road Package' },
  ],
  exterior: [
    { id: 'sunroof', label: 'Sunroof/Moonroof' },
    { id: 'panoramic-roof', label: 'Panoramic Roof' },
    { id: 'roof-rack', label: 'Roof Rack' },
    { id: 'running-boards', label: 'Running Boards' },
    { id: 'bed-liner', label: 'Bed Liner' },
    { id: 'tonneau-cover', label: 'Tonneau Cover' },
    { id: 'led-headlights', label: 'LED Headlights' },
    { id: 'fog-lights', label: 'Fog Lights' },
  ],
  safetyAndSecurity: [
    { id: 'backup-camera', label: 'Backup Camera' },
    { id: 'blind-spot', label: 'Blind Spot Monitoring' },
    { id: 'lane-departure', label: 'Lane Departure Warning' },
    { id: 'forward-collision', label: 'Forward Collision Warning' },
    { id: 'adaptive-cruise', label: 'Adaptive Cruise Control' },
    { id: 'parking-sensors', label: 'Parking Sensors' },
    { id: '360-camera', label: '360° Camera' },
    { id: 'remote-start', label: 'Remote Start' },
  ],
  cargoAndTowing: [
    { id: 'trailer-hitch', label: 'Trailer Hitch' },
    { id: 'tow-hooks', label: 'Tow Hooks' },
    { id: 'cargo-net', label: 'Cargo Net' },
    { id: 'cargo-cover', label: 'Cargo Cover' },
    { id: 'power-liftgate', label: 'Power Liftgate' },
    { id: 'hands-free-liftgate', label: 'Hands-Free Liftgate' },
  ],
  wheelsAndTires: [
    { id: 'alloy-wheels', label: 'Alloy Wheels' },
    { id: 'chrome-wheels', label: 'Chrome Wheels' },
    { id: 'upgraded-wheels', label: 'Upgraded Wheels (18"+)' },
    { id: 'spare-tire', label: 'Full-Size Spare' },
    { id: 'run-flat', label: 'Run-Flat Tires' },
    { id: 'all-terrain', label: 'All-Terrain Tires' },
  ],
  seats: [
    { id: 'leather', label: 'Leather Seats' },
    { id: 'heated-front', label: 'Heated Front Seats' },
    { id: 'heated-rear', label: 'Heated Rear Seats' },
    { id: 'cooled-seats', label: 'Cooled/Ventilated Seats' },
    { id: 'power-seats', label: 'Power Adjustable Seats' },
    { id: 'memory-seats', label: 'Memory Seats' },
    { id: 'third-row', label: 'Third Row Seating' },
    { id: 'captain-chairs', label: 'Captain\'s Chairs' },
  ],
};

export type VehicleColor = typeof VEHICLE_COLORS[number];
// Chat types for ChatWidget
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
