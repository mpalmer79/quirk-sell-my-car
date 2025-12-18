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
  fuelType: 'Gasoline',
};

describe('VehiclePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVinParam = null;
    mockPush.mockClear();
  });

  it('redirects to home when no VIN parameter', async () => {
    mockVinParam = null;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state when VIN is provided', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(screen.getByText('Looking up your vehicle...')).toBeInTheDocument();
    });
  });

  it('displays VIN in loading state', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(screen.getByText(/1GCVKNEC0MZ123456/)).toBeInTheDocument();
    });
  });

  it('calls decode-vin API with correct VIN', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    const mockFetch = jest.fn(() => new Promise(() => {}));
    global.fetch = mockFetch as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/decode-vin?vin=1GCVKNEC0MZ123456');
    });
  });

  it('shows error state when API returns error', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid VIN' }),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to Find Vehicle')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows error message from API', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'VIN not found in database' }),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(screen.getByText('VIN not found in database')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('has Try Again button on error', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Error' }),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('navigates home when Try Again clicked', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Error' }),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('displays vehicle info on successful decode', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVehicleData),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(screen.getByText('We found your vehicle')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('displays vehicle year make model', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockVehicleData),
    }) as jest.Mock;
    
    render(<VehicleProvider><VehiclePage /></VehicleProvider>);
    
    await waitFor(() => {
      expect(screen.getByText('2021 CHEVROLET Silverado 1500')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
