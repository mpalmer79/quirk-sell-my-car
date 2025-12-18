import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import VehiclePage from '@/app/getoffer/vehicle/page';
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

// Mock the VIN decoder service
jest.mock('@/services/vinDecoder', () => ({
  getAvailableTrims: jest.fn(() => ['Base', 'LT', 'LTZ', 'High Country']),
  isValidVIN: jest.fn(() => true),
  decodeVIN: jest.fn(),
}));

// Mock the vehicle image service
jest.mock('@/services/vehicleImage', () => ({
  getVehicleImage: jest.fn(() => Promise.resolve('https://example.com/car.jpg')),
}));

// Setup fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <VehicleProvider>
      {component}
    </VehicleProvider>
  );
};

describe('VehiclePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    mockVinParam = null;
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

  describe('with VIN parameter', () => {
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
    };

    it('shows loading state initially', () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText('Looking up your vehicle...')).toBeInTheDocument();
    });

    it('displays VIN while loading', () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockImplementation(() => new Promise(() => {}));
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText('VIN: 1GCVKNEC0MZ123456')).toBeInTheDocument();
    });

    it('displays vehicle info on successful decode', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validVehicleResponse,
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('2021 CHEVROLET Silverado 1500')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays "We found your vehicle" message', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validVehicleResponse,
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('We found your vehicle')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays vehicle specifications', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validVehicleResponse,
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Pickup')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('4WD')).toBeInTheDocument();
      expect(screen.getByText('Gasoline')).toBeInTheDocument();
    });

    it('renders Continue button', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validVehicleResponse,
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('navigates to basics page when Continue is clicked', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validVehicleResponse,
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

      expect(mockPush).toHaveBeenCalledWith('/getoffer/basics');
    });

    it('navigates home when "This isn\'t my vehicle" is clicked', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validVehicleResponse,
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /This isn't my vehicle/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      fireEvent.click(screen.getByRole('button', { name: /This isn't my vehicle/i }));

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('API call', () => {
    it('calls decode-vin API with correct VIN', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/decode-vin?vin=1GCVKNEC0MZ123456');
      });
    });
  });
});
