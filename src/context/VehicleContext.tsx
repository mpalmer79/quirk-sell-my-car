'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  VehicleInfo,
  VehicleBasics,
  VehicleFeatures,
  VehicleCondition,
  OfferData,
} from '@/types/vehicle';

interface VehicleContextType {
  vehicleInfo: VehicleInfo | null;
  basics: Partial<VehicleBasics>;
  features: VehicleFeatures;
  condition: Partial<VehicleCondition>;
  offerData: OfferData | null;
  setVehicleInfo: (info: VehicleInfo) => void;
  updateBasics: (data: Partial<VehicleBasics>) => void;
  updateFeatures: (data: Partial<VehicleFeatures>) => void;
  updateCondition: (data: Partial<VehicleCondition>) => void;
  calculateOffer: () => OfferData | null;
  resetAll: () => void;
}

const defaultFeatures: VehicleFeatures = {
  entertainment: [],
  accessoryPackages: [],
  exterior: [],
  safetyAndSecurity: [],
  cargoAndTowing: [],
  wheelsAndTires: [],
  seats: [],
};

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [basics, setBasics] = useState<Partial<VehicleBasics>>({});
  const [features, setFeatures] = useState<VehicleFeatures>(defaultFeatures);
  const [condition, setCondition] = useState<Partial<VehicleCondition>>({});
  const [offerData, setOfferData] = useState<OfferData | null>(null);

  const updateBasics = useCallback((data: Partial<VehicleBasics>) => {
    setBasics((prev) => ({ ...prev, ...data }));
  }, []);

  const updateFeatures = useCallback((data: Partial<VehicleFeatures>) => {
    setFeatures((prev) => ({ ...prev, ...data }));
  }, []);

  const updateCondition = useCallback((data: Partial<VehicleCondition>) => {
    setCondition((prev) => ({ ...prev, ...data }));
  }, []);

  const calculateOffer = useCallback((): OfferData | null => {
    if (!vehicleInfo || !basics.mileage) return null;

    // ============================================================
    // DISCLAIMER: This is a PRELIMINARY ESTIMATE for demonstration.
    // Final offers are subject to in-person vehicle inspection.
    // Actual valuations require integration with:
    // - Black Book / KBB / NADA / Manheim market data
    // - Regional market conditions
    // - Vehicle history reports (Carfax/AutoCheck)
    // ============================================================

    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicleInfo.year;
    
    // Start with estimated base value based on vehicle type
    // In production: fetch from Black Book/KBB API
    let baseValue = 35000; // Default base for trucks/SUVs
    
    // Adjust base by body class
    if (vehicleInfo.bodyClass) {
      const bodyLower = vehicleInfo.bodyClass.toLowerCase();
      if (bodyLower.includes('sedan')) baseValue = 25000;
      else if (bodyLower.includes('coupe')) baseValue = 28000;
      else if (bodyLower.includes('pickup') || bodyLower.includes('truck')) baseValue = 38000;
      else if (bodyLower.includes('suv') || bodyLower.includes('utility')) baseValue = 35000;
      else if (bodyLower.includes('van')) baseValue = 30000;
    }
    
    // Adjust for age (roughly 10-15% depreciation per year)
    const ageDepreciation = Math.pow(0.88, vehicleAge);
    let adjustedValue = baseValue * ageDepreciation;
    
    // ============================================================
    // FIX: Mileage adjustment - HIGHER mileage LOWERS the offer
    // ============================================================
    // Average expected mileage: 12,000 miles per year
    const expectedMileage = vehicleAge * 12000;
    const mileageDiff = basics.mileage - expectedMileage;
    
    // $0.05 per mile over/under expected
    // Positive mileageDiff (more miles than expected) = REDUCE value
    // Negative mileageDiff (fewer miles than expected) = INCREASE value
    const mileageAdjustment = mileageDiff * 0.05;
    adjustedValue -= mileageAdjustment;
    
    // Add value for premium features ($250 per feature)
    const featureCount = Object.values(features).flat().filter(f => f && f !== 'none').length;
    adjustedValue += featureCount * 250;
    
    // Condition multipliers
    const conditionMultipliers: Record<string, number> = {
      'like-new': 1.1,
      'pretty-great': 1.0,
      'just-okay': 0.9,
      'kind-of-rough': 0.75,
      'major-issues': 0.5,
    };
    
    if (condition.overallCondition) {
      adjustedValue *= conditionMultipliers[condition.overallCondition] || 1;
    }
    
    // Accident history adjustment
    if (condition.accidentHistory === '1') {
      adjustedValue *= 0.9; // 10% reduction for 1 accident
    } else if (condition.accidentHistory === '2+') {
      adjustedValue *= 0.75; // 25% reduction for 2+ accidents
    }
    
    // Mechanical issues deduction
    const mechanicalIssues = condition.mechanicalIssues || [];
    if (mechanicalIssues.length > 0 && !mechanicalIssues.includes('none')) {
      adjustedValue -= mechanicalIssues.length * 500;
    }
    
    // Engine issues deduction
    const engineIssues = condition.engineIssues || [];
    if (engineIssues.length > 0 && !engineIssues.includes('none')) {
      adjustedValue -= engineIssues.length * 750;
    }
    
    // Drivability check
    if (condition.drivability === 'not-drivable') {
      adjustedValue *= 0.6; // 40% reduction if not drivable
    }
    
    // Ensure value doesn't go below minimum
    const finalOffer = Math.max(Math.round(adjustedValue / 100) * 100, 500);
    
    // Set expiry date (7 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    const offer: OfferData = {
      vehicleInfo,
      basics: basics as VehicleBasics,
      features,
      condition: condition as VehicleCondition,
      estimatedValue: Math.round(baseValue * ageDepreciation / 100) * 100,
      offerAmount: finalOffer,
      offerExpiry: expiryDate.toISOString(),
      isPreliminary: true,
    };
    
    setOfferData(offer);
    return offer;
  }, [vehicleInfo, basics, features, condition]);

  const resetAll = useCallback(() => {
    setVehicleInfo(null);
    setBasics({});
    setFeatures(defaultFeatures);
    setCondition({});
    setOfferData(null);
  }, []);

  return (
    <VehicleContext.Provider
      value={{
        vehicleInfo,
        basics,
        features,
        condition,
        offerData,
        setVehicleInfo,
        updateBasics,
        updateFeatures,
        updateCondition,
        calculateOffer,
        resetAll,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
}
