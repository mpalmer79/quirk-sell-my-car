import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
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

const renderWithProvider = async (ui: React.ReactNode) => {
  let result;
  await act(async () => {
    result = render(<VehicleProvider>{ui}</VehicleProvider>);
  });
  return result!;
};

// Helper to flush all pending promises
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

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

  describe('without VIN', () => {
    it('redirects to home when no VIN parameter', async () => {
      mockVinParam = null;
      
      await renderWithProvider(<VehiclePage />);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('loading state', () => {
    it('shows loading message', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      // Fetch that never resolves
      global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
      
      await renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText('Looking up your vehicle...')).toBeInTheDocument();
    });

    it('displays VIN while loading', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;
      
      await renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText(/1GCVKNEC0MZ123456/)).toBeInTheDocument();
    });
  });

  describe('successful fetch', () => {
    beforeEach(() => {
      mockVinParam = '1GCVKNEC0MZ123456';
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(validVehicleResponse),
        })
      ) as jest.Mock;
    });

    it('calls API with correct VIN', async () => {
      await renderWithProvider(<VehiclePage />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/decode-vin?vin=1GCVKNEC0MZ123456');
      });
    });

    it('displays vehicle info after fetch', async () => {
      await renderWithProvider(<VehiclePage />);
      
      // Wait for fetch to complete and state to update
      await act(async () => {
        await flushPromises();
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('2021 CHEVROLET Silverado 1500')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('shows "We found your vehicle" message', async () => {
      await renderWithProvider(<VehiclePage />);
      
      await act(async () => {
        await flushPromises();
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('We found your vehicle')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('displays body style', async () => {
      await renderWithProvider(<VehiclePage />);
      
      await act(async () => {
        await flushPromises();
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('Pickup')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('shows Continue button', async () => {
      await renderWithProvider(<VehiclePage />);
      
      await act(async () => {
        await flushPromises();
      });
      
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('navigates to basics when Continue clicked', async () => {
      await renderWithProvider(<VehiclePage />);
      
      await act(async () => {
        await flushPromises();
      });
      
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
      });
      
      expect(mockPush).toHaveBeenCalledWith('/getoffer/basics');
    });

    it('navigates home when "This isn\'t my vehicle" clicked', async () => {
      await renderWithProvider(<VehiclePage />);
      
      await act(async () => {
        await flushPromises();
      });
      
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /This isn't my vehicle/i })).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
      
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /This isn't my vehicle/i }));
      });
      
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
