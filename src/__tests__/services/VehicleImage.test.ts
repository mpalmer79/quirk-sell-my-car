import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VehicleImage, { VehicleImageCompact } from '@/components/VehicleImage';
import { VehicleInfo } from '@/types/vehicle';

jest.mock('@/services/vehicleImage', () => ({
  getVehicleImage: jest.fn(),
}));

import { getVehicleImage } from '@/services/vehicleImage';

const mockGetVehicleImage = getVehicleImage as jest.MockedFunction<typeof getVehicleImage>;

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
      mockGetVehicleImage.mockResolvedValueOnce('https://example.com/car.jpg');
      
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        expect(mockGetVehicleImage).toHaveBeenCalledWith(mockVehicle);
      });
    });

    it('displays image when loaded', async () => {
      mockGetVehicleImage.mockResolvedValueOnce('https://example.com/car.jpg');
      
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        expect(screen.getByAltText('2021 CHEVROLET Silverado 1500')).toBeInTheDocument();
      });
    });

    it('shows vehicle info overlay', async () => {
      mockGetVehicleImage.mockResolvedValueOnce('https://example.com/car.jpg');
      
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        // The trim is unique to the overlay
        expect(screen.getByText('LT')).toBeInTheDocument();
      });
    });

    it('shows trim when available', async () => {
      mockGetVehicleImage.mockResolvedValueOnce('https://example.com/car.jpg');
      
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        expect(screen.getByText('LT')).toBeInTheDocument();
      });
    });

    it('handles error gracefully', async () => {
      mockGetVehicleImage.mockRejectedValueOnce(new Error('Failed'));
      
      render(<VehicleImage vehicleInfo={mockVehicle} />);
      
      await waitFor(() => {
        // When image fails, the component still renders with vehicle info
        // Just check that the component rendered without crashing
        expect(screen.getByText('LT')).toBeInTheDocument();
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
  });

  it('returns null without vehicleInfo', () => {
    const { container } = render(<VehicleImageCompact vehicleInfo={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('fetches image with vehicleInfo', async () => {
    mockGetVehicleImage.mockResolvedValueOnce('https://example.com/car.jpg');
    
    render(<VehicleImageCompact vehicleInfo={mockVehicle} />);
    
    await waitFor(() => {
      expect(mockGetVehicleImage).toHaveBeenCalledWith(mockVehicle);
    });
  });

  it('displays year and make', async () => {
    mockGetVehicleImage.mockResolvedValueOnce('https://example.com/car.jpg');
    
    render(<VehicleImageCompact vehicleInfo={mockVehicle} />);
    
    await waitFor(() => {
      expect(screen.getByText('2021 CHEVROLET')).toBeInTheDocument();
    });
  });

  it('displays model', async () => {
    mockGetVehicleImage.mockResolvedValueOnce('https://example.com/car.jpg');
    
    render(<VehicleImageCompact vehicleInfo={mockVehicle} />);
    
    await waitFor(() => {
      expect(screen.getByText('Silverado 1500')).toBeInTheDocument();
    });
  });

  it('displays trim when available', async () => {
    mockGetVehicleImage.mockResolvedValueOnce('https://example.com/car.jpg');
    
    render(<VehicleImageCompact vehicleInfo={mockVehicle} />);
    
    await waitFor(() => {
      expect(screen.getByText('LT')).toBeInTheDocument();
    });
  });
});
