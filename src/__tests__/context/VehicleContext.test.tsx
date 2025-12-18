import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { VehicleProvider, useVehicle } from '@/context/VehicleContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <VehicleProvider>{children}</VehicleProvider>
);

describe('VehicleContext', () => {
  describe('useVehicle hook', () => {
    it('throws error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useVehicle());
      }).toThrow('useVehicle must be used within a VehicleProvider');
      
      consoleSpy.mockRestore();
    });

    it('provides initial state', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      expect(result.current.vehicleInfo).toBeNull();
      expect(result.current.basics).toEqual({});
      expect(result.current.condition).toEqual({});
      expect(result.current.offerData).toBeNull();
    });

    it('provides default features', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      expect(result.current.features).toEqual({
        entertainment: [],
        accessoryPackages: [],
        exterior: [],
        safetyAndSecurity: [],
        cargoAndTowing: [],
        wheelsAndTires: [],
        seats: [],
      });
    });
  });

  describe('setVehicleInfo', () => {
    it('updates vehicle info', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado',
        });
      });

      expect(result.current.vehicleInfo?.vin).toBe('1GCVKNEC0MZ123456');
      expect(result.current.vehicleInfo?.year).toBe(2021);
    });
  });

  describe('updateBasics', () => {
    it('updates basics with partial data', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateBasics({ mileage: 50000 });
      });

      expect(result.current.basics.mileage).toBe(50000);
    });

    it('merges updates', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateBasics({ mileage: 50000 });
      });
      
      act(() => {
        result.current.updateBasics({ zipCode: '03060' });
      });

      expect(result.current.basics.mileage).toBe(50000);
      expect(result.current.basics.zipCode).toBe('03060');
    });
  });

  describe('updateFeatures', () => {
    it('updates features', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateFeatures({ entertainment: ['navigation'] });
      });

      expect(result.current.features.entertainment).toEqual(['navigation']);
    });

    it('preserves other feature categories', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateFeatures({ entertainment: ['navigation'] });
      });
      
      act(() => {
        result.current.updateFeatures({ seats: ['leather'] });
      });

      expect(result.current.features.entertainment).toEqual(['navigation']);
      expect(result.current.features.seats).toEqual(['leather']);
    });
  });

  describe('updateCondition', () => {
    it('updates condition', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateCondition({ accidentHistory: 'none' });
      });

      expect(result.current.condition.accidentHistory).toBe('none');
    });
  });

  describe('calculateOffer', () => {
    it('returns null when vehicleInfo is missing', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      let offer;
      act(() => {
        offer = result.current.calculateOffer();
      });

      expect(offer).toBeNull();
    });

    it('returns null when mileage is missing', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '123',
          year: 2021,
          make: 'CHEVY',
          model: 'Silverado',
        });
      });

      let offer;
      act(() => {
        offer = result.current.calculateOffer();
      });

      expect(offer).toBeNull();
    });

    it('calculates offer with valid data', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      // Set up state first
      act(() => {
        result.current.setVehicleInfo({
          vin: '123',
          year: 2021,
          make: 'CHEVY',
          model: 'Silverado',
        });
      });
      
      act(() => {
        result.current.updateBasics({ mileage: 50000 });
      });

      // Now calculate offer
      let offer;
      act(() => {
        offer = result.current.calculateOffer();
      });

      expect(offer).not.toBeNull();
      expect(offer?.offerAmount).toBeGreaterThan(0);
    });

    it('stores offer in context after calculation', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      // Set up all required state
      act(() => {
        result.current.setVehicleInfo({
          vin: '123',
          year: 2021,
          make: 'CHEVY',
          model: 'Silverado',
        });
      });
      
      act(() => {
        result.current.updateBasics({ mileage: 50000 });
      });

      // Calculate offer and check it's stored
      act(() => {
        result.current.calculateOffer();
      });

      // After act completes, offerData should be set
      expect(result.current.offerData).not.toBeNull();
      expect(result.current.offerData?.offerAmount).toBeGreaterThan(0);
    });

    it('sets expiry date 7 days in future', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '123',
          year: 2021,
          make: 'CHEVY',
          model: 'Silverado',
        });
      });
      
      act(() => {
        result.current.updateBasics({ mileage: 50000 });
      });
      
      act(() => {
        result.current.calculateOffer();
      });

      expect(result.current.offerData).not.toBeNull();
      const expiry = new Date(result.current.offerData!.offerExpiry!);
      const now = new Date();
      const diff = Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(diff).toBe(7);
    });

    it('has minimum offer of $500', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '123',
          year: 1990,
          make: 'OLD',
          model: 'Car',
        });
      });
      
      act(() => {
        result.current.updateBasics({ mileage: 500000 });
      });
      
      act(() => {
        result.current.updateCondition({ 
          overallCondition: 'major-issues',
          accidentHistory: '2+',
        });
      });
      
      act(() => {
        result.current.calculateOffer();
      });

      expect(result.current.offerData).not.toBeNull();
      expect(result.current.offerData?.offerAmount).toBeGreaterThanOrEqual(500);
    });
  });

  describe('resetAll', () => {
    it('resets all state', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '123',
          year: 2021,
          make: 'CHEVY',
          model: 'Silverado',
        });
      });
      
      act(() => {
        result.current.updateBasics({ mileage: 50000 });
      });
      
      act(() => {
        result.current.updateFeatures({ entertainment: ['nav'] });
      });
      
      act(() => {
        result.current.updateCondition({ accidentHistory: 'none' });
      });

      act(() => {
        result.current.resetAll();
      });

      expect(result.current.vehicleInfo).toBeNull();
      expect(result.current.basics).toEqual({});
      expect(result.current.condition).toEqual({});
      expect(result.current.offerData).toBeNull();
    });
  });
});
