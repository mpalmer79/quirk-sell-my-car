import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('VehiclePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVinParam = null;
    mockPush.mockClear();
  });

  describe('without VIN parameter', () => {
    it('redirects to home page', async () => {
      mockVinParam = null;
      
      render(<VehicleProvider><VehiclePage /></VehicleProvider>);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('with VIN parameter', () => {
    it('shows loading state', async () => {
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

    it('calls fetch only once per render', async () => {
      mockVinParam = '1GCVKNEC0MZ123456';
      const mockFetch = jest.fn(() => new Promise(() => {}));
      global.fetch = mockFetch as jest.Mock;
      
      render(<VehicleProvider><VehiclePage /></VehicleProvider>);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('VIN validation', () => {
    it('handles empty VIN by redirecting', async () => {
      mockVinParam = '';
      
      render(<VehicleProvider><VehiclePage /></VehicleProvider>);
      
      // Empty string is falsy, should redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });
});
