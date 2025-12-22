import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { VehicleInfo } from '@/types/vehicle';

// Mock the module BEFORE importing component - CORRECT PATH: @/services/vehicleImage
jest.mock('@/services/vehicleImage', () => ({
  getVehicleImageByMake: jest.fn(() => 'https://example.com/car.jpg'),
  getFallbackImage: jest.fn(() => 'https://example.com/fallback.jpg'),
  getVehicleImage: jest.fn(() => Promise.resolve('https://example.com/car.jpg')),
  getVehicleImageServerSide: jest.fn(() => Promise.resolve('https://example.com/car.jpg')),
}));

// Import component AFTER mock is set up
import VehicleImage, { VehicleImageCompact } from '@/components/VehicleImage';
import { getVehicleImageByMake } from '@/services/vehicleImage';

const mockGetVehicleImageByMake = getVehicleImageByMake as jest.MockedFunction<typeof getVehicleImageByMake>;

describe('VehicleImage', () => {
  const mockVehicle: VehicleInfo = {
    vin: '1GCVKNEC0MZ123456',
    year: 2021,
    make: 'CHEVROLET',
    model: 'Silverado 1500',
    trim: 'LT',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVehicleImageByMake.mockReturnValue('https://example.com/car.jpg');
  });

  describe('without vehicleInfo', () => {
    it('renders placeholder message', () => {
      render(<VehicleImage vehicleInfo={null} />);
      expect(screen.getByText('Enter your VIN to see your vehicle')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<VehicleImage vehicleInfo={null} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('with vehicleInfo', () => {
    it('fetches image', async () => {
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        expect(mockGetVehicleImageByMake).toHaveBeenCalledWith(mockVehicle);
      });
    });

    it('displays image when loaded', async () => {
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        expect(screen.getByAltText('2021 CHEVROLET Silverado 1500')).toBeInTheDocument();
      });
    });

    it('shows vehicle info overlay', async () => {
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        const elements = screen.getAllByText('2021 CHEVROLET Silverado 1500');
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('shows trim when available', async () => {
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        expect(screen.getByText('LT')).toBeInTheDocument();
      });
    });

    it('handles error gracefully', async () => {
      mockGetVehicleImageByMake.mockReturnValue(null as unknown as string);
      
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        const elements = screen.getAllByText('2021 CHEVROLET Silverado 1500');
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('VehicleImageCompact', () => {
  const mockVehicle: VehicleInfo = {
    vin: '1GCVKNEC0MZ123456',
    year: 2021,
    make: 'CHEVROLET',
    model: 'Silverado 1500',
    trim: 'LT',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVehicleImageByMake.mockReturnValue('https://example.com/car.jpg');
  });

  it('returns null without vehicleInfo', () => {
    const { container } = render(<VehicleImageCompact vehicleInfo={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('fetches image with vehicleInfo', async () => {
    render(<VehicleImageCompact vehicleInfo={mockVehicle} />);
    
    await waitFor(() => {
      expect(mockGetVehicleImageByMake).toHaveBeenCalledWith(mockVehicle);
    });
  });

  it('displays year and make', async () => {
    render(<VehicleImageCompact vehicleInfo={mockVehicle} />);
    
    await waitFor(() => {
      expect(screen.getByText('2021 CHEVROLET')).toBeInTheDocument();
    });
  });

  it('displays model', async () => {
    render(<VehicleImageCompact vehicleInfo={mockVehicle} />);
    
    await waitFor(() => {
      expect(screen.getByText('Silverado 1500')).toBeInTheDocument();
    });
  });

  it('displays trim when available', async () => {
    render(<VehicleImageCompact vehicleInfo={mockVehicle} />);
    
    await waitFor(() => {
      expect(screen.getByText('LT')).toBeInTheDocument();
    });
  });
});
