import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { VehicleProvider } from '@/context/VehicleContext';
import { VehicleInfo, VehicleBasics, VehicleCondition, VehicleFeatures } from '@/types/vehicle';

export const mockVehicleInfo: VehicleInfo = {
  vin: '1GCVKNEC0MZ123456',
  year: 2021,
  make: 'CHEVROLET',
  model: 'Silverado 1500',
  trim: 'LT',
  bodyClass: 'Pickup',
};

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

export const mockFeatures: VehicleFeatures = {
  entertainment: ['navigation'],
  accessoryPackages: [],
  exterior: ['running-boards'],
  safetyAndSecurity: [],
  cargoAndTowing: ['towing-pkg'],
  wheelsAndTires: [],
  seats: ['leather'],
};

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

interface WrapperProps {
  children: ReactNode;
}

const AllProviders = ({ children }: WrapperProps) => {
  return <VehicleProvider>{children}</VehicleProvider>;
};

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
