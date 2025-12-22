'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import StepNavigation, { MobileProgress } from '@/components/StepNavigation';
import { VehicleImageCompact } from '@/components/VehicleImage';
import { useVehicle } from '@/context/VehicleContext';
import { CONDITION_OPTIONS, VehicleCondition } from '@/types/vehicle';

export default function ConditionPage() {
  const router = useRouter();
  const { vehicleInfo, condition, updateCondition } = useVehicle();

  const [formData, setFormData] = useState<Partial<VehicleCondition>>({
    accidentHistory: condition.accidentHistory || undefined,
    drivability: condition.drivability || undefined,
    mechanicalIssues: condition.mechanicalIssues || [],
    engineIssues: condition.engineIssues || [],
    exteriorDamage: condition.exteriorDamage || [],
    interiorDamage: condition.interiorDamage || [],
    technologyIssues: condition.technologyIssues || [],
    windshieldDamage: condition.windshieldDamage || undefined,
    tiresReplaced: condition.tiresReplaced || undefined,
    modifications: condition.modifications,
    smokedIn: condition.smokedIn,
    keys: condition.keys || undefined,
    overallCondition: condition.overallCondition || undefined,
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Redirect if no vehicle info
  useEffect(() => {
    if (!vehicleInfo) {
      router.push('/');
    }
  }, [vehicleInfo, router]);

  const toggleArrayItem = (field: keyof VehicleCondition, item: string) => {
    setFormData((prev) => {
      const current = (prev[field] as string[]) || [];
      
      // If selecting "none", clear other selections
      if (item === 'none') {
        return { ...prev, [field]: ['none'] };
      }
      
      // If selecting something else, remove "none"
      const filtered = current.filter((i) => i !== 'none');
      const updated = filtered.includes(item)
        ? filtered.filter((i) => i !== item)
        : [...filtered, item];
      
      return { ...prev, [field]: updated };
    });
  };

  const validate = () => {
    const missing: string[] = [];

    if (!formData.accidentHistory) missing.push('Accident history');
    if (!formData.drivability) missing.push('Drivability');
    if (!formData.mechanicalIssues?.length) missing.push('Mechanical issues');
    if (!formData.engineIssues?.length) missing.push('Engine issues');
    if (!formData.exteriorDamage?.length) missing.push('Exterior damage');
    if (!formData.interiorDamage?.length) missing.push('Interior damage');
    if (!formData.technologyIssues?.length) missing.push('Technology issues');
    if (!formData.windshieldDamage) missing.push('Windshield damage');
    if (!formData.tiresReplaced) missing.push('Tires replaced');
    if (formData.modifications === undefined) missing.push('Modifications');
    if (formData.smokedIn === undefined) missing.push('Smoked in');
    if (!formData.keys) missing.push('Number of keys');
    if (!formData.overallCondition) missing.push('Overall condition');

    setErrors(missing);
    return missing.length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    updateCondition(formData);
    router.push('/getoffer/offer');
  };

  if (!vehicleInfo) return null;

  return (
    <div className="min-h-screen bg-quirk-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <MobileProgress currentStep="condition" />

        <div className="flex gap-8">
          <StepNavigation currentStep="condition" completedSteps={['vehicle', 'basics', 'features']} />

          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
              <h1 className="text-2xl font-bold text-quirk-gray-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Condition & History
              </h1>
              <p className="text-quirk-gray-500 mb-8">
                Help us understand your vehicle&apos;s current condition
              </p>

              {/* Error summary */}
              {errors.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-medium mb-2">Please complete all required fields:</p>
                  <ul className="text-red-600 text-sm list-disc list-inside">
                    {errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vehicle Summary - Mobile */}
              <div className="lg:hidden mb-8">
                <VehicleImageCompact vehicleInfo={vehicleInfo} />
              </div>

              <div className="space-y-8">
                {/* Accident History */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Has this vehicle been in any accidents?
                  </h3>
                  <div className="flex gap-3">
                    {[
                      { value: 'none', label: 'No Accidents' },
                      { value: '1', label: '1 Accident' },
                      { value: '2+', label: '2+ Accidents' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, accidentHistory: option.value as VehicleCondition['accidentHistory'] })}
                        className={`condition-option ${formData.accidentHistory === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drivability */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Is the vehicle currently drivable?
                  </h3>
                  <div className="flex gap-3">
                    {[
                      { value: 'drivable', label: 'Yes, Drivable' },
                      { value: 'not-drivable', label: 'Not Drivable' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, drivability: option.value as VehicleCondition['drivability'] })}
                        className={`condition-option ${formData.drivability === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mechanical Issues */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Any mechanical or electrical issues? (Select all that apply)
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CONDITION_OPTIONS.mechanicalIssues.map((option) => {
                      const isSelected = formData.mechanicalIssues?.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleArrayItem('mechanicalIssues', option.id)}
                          className={`feature-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-quirk-red border-quirk-red' : 'border-quirk-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Engine Issues */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Any engine issues? (Select all that apply)
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CONDITION_OPTIONS.engineIssues.map((option) => {
                      const isSelected = formData.engineIssues?.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleArrayItem('engineIssues', option.id)}
                          className={`feature-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-quirk-red border-quirk-red' : 'border-quirk-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Exterior Damage */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Any exterior damage? (Select all that apply)
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CONDITION_OPTIONS.exteriorDamage.map((option) => {
                      const isSelected = formData.exteriorDamage?.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleArrayItem('exteriorDamage', option.id)}
                          className={`feature-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-quirk-red border-quirk-red' : 'border-quirk-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interior Damage */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Any interior damage? (Select all that apply)
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CONDITION_OPTIONS.interiorDamage.map((option) => {
                      const isSelected = formData.interiorDamage?.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleArrayItem('interiorDamage', option.id)}
                          className={`feature-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-quirk-red border-quirk-red' : 'border-quirk-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Technology Issues */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Any technology system issues? (Select all that apply)
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CONDITION_OPTIONS.technologyIssues.map((option) => {
                      const isSelected = formData.technologyIssues?.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleArrayItem('technologyIssues', option.id)}
                          className={`feature-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-quirk-red border-quirk-red' : 'border-quirk-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Windshield Damage */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Any windshield damage?
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { value: 'minor', label: 'Minor chips/pitting' },
                      { value: 'major', label: 'Major cracks/chips' },
                      { value: 'none', label: 'No damage' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, windshieldDamage: option.value as VehicleCondition['windshieldDamage'] })}
                        className={`condition-option ${formData.windshieldDamage === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tires Replaced */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Tires replaced in the last 12 months?
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { value: '1', label: '1 Tire' },
                      { value: '2', label: '2 Tires' },
                      { value: '3', label: '3 Tires' },
                      { value: '4', label: '4 Tires' },
                      { value: 'none', label: 'None' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, tiresReplaced: option.value as VehicleCondition['tiresReplaced'] })}
                        className={`condition-option ${formData.tiresReplaced === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modifications */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Does the vehicle have any modifications?
                  </h3>
                  <div className="flex gap-3">
                    {[
                      { value: true, label: 'Yes, Modified' },
                      { value: false, label: 'No Modifications' },
                    ].map((option) => (
                      <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => setFormData({ ...formData, modifications: option.value })}
                        className={`condition-option ${formData.modifications === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smoked In */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Has the vehicle been smoked in?
                  </h3>
                  <div className="flex gap-3">
                    {[
                      { value: true, label: 'Yes, Smoked In' },
                      { value: false, label: 'Not Smoked In' },
                    ].map((option) => (
                      <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => setFormData({ ...formData, smokedIn: option.value })}
                        className={`condition-option ${formData.smokedIn === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keys */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    How many keys do you have?
                  </h3>
                  <div className="flex gap-3">
                    {[
                      { value: '1', label: '1 Key' },
                      { value: '2+', label: '2+ Keys' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, keys: option.value as VehicleCondition['keys'] })}
                        className={`condition-option ${formData.keys === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Overall Condition */}
                <div>
                  <h3 className="text-sm font-semibold text-quirk-gray-700 mb-3">
                    Overall, how would you rate your vehicle&apos;s condition?
                  </h3>
                  <div className="grid sm:grid-cols-5 gap-3">
                    {[
                      { value: 'like-new', label: 'Like New', emoji: '✨' },
                      { value: 'pretty-great', label: 'Pretty Great', emoji: '👍' },
                      { value: 'just-okay', label: 'Just Okay', emoji: '👌' },
                      { value: 'kind-of-rough', label: 'Kind of Rough', emoji: '😬' },
                      { value: 'major-issues', label: 'Major Issues', emoji: '🔧' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, overallCondition: option.value as VehicleCondition['overallCondition'] })}
                        className={`flex flex-col items-center py-4 px-3 rounded-lg border-2 transition-all ${
                          formData.overallCondition === option.value
                            ? 'border-[#0070cc] bg-[#0070cc] text-white'
                            : 'border-quirk-gray-200 hover:border-quirk-gray-300 bg-white'
                        }`}
                      >
                        <span className="text-2xl mb-2">{option.emoji}</span>
                        <span className={`text-xs font-medium text-center ${
                          formData.overallCondition === option.value ? 'text-white' : 'text-quirk-gray-600'
                        }`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-10 pt-6 border-t border-quirk-gray-100">
                <button
                  onClick={() => router.push('/getoffer/features')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  className="btn-primary flex items-center gap-2"
                >
                  Get My Offer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Vehicle Summary */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <VehicleImageCompact vehicleInfo={vehicleInfo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
