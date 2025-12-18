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

// Import AFTER mocks are set up
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

const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <VehicleProvider>
      {component}
    </VehicleProvider>
  );
};

describe('VehiclePage', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVinParam = null;
    mockPush.mockClear();
    // Reset fetch to original
    global.fetch = originalFetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('without VIN parameter', () => {
    it('redirects to home page', async () => {
      mockVinParam = null;
      
      renderWithProvider(<VehiclePage />);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('with VIN parameter - loading state', () => {
    it('shows loading state initially', () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      // Mock fetch that never resolves to keep loading state
      global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText('Looking up your vehicle...')).toBeInTheDocument();
    });

    it('displays VIN while loading', () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText(/VIN:.*1GCVKNEC0MZ123456/)).toBeInTheDocument();
    });
  });

  describe('with VIN parameter - successful decode', () => {
    beforeEach(() => {
      mockVinParam = '1GCVKNEC0MZ123456';
      // Set up fetch mock that resolves immediately
      global.fetch = jest.fn().mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(validVehicleResponse),
        })
      ) as jest.Mock;
    });

    it('displays vehicle info on successful decode', async () => {
      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('2021 CHEVROLET Silverado 1500')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('displays "We found your vehicle" message', async () => {
      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('We found your vehicle')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('displays vehicle specifications', async () => {
      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Pickup')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      expect(screen.getByText('4WD')).toBeInTheDocument();
      expect(screen.getByText('Gasoline')).toBeInTheDocument();
    });

    it('renders Continue button', async () => {
      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('navigates to basics page when Continue is clicked', async () => {
      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      }, { timeout: 5000 });

      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

      expect(mockPush).toHaveBeenCalledWith('/getoffer/basics');
    });

    it('navigates home when "This isn\'t my vehicle" is clicked', async () => {
      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /This isn't my vehicle/i })).toBeInTheDocument();
      }, { timeout: 5000 });

      fireEvent.click(screen.getByRole('button', { name: /This isn't my vehicle/i }));

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('API call verification', () => {
    it('calls decode-vin API with correct VIN', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      const mockFetchFn = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(validVehicleResponse),
        })
      );
      global.fetch = mockFetchFn as jest.Mock;

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenCalledWith('/api/decode-vin?vin=1GCVKNEC0MZ123456');
      });
    });
  });

  describe('error handling', () => {
    it('shows error message when API fails', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'VIN not found' }),
        })
      ) as jest.Mock;

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Find Vehicle')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });
});
