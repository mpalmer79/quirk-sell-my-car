import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import VehiclePage from '@/app/getoffer/vehicle/page';
import { VehicleProvider } from '@/context/VehicleContext';

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
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

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

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
    mockSearchParams.delete('vin');
  });

  describe('without VIN parameter', () => {
    it('should redirect to home page', async () => {
      renderWithProvider(<VehiclePage />);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('with VIN parameter', () => {
    beforeEach(() => {
      mockSearchParams.set('vin', '1GCVKNEC0MZ123456');
    });

    it('should show loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText('Looking up your vehicle...')).toBeInTheDocument();
    });

    it('should display VIN while loading', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText('VIN: 1GCVKNEC0MZ123456')).toBeInTheDocument();
    });

    it('should display vehicle info on successful decode', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
          bodyClass: 'Pickup',
          driveType: '4WD',
          engineCylinders: 8,
          engineDisplacement: '5.3',
          fuelType: 'Gasoline',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('2021 CHEVROLET Silverado 1500')).toBeInTheDocument();
      });
    });

    it('should display "We found your vehicle" message', async () => {
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
        expect(screen.getByText('We found your vehicle')).toBeInTheDocument();
      });
    });

    it('should display vehicle specifications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
          bodyClass: 'Pickup',
          driveType: '4WD',
          engineCylinders: 8,
          engineDisplacement: '5.3',
          fuelType: 'Gasoline',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Pickup')).toBeInTheDocument();
        expect(screen.getByText('4WD')).toBeInTheDocument();
        expect(screen.getByText(/8-Cyl.*5.3L/)).toBeInTheDocument();
        expect(screen.getByText('Gasoline')).toBeInTheDocument();
      });
    });

    it('should show trim selector when trim is not in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
          // No trim field
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Select Your Trim Level')).toBeInTheDocument();
      });
    });

    it('should not show trim selector when trim is provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
          trim: 'LT',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('2021 CHEVROLET Silverado 1500')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Select Your Trim Level')).not.toBeInTheDocument();
    });

    it('should render Continue button', async () => {
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
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      });
    });

    it('should render "This isn\'t my vehicle" button', async () => {
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
        expect(screen.getByRole('button', { name: /This isn't my vehicle/i })).toBeInTheDocument();
      });
    });

    it('should navigate to home when "This isn\'t my vehicle" is clicked', async () => {
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
        expect(screen.getByRole('button', { name: /This isn't my vehicle/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /This isn't my vehicle/i }));

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should navigate to basics page when Continue is clicked', async () => {
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
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

      expect(mockPush).toHaveBeenCalledWith('/getoffer/basics');
    });
  });

  describe('error states', () => {
    beforeEach(() => {
      mockSearchParams.set('vin', 'INVALIDVIN12345678');
    });

    it('should display error message on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Invalid VIN format',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Find Vehicle')).toBeInTheDocument();
        expect(screen.getByText('Invalid VIN format')).toBeInTheDocument();
      });
    });

    it('should display Try Again button on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Invalid VIN',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      });
    });

    it('should navigate to home when Try Again is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Invalid VIN',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Find Vehicle')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle generic errors', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Find Vehicle')).toBeInTheDocument();
        expect(screen.getByText('Failed to look up vehicle')).toBeInTheDocument();
      });
    });
  });

  describe('API call', () => {
    beforeEach(() => {
      mockSearchParams.set('vin', '1GCVKNEC0MZ123456');
    });

    it('should call decode-vin API with correct VIN', async () => {
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
