/**
 * Valuation Sanity Tests
 * Ensures offer calculations behave correctly in real scenarios
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { VehicleProvider, useVehicle } from '@/context/VehicleContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <VehicleProvider>{children}</VehicleProvider>
);

describe('Valuation Sanity Tests', () => {
  describe('Mileage Impact on Offer', () => {
    it('HIGH mileage should LOWER the offer', () => {
      const { result: highMileage } = renderHook(() => useVehicle(), { wrapper });
      const { result: lowMileage } = renderHook(() => useVehicle(), { wrapper });

      // Set up identical vehicles
      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020, // 5 years old, expected ~60k miles
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      // High mileage vehicle (120k miles - double expected)
      act(() => {
        highMileage.current.setVehicleInfo(baseVehicle);
        highMileage.current.updateBasics({ mileage: 120000 });
        highMileage.current.calculateOffer();
      });

      // Low mileage vehicle (30k miles - half expected)
      act(() => {
        lowMileage.current.setVehicleInfo(baseVehicle);
        lowMileage.current.updateBasics({ mileage: 30000 });
        lowMileage.current.calculateOffer();
      });

      const highMileageOffer = highMileage.current.offerData?.offerAmount || 0;
      const lowMileageOffer = lowMileage.current.offerData?.offerAmount || 0;

      // CRITICAL: Low mileage should be HIGHER than high mileage
      expect(lowMileageOffer).toBeGreaterThan(highMileageOffer);
      
      // The difference should be significant (at least $1000 for 90k mile difference)
      expect(lowMileageOffer - highMileageOffer).toBeGreaterThan(1000);
    });

    it('average mileage should produce middle-range offer', () => {
      const { result: avgMileage } = renderHook(() => useVehicle(), { wrapper });
      const { result: highMileage } = renderHook(() => useVehicle(), { wrapper });
      const { result: lowMileage } = renderHook(() => useVehicle(), { wrapper });

      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020,
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      // Average mileage (60k for 5-year-old)
      act(() => {
        avgMileage.current.setVehicleInfo(baseVehicle);
        avgMileage.current.updateBasics({ mileage: 60000 });
        avgMileage.current.calculateOffer();
      });

      // High mileage (100k)
      act(() => {
        highMileage.current.setVehicleInfo(baseVehicle);
        highMileage.current.updateBasics({ mileage: 100000 });
        highMileage.current.calculateOffer();
      });

      // Low mileage (20k)
      act(() => {
        lowMileage.current.setVehicleInfo(baseVehicle);
        lowMileage.current.updateBasics({ mileage: 20000 });
        lowMileage.current.calculateOffer();
      });

      const avg = avgMileage.current.offerData?.offerAmount || 0;
      const high = highMileage.current.offerData?.offerAmount || 0;
      const low = lowMileage.current.offerData?.offerAmount || 0;

      // Average should be between high and low
      expect(avg).toBeGreaterThan(high);
      expect(avg).toBeLessThan(low);
    });

    it('very high mileage (200k+) should still produce minimum offer', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2015,
          make: 'CHEVROLET',
          model: 'Silverado',
        });
        result.current.updateBasics({ mileage: 250000 });
        result.current.calculateOffer();
      });

      // Should still get minimum $500 offer
      expect(result.current.offerData?.offerAmount).toBeGreaterThanOrEqual(500);
    });
  });

  describe('Condition Impact on Offer', () => {
    it('excellent condition should be worth MORE than poor condition', () => {
      const { result: excellent } = renderHook(() => useVehicle(), { wrapper });
      const { result: poor } = renderHook(() => useVehicle(), { wrapper });

      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020,
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      act(() => {
        excellent.current.setVehicleInfo(baseVehicle);
        excellent.current.updateBasics({ mileage: 50000 });
        excellent.current.updateCondition({ overallCondition: 'like-new' });
        excellent.current.calculateOffer();
      });

      act(() => {
        poor.current.setVehicleInfo(baseVehicle);
        poor.current.updateBasics({ mileage: 50000 });
        poor.current.updateCondition({ overallCondition: 'major-issues' });
        poor.current.calculateOffer();
      });

      const excellentOffer = excellent.current.offerData?.offerAmount || 0;
      const poorOffer = poor.current.offerData?.offerAmount || 0;

      expect(excellentOffer).toBeGreaterThan(poorOffer);
      // Should be at least 50% more for excellent vs major issues
      expect(excellentOffer).toBeGreaterThan(poorOffer * 1.5);
    });

    it('accident history should reduce offer', () => {
      const { result: noAccident } = renderHook(() => useVehicle(), { wrapper });
      const { result: oneAccident } = renderHook(() => useVehicle(), { wrapper });
      const { result: multiAccident } = renderHook(() => useVehicle(), { wrapper });

      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020,
        make: 'CHEVROLET',
        model: 'Silverado',
      };
      const baseMileage = 50000;

      act(() => {
        noAccident.current.setVehicleInfo(baseVehicle);
        noAccident.current.updateBasics({ mileage: baseMileage });
        noAccident.current.updateCondition({ accidentHistory: 'none' });
        noAccident.current.calculateOffer();
      });

      act(() => {
        oneAccident.current.setVehicleInfo(baseVehicle);
        oneAccident.current.updateBasics({ mileage: baseMileage });
        oneAccident.current.updateCondition({ accidentHistory: '1' });
        oneAccident.current.calculateOffer();
      });

      act(() => {
        multiAccident.current.setVehicleInfo(baseVehicle);
        multiAccident.current.updateBasics({ mileage: baseMileage });
        multiAccident.current.updateCondition({ accidentHistory: '2+' });
        multiAccident.current.calculateOffer();
      });

      const clean = noAccident.current.offerData?.offerAmount || 0;
      const one = oneAccident.current.offerData?.offerAmount || 0;
      const multi = multiAccident.current.offerData?.offerAmount || 0;

      // No accident should be highest
      expect(clean).toBeGreaterThan(one);
      expect(one).toBeGreaterThan(multi);
      
      // Multiple accidents should significantly reduce offer
      expect(multi).toBeLessThan(clean * 0.8);
    });
  });

  describe('Age Impact on Offer', () => {
    it('newer vehicles should be worth MORE than older vehicles', () => {
      const { result: newer } = renderHook(() => useVehicle(), { wrapper });
      const { result: older } = renderHook(() => useVehicle(), { wrapper });

      // Use same mileage per year to isolate age effect
      act(() => {
        newer.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2023, // 2 years old
          make: 'CHEVROLET',
          model: 'Silverado',
        });
        newer.current.updateBasics({ mileage: 24000 }); // 12k/year
        newer.current.calculateOffer();
      });

      act(() => {
        older.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ654321',
          year: 2015, // 10 years old
          make: 'CHEVROLET',
          model: 'Silverado',
        });
        older.current.updateBasics({ mileage: 120000 }); // 12k/year
        older.current.calculateOffer();
      });

      const newerOffer = newer.current.offerData?.offerAmount || 0;
      const olderOffer = older.current.offerData?.offerAmount || 0;

      expect(newerOffer).toBeGreaterThan(olderOffer);
    });
  });

  describe('Feature Impact on Offer', () => {
    it('more features should increase offer', () => {
      const { result: basic } = renderHook(() => useVehicle(), { wrapper });
      const { result: loaded } = renderHook(() => useVehicle(), { wrapper });

      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020,
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      // Basic - no features
      act(() => {
        basic.current.setVehicleInfo(baseVehicle);
        basic.current.updateBasics({ mileage: 50000 });
        basic.current.calculateOffer();
      });

      // Loaded - many features
      act(() => {
        loaded.current.setVehicleInfo(baseVehicle);
        loaded.current.updateBasics({ mileage: 50000 });
        loaded.current.updateFeatures({
          entertainment: ['navigation', 'premium-sound'],
          seats: ['leather', 'heated'],
          exterior: ['running-boards', 'tonneau-cover'],
          cargoAndTowing: ['towing-pkg', 'bed-liner'],
        });
        loaded.current.calculateOffer();
      });

      const basicOffer = basic.current.offerData?.offerAmount || 0;
      const loadedOffer = loaded.current.offerData?.offerAmount || 0;

      // Loaded should be higher
      expect(loadedOffer).toBeGreaterThan(basicOffer);
      // With 8 features at $250 each, should be ~$2000 more
      expect(loadedOffer - basicOffer).toBeGreaterThanOrEqual(1500);
    });
  });

  describe('Real-World Scenarios', () => {
    it('2021 truck with 45k miles, good condition should be reasonable', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
          bodyClass: 'Pickup',
        });
        result.current.updateBasics({ mileage: 45000 });
        result.current.updateCondition({
          overallCondition: 'pretty-great',
          accidentHistory: 'none',
        });
        result.current.calculateOffer();
      });

      const offer = result.current.offerData?.offerAmount || 0;

      // A 2021 truck in good condition should be worth $20k-$35k
      expect(offer).toBeGreaterThan(20000);
      expect(offer).toBeLessThan(40000);
    });

    it('high mileage beater should still get minimum offer', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2008,
          make: 'CHEVROLET',
          model: 'Impala',
          bodyClass: 'Sedan',
        });
        result.current.updateBasics({ mileage: 200000 });
        result.current.updateCondition({
          overallCondition: 'kind-of-rough',
          accidentHistory: '2+',
          mechanicalIssues: ['transmission', 'ac'],
        });
        result.current.calculateOffer();
      });

      const offer = result.current.offerData?.offerAmount || 0;

      // Should still get minimum $500
      expect(offer).toBeGreaterThanOrEqual(500);
    });
  });
});
