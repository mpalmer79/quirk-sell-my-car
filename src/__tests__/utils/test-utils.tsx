import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { VehicleProvider } from '@/context/VehicleContext';
import { VehicleInfo, VehicleBasics, VehicleCondition, VehicleFeatures } from '@/types/vehicle';

// Default mock vehicle info
export const mockVehicleInfo: VehicleInfo = {
  vin: '1GCVKNEC0MZ123456',
  year: 2021,
  make: 'CHEVROLET',
  model: 'Silverado 1500',
  trim: 'LT',
  bodyClass: 'Pickup',
  driveType: '4WD/4-Wheel Drive/4x4',
  engineCylinders: 8,
  engineDisplacement: '5.3',
  fuelType: 'Gasoline',
  transmissionStyle: 'Automatic',
  doors: 4,
};

// Default mock basics
export const mockBasics: VehicleBasics = {
  mileage: 45000,
  zipCode: '03060',
  color: 'Black',
  transmission: 'Automatic',
  drivetrain: '4WD',
  engine: 'V8',
  sellOrTrade: 'sell',
  loanOrLease: 'neither',
};

// Default mock features
export const mockFeatures: VehicleFeatures = {
  entertainment: ['navigation', 'premium-sound'],
  accessoryPackages: [],
  exterior: ['running-boards'],
  safetyAndSecurity: ['lane-departure'],
  cargoAndTowing: ['towing-pkg', 'bed-liner'],
  wheelsAndTires: ['premium-wheels'],
  seats: ['leather'],
};

// Default mock condition
export const mockCondition: VehicleCondition = {
  accidentHistory: 'none',
  drivability: 'drivable',
  mechanicalIssues: ['none'],
  engineIssues: ['none'],
  exteriorDamage: ['none'],
  interiorDamage: ['none'],
  technologyIssues: ['none'],
  windshieldDamage: 'none',
  tiresReplaced: '4',
  modifications: false,
  smokedIn: false,
  keys: '2+',
  overallCondition: 'pretty-great',
};

// Mock router helpers
export const createMockRouter = (overrides = {}) => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  ...overrides,
});

// Provider wrapper for testing
interface WrapperProps {
  children: ReactNode;
}

const AllProviders = ({ children }: WrapperProps) => {
  return (
    <VehicleProvider>
      {children}
    </VehicleProvider>
  );
};

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

// Mock fetch response helpers
export const createSuccessResponse = <T,>(data: T): Response => ({
  ok: true,
  json: async () => data,
  status: 200,
  statusText: 'OK',
} as Response);

export const createErrorResponse = (error: string, status = 400): Response => ({
  ok: false,
  json: async () => ({ error }),
  text: async () => error,
  status,
  statusText: 'Error',
} as Response);

// Wait for loading to complete helper
export const waitForLoadingToComplete = async () => {
  // Small delay to allow async operations to complete
  await new Promise(resolve => setTimeout(resolve, 0));
};

// Create NHTSA mock response
export const createNHTSAResponse = (vehicleInfo: Partial<VehicleInfo> = {}) => ({
  Count: 136,
  Message: 'Results returned successfully',
  SearchCriteria: `VIN:${vehicleInfo.vin || mockVehicleInfo.vin}`,
  Results: [
    { Variable: 'Model Year', Value: String(vehicleInfo.year || mockVehicleInfo.year) },
    { Variable: 'Make', Value: vehicleInfo.make || mockVehicleInfo.make },
    { Variable: 'Model', Value: vehicleInfo.model || mockVehicleInfo.model },
    { Variable: 'Trim', Value: vehicleInfo.trim || null },
    { Variable: 'Body Class', Value: vehicleInfo.bodyClass || null },
    { Variable: 'Drive Type', Value: vehicleInfo.driveType || null },
    { Variable: 'Engine Number of Cylinders', Value: vehicleInfo.engineCylinders?.toString() || null },
    { Variable: 'Displacement (L)', Value: vehicleInfo.engineDisplacement || null },
    { Variable: 'Fuel Type - Primary', Value: vehicleInfo.fuelType || null },
    { Variable: 'Transmission Style', Value: vehicleInfo.transmissionStyle || null },
    { Variable: 'Doors', Value: vehicleInfo.doors?.toString() || null },
  ],
});

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
