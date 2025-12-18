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
      const { result: highMileageHook } = renderHook(() => useVehicle(), { wrapper });
      const { result: lowMileageHook } = renderHook(() => useVehicle(), { wrapper });

      // Set up identical vehicles
      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020, // 5 years old, expected ~60k miles
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      let highMileageOffer = 0;
      let lowMileageOffer = 0;

      // High mileage vehicle (120k miles - double expected)
      act(() => {
        highMileageHook.current.setVehicleInfo(baseVehicle);
      });
      act(() => {
        highMileageHook.current.updateBasics({ mileage: 120000 });
      });
      act(() => {
        const offer = highMileageHook.current.calculateOffer();
        highMileageOffer = offer?.offerAmount || 0;
      });

      // Low mileage vehicle (30k miles - half expected)
      act(() => {
        lowMileageHook.current.setVehicleInfo(baseVehicle);
      });
      act(() => {
        lowMileageHook.current.updateBasics({ mileage: 30000 });
      });
      act(() => {
        const offer = lowMileageHook.current.calculateOffer();
        lowMileageOffer = offer?.offerAmount || 0;
      });

      // CRITICAL: Low mileage should be HIGHER than high mileage
      expect(lowMileageOffer).toBeGreaterThan(highMileageOffer);
      
      // The difference should be significant (at least $1000 for 90k mile difference)
      expect(lowMileageOffer - highMileageOffer).toBeGreaterThan(1000);
    });

    it('average mileage should produce middle-range offer', () => {
      const { result: avgHook } = renderHook(() => useVehicle(), { wrapper });
      const { result: highHook } = renderHook(() => useVehicle(), { wrapper });
      const { result: lowHook } = renderHook(() => useVehicle(), { wrapper });

      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020,
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      let avgOffer = 0;
      let highOffer = 0;
      let lowOffer = 0;

      // Average mileage (60k for 5-year-old)
      act(() => { avgHook.current.setVehicleInfo(baseVehicle); });
      act(() => { avgHook.current.updateBasics({ mileage: 60000 }); });
      act(() => { avgOffer = avgHook.current.calculateOffer()?.offerAmount || 0; });

      // High mileage (100k)
      act(() => { highHook.current.setVehicleInfo(baseVehicle); });
      act(() => { highHook.current.updateBasics({ mileage: 100000 }); });
      act(() => { highOffer = highHook.current.calculateOffer()?.offerAmount || 0; });

      // Low mileage (20k)
      act(() => { lowHook.current.setVehicleInfo(baseVehicle); });
      act(() => { lowHook.current.updateBasics({ mileage: 20000 }); });
      act(() => { lowOffer = lowHook.current.calculateOffer()?.offerAmount || 0; });

      // Average should be between high and low
      expect(avgOffer).toBeGreaterThan(highOffer);
      expect(avgOffer).toBeLessThan(lowOffer);
    });

    it('very high mileage (200k+) should still produce minimum offer', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      let offer = 0;

      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2015,
          make: 'CHEVROLET',
          model: 'Silverado',
        });
      });
      act(() => {
        result.current.updateBasics({ mileage: 250000 });
      });
      act(() => {
        offer = result.current.calculateOffer()?.offerAmount || 0;
      });

      // Should still get minimum $500 offer
      expect(offer).toBeGreaterThanOrEqual(500);
    });
  });

  describe('Condition Impact on Offer', () => {
    it('excellent condition should be worth MORE than poor condition', () => {
      const { result: excellentHook } = renderHook(() => useVehicle(), { wrapper });
      const { result: poorHook } = renderHook(() => useVehicle(), { wrapper });

      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020,
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      let excellentOffer = 0;
      let poorOffer = 0;

      act(() => { excellentHook.current.setVehicleInfo(baseVehicle); });
      act(() => { excellentHook.current.updateBasics({ mileage: 50000 }); });
      act(() => { excellentHook.current.updateCondition({ overallCondition: 'like-new' }); });
      act(() => { excellentOffer = excellentHook.current.calculateOffer()?.offerAmount || 0; });

      act(() => { poorHook.current.setVehicleInfo(baseVehicle); });
      act(() => { poorHook.current.updateBasics({ mileage: 50000 }); });
      act(() => { poorHook.current.updateCondition({ overallCondition: 'major-issues' }); });
      act(() => { poorOffer = poorHook.current.calculateOffer()?.offerAmount || 0; });

      expect(excellentOffer).toBeGreaterThan(poorOffer);
      // Should be at least 50% more for excellent vs major issues
      expect(excellentOffer).toBeGreaterThan(poorOffer * 1.5);
    });

    it('accident history should reduce offer', () => {
      const { result: noAccidentHook } = renderHook(() => useVehicle(), { wrapper });
      const { result: oneAccidentHook } = renderHook(() => useVehicle(), { wrapper });
      const { result: multiAccidentHook } = renderHook(() => useVehicle(), { wrapper });

      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020,
        make: 'CHEVROLET',
        model: 'Silverado',
      };
      const baseMileage = 50000;

      let cleanOffer = 0;
      let oneOffer = 0;
      let multiOffer = 0;

      act(() => { noAccidentHook.current.setVehicleInfo(baseVehicle); });
      act(() => { noAccidentHook.current.updateBasics({ mileage: baseMileage }); });
      act(() => { noAccidentHook.current.updateCondition({ accidentHistory: 'none' }); });
      act(() => { cleanOffer = noAccidentHook.current.calculateOffer()?.offerAmount || 0; });

      act(() => { oneAccidentHook.current.setVehicleInfo(baseVehicle); });
      act(() => { oneAccidentHook.current.updateBasics({ mileage: baseMileage }); });
      act(() => { oneAccidentHook.current.updateCondition({ accidentHistory: '1' }); });
      act(() => { oneOffer = oneAccidentHook.current.calculateOffer()?.offerAmount || 0; });

      act(() => { multiAccidentHook.current.setVehicleInfo(baseVehicle); });
      act(() => { multiAccidentHook.current.updateBasics({ mileage: baseMileage }); });
      act(() => { multiAccidentHook.current.updateCondition({ accidentHistory: '2+' }); });
      act(() => { multiOffer = multiAccidentHook.current.calculateOffer()?.offerAmount || 0; });

      // No accident should be highest
      expect(cleanOffer).toBeGreaterThan(oneOffer);
      expect(oneOffer).toBeGreaterThan(multiOffer);
      
      // Multiple accidents should significantly reduce offer
      expect(multiOffer).toBeLessThan(cleanOffer * 0.8);
    });
  });

  describe('Age Impact on Offer', () => {
    it('newer vehicles should be worth MORE than older vehicles', () => {
      const { result: newerHook } = renderHook(() => useVehicle(), { wrapper });
      const { result: olderHook } = renderHook(() => useVehicle(), { wrapper });

      let newerOffer = 0;
      let olderOffer = 0;

      // Use same mileage per year to isolate age effect
      act(() => {
        newerHook.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2023, // 2 years old
          make: 'CHEVROLET',
          model: 'Silverado',
        });
      });
      act(() => { newerHook.current.updateBasics({ mileage: 24000 }); }); // 12k/year
      act(() => { newerOffer = newerHook.current.calculateOffer()?.offerAmount || 0; });

      act(() => {
        olderHook.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ654321',
          year: 2015, // 10 years old
          make: 'CHEVROLET',
          model: 'Silverado',
        });
      });
      act(() => { olderHook.current.updateBasics({ mileage: 120000 }); }); // 12k/year
      act(() => { olderOffer = olderHook.current.calculateOffer()?.offerAmount || 0; });

      expect(newerOffer).toBeGreaterThan(olderOffer);
    });
  });

  describe('Feature Impact on Offer', () => {
    it('more features should increase offer', () => {
      const { result: basicHook } = renderHook(() => useVehicle(), { wrapper });
      const { result: loadedHook } = renderHook(() => useVehicle(), { wrapper });

      const baseVehicle = {
        vin: '1GCVKNEC0MZ123456',
        year: 2020,
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      let basicOffer = 0;
      let loadedOffer = 0;

      // Basic - no features
      act(() => { basicHook.current.setVehicleInfo(baseVehicle); });
      act(() => { basicHook.current.updateBasics({ mileage: 50000 }); });
      act(() => { basicOffer = basicHook.current.calculateOffer()?.offerAmount || 0; });

      // Loaded - many features
      act(() => { loadedHook.current.setVehicleInfo(baseVehicle); });
      act(() => { loadedHook.current.updateBasics({ mileage: 50000 }); });
      act(() => {
        loadedHook.current.updateFeatures({
          entertainment: ['navigation', 'premium-sound'],
          seats: ['leather', 'heated'],
          exterior: ['running-boards', 'tonneau-cover'],
          cargoAndTowing: ['towing-pkg', 'bed-liner'],
        });
      });
      act(() => { loadedOffer = loadedHook.current.calculateOffer()?.offerAmount || 0; });

      // Loaded should be higher
      expect(loadedOffer).toBeGreaterThan(basicOffer);
      // With 8 features at $250 each, should be ~$2000 more
      expect(loadedOffer - basicOffer).toBeGreaterThanOrEqual(1500);
    });
  });

  describe('Real-World Scenarios', () => {
    it('2021 truck with 45k miles, good condition should be reasonable', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      let offer = 0;

      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
          bodyClass: 'Pickup',
        });
      });
      act(() => { result.current.updateBasics({ mileage: 45000 }); });
      act(() => {
        result.current.updateCondition({
          overallCondition: 'pretty-great',
          accidentHistory: 'none',
        });
      });
      act(() => { offer = result.current.calculateOffer()?.offerAmount || 0; });

      // A 2021 truck in good condition should be worth $20k-$45k
      expect(offer).toBeGreaterThan(20000);
      expect(offer).toBeLessThan(45000);
    });

    it('high mileage beater should still get minimum offer', () => {
      const { result } = renderHook(() => useVehicle(), { wrapper });

      let offer = 0;

      act(() => {
        result.current.setVehicleInfo({
          vin: '1GCVKNEC0MZ123456',
          year: 2008,
          make: 'CHEVROLET',
          model: 'Impala',
          bodyClass: 'Sedan',
        });
      });
      act(() => { result.current.updateBasics({ mileage: 200000 }); });
      act(() => {
        result.current.updateCondition({
          overallCondition: 'kind-of-rough',
          accidentHistory: '2+',
          mechanicalIssues: ['transmission', 'ac'],
        });
      });
      act(() => { offer = result.current.calculateOffer()?.offerAmount || 0; });

      // Should still get minimum $500
      expect(offer).toBeGreaterThanOrEqual(500);
    });
  });
});
