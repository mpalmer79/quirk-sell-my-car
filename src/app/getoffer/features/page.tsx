
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import StepNavigation, { MobileProgress } from '@/components/StepNavigation';
import { VehicleImageCompact } from '@/components/VehicleImage';
import { useVehicle } from '@/context/VehicleContext';
import { FEATURE_OPTIONS } from '@/types/vehicle';

interface FeatureCategory {
  id: keyof typeof FEATURE_OPTIONS;
  title: string;
  options: { id: string; label: string }[];
}

const CATEGORIES: FeatureCategory[] = [
  { id: 'entertainment', title: 'Entertainment & Instrumentation', options: FEATURE_OPTIONS.entertainment },
  { id: 'accessoryPackages', title: 'Accessory Packages', options: FEATURE_OPTIONS.accessoryPackages },
  { id: 'exterior', title: 'Exterior', options: FEATURE_OPTIONS.exterior },
  { id: 'safetyAndSecurity', title: 'Safety & Security', options: FEATURE_OPTIONS.safetyAndSecurity },
  { id: 'cargoAndTowing', title: 'Cargo & Towing', options: FEATURE_OPTIONS.cargoAndTowing },
  { id: 'wheelsAndTires', title: 'Wheels & Tires', options: FEATURE_OPTIONS.wheelsAndTires },
  { id: 'seats', title: 'Seats', options: FEATURE_OPTIONS.seats },
];

export default function FeaturesPage() {
  const router = useRouter();
  const { vehicleInfo, features, updateFeatures } = useVehicle();

  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({
    entertainment: features.entertainment || [],
    accessoryPackages: features.accessoryPackages || [],
    exterior: features.exterior || [],
    safetyAndSecurity: features.safetyAndSecurity || [],
    cargoAndTowing: features.cargoAndTowing || [],
    wheelsAndTires: features.wheelsAndTires || [],
    seats: features.seats || [],
  });

  // Redirect if no vehicle info
  useEffect(() => {
    if (!vehicleInfo) {
      router.push('/');
    }
  }, [vehicleInfo, router]);

  const toggleFeature = (categoryId: string, featureId: string) => {
    setSelectedFeatures((prev) => {
      const current = prev[categoryId] || [];
      const updated = current.includes(featureId)
        ? current.filter((id) => id !== featureId)
        : [...current, featureId];
      return { ...prev, [categoryId]: updated };
    });
  };

  const handleContinue = () => {
    updateFeatures({
      entertainment: selectedFeatures.entertainment,
      accessoryPackages: selectedFeatures.accessoryPackages,
      exterior: selectedFeatures.exterior,
      safetyAndSecurity: selectedFeatures.safetyAndSecurity,
      cargoAndTowing: selectedFeatures.cargoAndTowing,
      wheelsAndTires: selectedFeatures.wheelsAndTires,
      seats: selectedFeatures.seats,
    });

    router.push('/getoffer/condition');
  };

  const totalSelected = Object.values(selectedFeatures).flat().length;

  if (!vehicleInfo) return null;

  return (
    <div className="min-h-screen bg-quirk-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <MobileProgress currentStep="features" />

        <div className="flex gap-8">
          <StepNavigation currentStep="features" completedSteps={['vehicle', 'basics']} />

          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-quirk-gray-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    Vehicle Features
                  </h1>
                  <p className="text-quirk-gray-500">
                    Select any optional features installed on your vehicle
                  </p>
                </div>
                {totalSelected > 0 && (
                  <div className="bg-quirk-red/10 text-quirk-red px-3 py-1 rounded-full text-sm font-medium">
                    {totalSelected} selected
                  </div>
                )}
              </div>

              {/* Vehicle Summary - Mobile */}
              <div className="lg:hidden mb-8">
                <VehicleImageCompact vehicleInfo={vehicleInfo} />
              </div>

              <div className="space-y-8">
                {CATEGORIES.map((category) => (
                  <div key={category.id}>
                    <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3 uppercase tracking-wider">
                      {category.title}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.options.map((option) => {
                        const isSelected = selectedFeatures[category.id]?.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleFeature(category.id, option.id)}
                            className={`feature-card ${isSelected ? 'selected' : ''}`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-quirk-red border-quirk-red'
                                : 'border-quirk-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Info note */}
              <div className="mt-8 bg-quirk-gray-50 rounded-lg p-4">
                <p className="text-sm text-quirk-gray-500">
                  <strong>Tip:</strong> Only select features that were added as options when the vehicle was purchased. 
                  Standard features are already included in our valuation.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-10 pt-6 border-t border-quirk-gray-100">
                <button
                  onClick={() => router.push('/getoffer/basics')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  className="btn-primary flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Vehicle Summary */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <VehicleImageCompact vehicleInfo={vehicleInfo} />
              
              {/* Selected features summary */}
              {totalSelected > 0 && (
                <div className="mt-4 bg-white rounded-lg border border-quirk-gray-200 p-4">
                  <h4 className="text-sm font-semibold text-quirk-gray-700 mb-2">
                    Selected Features
                  </h4>
                  <ul className="space-y-1">
                    {CATEGORIES.flatMap((cat) =>
                      selectedFeatures[cat.id]?.map((featureId) => {
                        const feature = cat.options.find((o) => o.id === featureId);
                        return feature ? (
                          <li key={featureId} className="text-xs text-quirk-gray-500 flex items-center gap-1">
                            <Check className="w-3 h-3 text-quirk-green" />
                            {feature.label}
                          </li>
                        ) : null;
                      })
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
