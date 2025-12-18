import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VehiclePage from '@/app/getoffer/vehicle/page';
import { VehicleProvider } from '@/context/VehicleContext';

const mockPush = jest.fn();
const mockFetch = jest.fn();

// Store searchParams value that can be changed per test
let vinParam: string | null = null;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => key === 'vin' ? vinParam : null,
  }),
}));

jest.mock('@/services/vinDecoder', () => ({
  getAvailableTrims: jest.fn(() => ['Base', 'LT', 'LTZ']),
}));

jest.mock('@/services/vehicleImage', () => ({
  getVehicleImage: jest.fn(() => Promise.resolve('https://example.com/car.jpg')),
}));

// Override global fetch
global.fetch = mockFetch;

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<VehicleProvider>{ui}</VehicleProvider>);
};

describe('VehiclePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vinParam = null;
  });

  describe('without VIN parameter', () => {
    it('redirects to home', async () => {
      vinParam = null;
      
      renderWithProvider(<VehiclePage />);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('with VIN parameter', () => {
    it('shows loading state initially', () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText('Looking up your vehicle...')).toBeInTheDocument();
    });

    it('shows VIN while loading', () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockImplementation(() => new Promise(() => {}));
      
      renderWithProvider(<VehiclePage />);
      
      expect(screen.getByText(/1GCVKNEC0MZ123456/)).toBeInTheDocument();
    });

    it('displays vehicle info on success', async () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
        }),
      });

      renderWithProvider(<VehiclePage />);

      // Use findByText which has built-in async handling
      expect(await screen.findByText('We found your vehicle', {}, { timeout: 3000 })).toBeInTheDocument();
    });

    it('shows We found your vehicle message', async () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      });

      renderWithProvider(<VehiclePage />);

      expect(await screen.findByText('We found your vehicle', {}, { timeout: 3000 })).toBeInTheDocument();
    });

    it('displays vehicle specs', async () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
          bodyClass: 'Pickup',
          driveType: '4WD',
          fuelType: 'Gasoline',
        }),
      });

      renderWithProvider(<VehiclePage />);

      expect(await screen.findByText('Pickup', {}, { timeout: 3000 })).toBeInTheDocument();
      expect(screen.getByText('4WD')).toBeInTheDocument();
      expect(screen.getByText('Gasoline')).toBeInTheDocument();
    });

    it('shows trim selector when no trim in response', async () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      });

      renderWithProvider(<VehiclePage />);

      expect(await screen.findByText('Select Your Trim Level', {}, { timeout: 3000 })).toBeInTheDocument();
    });

    it('hides trim selector when trim provided', async () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
          trim: 'LT',
        }),
      });

      renderWithProvider(<VehiclePage />);

      // Wait for content to load
      await screen.findByText('We found your vehicle', {}, { timeout: 3000 });
      
      expect(screen.queryByText('Select Your Trim Level')).not.toBeInTheDocument();
    });

    it('shows Continue button', async () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      });

      renderWithProvider(<VehiclePage />);

      expect(await screen.findByRole('button', { name: /Continue/i }, { timeout: 3000 })).toBeInTheDocument();
    });

    it('navigates to basics when Continue clicked', async () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      });

      renderWithProvider(<VehiclePage />);

      const continueBtn = await screen.findByRole('button', { name: /Continue/i }, { timeout: 3000 });
      fireEvent.click(continueBtn);

      expect(mockPush).toHaveBeenCalledWith('/getoffer/basics');
    });

    it('navigates home when This isn\'t my vehicle clicked', async () => {
      vinParam = '1GCVKNEC0MZ123456';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        }),
      });

      renderWithProvider(<VehiclePage />);

      const notMyVehicleBtn = await screen.findByText(/This isn't my vehicle/i, {}, { timeout: 3000 });
      fireEvent.click(notMyVehicleBtn);

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('error states', () => {
    it('shows error message on API error', async () => {
      vinParam = 'INVALIDVIN12345678';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid VIN format' }),
      });

      renderWithProvider(<VehiclePage />);

      expect(await screen.findByText('Unable to Find Vehicle', {}, { timeout: 3000 })).toBeInTheDocument();
    });

    it('shows error details', async () => {
      vinParam = 'INVALIDVIN12345678';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid VIN format' }),
      });

      renderWithProvider(<VehiclePage />);

      expect(await screen.findByText('Invalid VIN format', {}, { timeout: 3000 })).toBeInTheDocument();
    });

    it('shows Try Again button on error', async () => {
      vinParam = 'INVALIDVIN12345678';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Error' }),
      });

      renderWithProvider(<VehiclePage />);

      expect(await screen.findByRole('button', { name: /Try Again/i }, { timeout: 3000 })).toBeInTheDocument();
    });

    it('navigates home when Try Again clicked', async () => {
      vinParam = 'INVALIDVIN12345678';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Error' }),
      });

      renderWithProvider(<VehiclePage />);

      const tryAgainBtn = await screen.findByRole('button', { name: /Try Again/i }, { timeout: 3000 });
      fireEvent.click(tryAgainBtn);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('handles network errors', async () => {
      vinParam = 'INVALIDVIN12345678';
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProvider(<VehiclePage />);

      expect(await screen.findByText('Unable to Find Vehicle', {}, { timeout: 3000 })).toBeInTheDocument();
    });
  });
});
