import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import VehiclePage from '@/app/getoffer/vehicle/page';
import { VehicleProvider } from '@/context/VehicleContext';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/services/vinDecoder', () => ({
  getAvailableTrims: jest.fn(() => ['Base', 'LT', 'LTZ']),
}));

jest.mock('@/services/vehicleImage', () => ({
  getVehicleImage: jest.fn(() => Promise.resolve('https://example.com/car.jpg')),
}));

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<VehicleProvider>{ui}</VehicleProvider>);
};

describe('VehiclePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  describe('without VIN parameter', () => {
    it('redirects to home', async () => {
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

    it('shows loading state initially', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText('Looking up your vehicle...')).toBeInTheDocument();
    });

    it('shows VIN while loading', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText(/VIN: 1GCVKNEC0MZ123456/)).toBeInTheDocument();
    });

    it('displays vehicle info on success', async () => {
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
        expect(screen.getByText(/2021 CHEVROLET Silverado 1500/)).toBeInTheDocument();
      });
    });

    it('shows We found your vehicle message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('We found your vehicle')).toBeInTheDocument();
      });
    });

    it('displays vehicle specs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
          bodyClass: 'Pickup',
          driveType: '4WD',
          fuelType: 'Gasoline',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Pickup')).toBeInTheDocument();
        expect(screen.getByText('4WD')).toBeInTheDocument();
        expect(screen.getByText('Gasoline')).toBeInTheDocument();
      });
    });

    it('shows trim selector when no trim in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Select Your Trim Level')).toBeInTheDocument();
      });
    });

    it('hides trim selector when trim provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
          trim: 'LT',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText(/2021 CHEVROLET/)).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Select Your Trim Level')).not.toBeInTheDocument();
    });

    it('shows Continue button', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      });
    });

    it('navigates to basics when Continue clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

      expect(mockPush).toHaveBeenCalledWith('/getoffer/basics');
    });

    it('navigates home when This isn\'t my vehicle clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText(/This isn't my vehicle/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/This isn't my vehicle/i));

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('error states', () => {
    beforeEach(() => {
      mockSearchParams.set('vin', 'INVALIDVIN12345678');
    });

    it('shows error message on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid VIN format' }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Find Vehicle')).toBeInTheDocument();
      });
    });

    it('shows error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid VIN format' }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Invalid VIN format')).toBeInTheDocument();
      });
    });

    it('shows Try Again button on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error' }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      });
    });

    it('navigates home when Try Again clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error' }),
      } as Response);

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProvider(<VehiclePage />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Find Vehicle')).toBeInTheDocument();
      });
    });
  });
});
