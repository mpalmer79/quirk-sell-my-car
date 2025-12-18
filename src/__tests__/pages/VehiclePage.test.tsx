import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VehicleProvider } from '@/context/VehicleContext';

// Mock state
let mockVinParam: string | null = null;
const mockPush = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => key === 'vin' ? mockVinParam : null,
  }),
}));

// Mock services
jest.mock('@/services/vinDecoder', () => ({
  getAvailableTrims: jest.fn(() => []),
  isValidVIN: jest.fn(() => true),
  decodeVIN: jest.fn(),
}));

jest.mock('@/services/vehicleImage', () => ({
  getVehicleImage: jest.fn(() => Promise.resolve('https://example.com/car.jpg')),
}));

// Import after mocks
import VehiclePage from '@/app/getoffer/vehicle/page';

const mockVehicleData = {
  vin: '1GCVKNEC0MZ123456',
  year: 2021,
  make: 'CHEVROLET',
  model: 'Silverado 1500',
  bodyClass: 'Pickup',
  driveType: '4WD',
  engineCylinders: 8,
  engineDisplacement: '5.3',
  fuelType: 'Gasoline',
};

describe('VehiclePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVinParam = null;
    mockPush.mockClear();
    // @ts-ignore
    global.fetch = undefined;
  });

  it('redirects to home when no VIN', async () => {
    mockVinParam = null;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state with VIN', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    // findByText waits automatically
    expect(await screen.findByText('Looking up your vehicle...')).toBeInTheDocument();
  });

  it('displays VIN in loading state', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    expect(await screen.findByText(/1GCVKNEC0MZ123456/)).toBeInTheDocument();
  });

  it('calls fetch with correct URL', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    const mockFetch = jest.fn(() => new Promise(() => {}));
    global.fetch = mockFetch as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/decode-vin?vin=1GCVKNEC0MZ123456');
    });
  });

  it('displays vehicle title after successful fetch', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVehicleData),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    // Use findByText which waits for element to appear
    const title = await screen.findByText('2021 CHEVROLET Silverado 1500', {}, { timeout: 5000 });
    expect(title).toBeInTheDocument();
  });

  it('shows success message after fetch', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVehicleData),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    const message = await screen.findByText('We found your vehicle', {}, { timeout: 5000 });
    expect(message).toBeInTheDocument();
  });

  it('displays body style after fetch', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVehicleData),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    const bodyStyle = await screen.findByText('Pickup', {}, { timeout: 5000 });
    expect(bodyStyle).toBeInTheDocument();
  });

  it('shows Continue button after fetch', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVehicleData),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    const button = await screen.findByRole('button', { name: /Continue/i }, { timeout: 5000 });
    expect(button).toBeInTheDocument();
  });

  it('navigates to basics on Continue click', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVehicleData),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    const button = await screen.findByRole('button', { name: /Continue/i }, { timeout: 5000 });
    fireEvent.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('/getoffer/basics');
  });

  it('navigates home on "This isn\'t my vehicle" click', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVehicleData),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    const button = await screen.findByRole('button', { name: /This isn't my vehicle/i }, { timeout: 5000 });
    fireEvent.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
