
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

    // Base value calculation (simplified - in production, use actual valuation API)
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicleInfo.year;
    
    // Start with estimated base value based on vehicle type
    let baseValue = 35000; // Default base for trucks/SUVs
    
    // Adjust for age (roughly 10-15% depreciation per year)
    const ageDepreciation = Math.pow(0.88, vehicleAge);
    let adjustedValue = baseValue * ageDepreciation;
    
    // Adjust for mileage (average 12k miles/year)
    const expectedMileage = vehicleAge * 12000;
    const mileageDiff = basics.mileage - expectedMileage;
    const mileageAdjustment = mileageDiff * -0.05; // $0.05 per mile over/under
    adjustedValue -= mileageAdjustment;
    
    // Add value for premium features
    const featureCount = Object.values(features).flat().length;
    adjustedValue += featureCount * 250; // $250 per feature
    
    // Condition adjustments
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
      adjustedValue *= 0.9;
    } else if (condition.accidentHistory === '2+') {
      adjustedValue *= 0.75;
    }
    
    // Round to nearest $100
    const finalOffer = Math.round(adjustedValue / 100) * 100;
    
    // Set expiry date (7 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    const offer: OfferData = {
      vehicleInfo,
      basics: basics as VehicleBasics,
      features,
      condition: condition as VehicleCondition,
      estimatedValue: Math.round(baseValue * ageDepreciation / 100) * 100,
      offerAmount: Math.max(finalOffer, 500), // Minimum $500 offer
      offerExpiry: expiryDate.toISOString(),
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
