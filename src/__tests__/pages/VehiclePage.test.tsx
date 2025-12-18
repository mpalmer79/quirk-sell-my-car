import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { VehicleProvider } from '@/context/VehicleContext';

// Track mock state
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

// Mock VIN decoder service
jest.mock('@/services/vinDecoder', () => ({
  getAvailableTrims: jest.fn(() => []),
  isValidVIN: jest.fn(() => true),
  decodeVIN: jest.fn(),
}));

// Mock vehicle image service
jest.mock('@/services/vehicleImage', () => ({
  getVehicleImage: jest.fn(() => Promise.resolve('https://example.com/car.jpg')),
}));

// Import AFTER mocks
import VehiclePage from '@/app/getoffer/vehicle/page';

const validVehicleResponse = {
  vin: '1GCVKNEC0MZ123456',
  year: 2021,
  make: 'CHEVROLET',
  model: 'Silverado 1500',
  bodyClass: 'Pickup',
  driveType: '4WD',
  engineCylinders: 8,
  engineDisplacement: '5.3',
  fuelType: 'Gasoline',
  imageUrl: 'https://example.com/car.jpg',
};

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<VehicleProvider>{ui}</VehicleProvider>);
};

// Helper to set up successful fetch
const setupSuccessfulFetch = () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(validVehicleResponse),
    })
  ) as jest.Mock;
};

// Helper to set up pending fetch (never resolves)
const setupPendingFetch = () => {
  global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
};

describe('VehiclePage', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVinParam = null;
    mockPush.mockClear();
    global.fetch = originalFetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('redirects to home when no VIN parameter', async () => {
    mockVinParam = null;
    renderWithProvider(<VehiclePage />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state with VIN', () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    setupPendingFetch();
    
    renderWithProvider(<VehiclePage />);
    
    expect(screen.getByText('Looking up your vehicle...')).toBeInTheDocument();
  });

  it('displays VIN while loading', () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    setupPendingFetch();
    
    renderWithProvider(<VehiclePage />);
    
    expect(screen.getByText(/1GCVKNEC0MZ123456/)).toBeInTheDocument();
  });

  it('calls API with correct VIN', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    setupSuccessfulFetch();
    
    renderWithProvider(<VehiclePage />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/decode-vin?vin=1GCVKNEC0MZ123456');
    });
  });

  it('displays vehicle info after successful fetch', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    setupSuccessfulFetch();
    
    renderWithProvider(<VehiclePage />);
    
    await waitFor(
      () => {
        expect(screen.getByText('2021 CHEVROLET Silverado 1500')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('shows "We found your vehicle" message', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    setupSuccessfulFetch();
    
    renderWithProvider(<VehiclePage />);
    
    await waitFor(
      () => {
        expect(screen.getByText('We found your vehicle')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('displays body style specification', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    setupSuccessfulFetch();
    
    renderWithProvider(<VehiclePage />);
    
    await waitFor(
      () => {
        expect(screen.getByText('Pickup')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('displays Continue button after fetch', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    setupSuccessfulFetch();
    
    renderWithProvider(<VehiclePage />);
    
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('navigates to basics when Continue clicked', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    setupSuccessfulFetch();
    
    renderWithProvider(<VehiclePage />);
    
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(mockPush).toHaveBeenCalledWith('/getoffer/basics');
  });

  it('navigates home when "This isn\'t my vehicle" clicked', async () => {
    mockVinParam = '1GCVKNEC0MZ123456';
    setupSuccessfulFetch();
    
    renderWithProvider(<VehiclePage />);
    
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /This isn't my vehicle/i })).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    
    fireEvent.click(screen.getByRole('button', { name: /This isn't my vehicle/i }));
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
