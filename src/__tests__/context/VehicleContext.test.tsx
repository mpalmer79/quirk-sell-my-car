import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { VehicleProvider, useVehicle } from '@/context/VehicleContext';
import { VehicleInfo, VehicleBasics, VehicleFeatures, VehicleCondition } from '@/types/vehicle';

// Wrapper component for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <VehicleProvider>{children}</VehicleProvider>
);

describe('VehicleContext', () => {
  describe('useVehicle hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useVehicle());
      }).toThrow('useVehicle must be used within a VehicleProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide initial empty state', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      expect(result.current.vehicleInfo).toBeNull();
      expect(result.current.basics).toEqual({});
      expect(result.current.features).toEqual({
        entertainment: [],
        accessoryPackages: [],
        exterior: [],
        safetyAndSecurity: [],
        cargoAndTowing: [],
        wheelsAndTires: [],
        seats: [],
      });
      expect(result.current.condition).toEqual({});
      expect(result.current.offerData).toBeNull();
    });
  });

  describe('setVehicleInfo', () => {
    it('should update vehicle info', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      const vehicleInfo: VehicleInfo = {
        vin: '1GCVKNEC0MZ123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado 1500',
        trim: 'LT',
        bodyClass: 'Pickup',
      };

      act(() => {
        result.current.setVehicleInfo(vehicleInfo);
      });

      expect(result.current.vehicleInfo).toEqual(vehicleInfo);
    });
  });

  describe('updateBasics', () => {
    it('should update basics with partial data', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateBasics({ mileage: 50000 });
      });

      expect(result.current.basics.mileage).toBe(50000);
    });

    it('should merge new data with existing basics', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateBasics({ mileage: 50000, zipCode: '03060' });
      });

      act(() => {
        result.current.updateBasics({ color: 'Black' });
      });

      expect(result.current.basics).toEqual({
        mileage: 50000,
        zipCode: '03060',
        color: 'Black',
      });
    });

    it('should override existing values', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateBasics({ mileage: 50000 });
      });

      act(() => {
        result.current.updateBasics({ mileage: 60000 });
      });

      expect(result.current.basics.mileage).toBe(60000);
    });
  });

  describe('updateFeatures', () => {
    it('should update features with partial data', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateFeatures({ entertainment: ['navigation', 'premium-sound'] });
      });

      expect(result.current.features.entertainment).toEqual(['navigation', 'premium-sound']);
    });

    it('should preserve other feature categories when updating one', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateFeatures({ 
          entertainment: ['navigation'],
          seats: ['leather'],
        });
      });

      act(() => {
        result.current.updateFeatures({ wheelsAndTires: ['premium-wheels'] });
      });

      expect(result.current.features.entertainment).toEqual(['navigation']);
      expect(result.current.features.seats).toEqual(['leather']);
      expect(result.current.features.wheelsAndTires).toEqual(['premium-wheels']);
    });
  });

  describe('updateCondition', () => {
    it('should update condition with partial data', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateCondition({ 
          accidentHistory: 'none',
          drivability: 'drivable',
        });
      });

      expect(result.current.condition.accidentHistory).toBe('none');
      expect(result.current.condition.drivability).toBe('drivable');
    });

    it('should merge condition updates', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateCondition({ accidentHistory: 'none' });
      });

      act(() => {
        result.current.updateCondition({ overallCondition: 'pretty-great' });
      });

      expect(result.current.condition).toEqual({
        accidentHistory: 'none',
        overallCondition: 'pretty-great',
      });
    });
  });

  describe('calculateOffer', () => {
    const setupForOffer = (hook: { current: ReturnType<typeof useVehicle> }) => {
      act(() => {
        hook.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
        });
        hook.current.updateBasics({
          mileage: 50000,
          zipCode: '03060',
          color: 'Black',
          transmission: 'Automatic',
          drivetrain: '4WD',
          engine: 'V8',
          sellOrTrade: 'sell',
          loanOrLease: 'neither',
        });
        hook.current.updateFeatures({
          entertainment: ['navigation'],
          seats: ['leather'],
        });
        hook.current.updateCondition({
          accidentHistory: 'none',
          drivability: 'drivable',
          mechanicalIssues: ['none'],
          engineIssues: ['none'],
          exteriorDamage: ['none'],
          interiorDamage: ['none'],
          technologyIssues: ['none'],
          windshieldDamage: 'none',
          tiresReplaced: '4',
          modifications: false,
          smokedIn: false,
          keys: '2+',
          overallCondition: 'pretty-great',
        });
      });
    };

    it('should return null when vehicleInfo is missing', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.updateBasics({ mileage: 50000 });
      });

      let offer;
      act(() => {
        offer = result.current.calculateOffer();
      });

      expect(offer).toBeNull();
    });

    it('should return null when mileage is missing', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
        });
      });

      let offer;
      act(() => {
        offer = result.current.calculateOffer();
      });

      expect(offer).toBeNull();
    });

    it('should calculate offer with valid data', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });
      setupForOffer(result);

      let offer;
      act(() => {
        offer = result.current.calculateOffer();
      });

      expect(offer).not.toBeNull();
      expect(offer?.offerAmount).toBeGreaterThan(0);
      expect(offer?.vehicleInfo.vin).toBe('1GCVKNEC0MZ123456');
    });

    it('should set offer expiry to 7 days from now', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });
      setupForOffer(result);

      let offer;
      act(() => {
        offer = result.current.calculateOffer();
      });

      const expiryDate = new Date(offer!.offerExpiry!);
      const now = new Date();
      const daysDiff = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBe(7);
    });

    it('should reduce value for accidents', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });
      setupForOffer(result);

      let noAccidentOffer: number;
      act(() => {
        noAccidentOffer = result.current.calculateOffer()?.offerAmount || 0;
      });

      act(() => {
        result.current.updateCondition({ accidentHistory: '1' });
      });

      let oneAccidentOffer: number;
      act(() => {
        oneAccidentOffer = result.current.calculateOffer()?.offerAmount || 0;
      });

      expect(oneAccidentOffer).toBeLessThan(noAccidentOffer!);
    });

    it('should reduce value more for multiple accidents', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });
      setupForOffer(result);

      act(() => {
        result.current.updateCondition({ accidentHistory: '1' });
      });

      let oneAccidentOffer: number;
      act(() => {
        oneAccidentOffer = result.current.calculateOffer()?.offerAmount || 0;
      });

      act(() => {
        result.current.updateCondition({ accidentHistory: '2+' });
      });

      let multipleAccidentsOffer: number;
      act(() => {
        multipleAccidentsOffer = result.current.calculateOffer()?.offerAmount || 0;
      });

      expect(multipleAccidentsOffer).toBeLessThan(oneAccidentOffer!);
    });

    it('should increase value for premium features', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });
      setupForOffer(result);

      // First with minimal features
      act(() => {
        result.current.updateFeatures({
          entertainment: [],
          accessoryPackages: [],
          exterior: [],
          safetyAndSecurity: [],
          cargoAndTowing: [],
          wheelsAndTires: [],
          seats: [],
        });
      });

      let noFeaturesOffer: number;
      act(() => {
        noFeaturesOffer = result.current.calculateOffer()?.offerAmount || 0;
      });

      // Then with many features
      act(() => {
        result.current.updateFeatures({
          entertainment: ['navigation', 'premium-sound'],
          seats: ['leather'],
          wheelsAndTires: ['premium-wheels'],
          safetyAndSecurity: ['lane-departure'],
        });
      });

      let withFeaturesOffer: number;
      act(() => {
        withFeaturesOffer = result.current.calculateOffer()?.offerAmount || 0;
      });

      expect(withFeaturesOffer).toBeGreaterThan(noFeaturesOffer!);
    });

    it('should adjust value based on overall condition', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });
      setupForOffer(result);

      act(() => {
        result.current.updateCondition({ overallCondition: 'like-new' });
      });

      let likeNewOffer: number;
      act(() => {
        likeNewOffer = result.current.calculateOffer()?.offerAmount || 0;
      });

      act(() => {
        result.current.updateCondition({ overallCondition: 'major-issues' });
      });

      let majorIssuesOffer: number;
      act(() => {
        majorIssuesOffer = result.current.calculateOffer()?.offerAmount || 0;
      });

      expect(likeNewOffer).toBeGreaterThan(majorIssuesOffer!);
    });

    it('should have minimum offer of $500', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 1990, // Old vehicle
          make: 'CHEVROLET',
          model: 'Silverado',
        });
        result.current.updateBasics({
          mileage: 500000, // Very high mileage
          zipCode: '03060',
          sellOrTrade: 'sell',
          loanOrLease: 'neither',
        } as Partial<VehicleBasics>);
        result.current.updateCondition({
          accidentHistory: '2+',
          overallCondition: 'major-issues',
        });
      });

      let offer;
      act(() => {
        offer = result.current.calculateOffer();
      });

      expect(offer?.offerAmount).toBeGreaterThanOrEqual(500);
    });

    it('should store offer in context after calculation', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });
      setupForOffer(result);

      expect(result.current.offerData).toBeNull();

      act(() => {
        result.current.calculateOffer();
      });

      expect(result.current.offerData).not.toBeNull();
    });
  });

  describe('resetAll', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      // Setup some state
      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
        });
        result.current.updateBasics({ mileage: 50000 });
        result.current.updateFeatures({ entertainment: ['navigation'] });
        result.current.updateCondition({ accidentHistory: 'none' });
      });

      // Reset
      act(() => {
        result.current.resetAll();
      });

      expect(result.current.vehicleInfo).toBeNull();
      expect(result.current.basics).toEqual({});
      expect(result.current.features).toEqual({
        entertainment: [],
        accessoryPackages: [],
        exterior: [],
        safetyAndSecurity: [],
        cargoAndTowing: [],
        wheelsAndTires: [],
        seats: [],
      });
      expect(result.current.condition).toEqual({});
      expect(result.current.offerData).toBeNull();
    });
  });
});
