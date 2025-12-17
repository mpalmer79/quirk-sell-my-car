
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import StepNavigation, { MobileProgress } from '@/components/StepNavigation';
import { VehicleImageCompact } from '@/components/VehicleImage';
import { useVehicle } from '@/context/VehicleContext';
import { VEHICLE_COLORS } from '@/types/vehicle';

const TRANSMISSIONS = [
  'Automatic',
  'Manual',
  'CVT',
  'Automatic, 6-Speed',
  'Automatic, 8-Speed',
  'Automatic, 10-Speed',
];

const DRIVETRAINS = [
  'Front Wheel Drive (FWD)',
  'Rear Wheel Drive (RWD)',
  '4WD / 4x4',
  'All Wheel Drive (AWD)',
];

const ENGINES = [
  '4-Cylinder',
  '4-Cylinder Turbo',
  'V6',
  'V6 Turbo',
  'V8',
  'V8 Turbo',
  '4-Cylinder Diesel',
  'V6 Diesel',
  'Hybrid',
  'Electric',
];

export default function BasicsPage() {
  const router = useRouter();
  const { vehicleInfo, basics, updateBasics } = useVehicle();

  const [mileage, setMileage] = useState(basics.mileage?.toString() || '');
  const [zipCode, setZipCode] = useState(basics.zipCode || '');
  const [color, setColor] = useState(basics.color || '');
  const [transmission, setTransmission] = useState(basics.transmission || '');
  const [drivetrain, setDrivetrain] = useState(basics.drivetrain || '');
  const [engine, setEngine] = useState(basics.engine || '');
  const [sellOrTrade, setSellOrTrade] = useState<'sell' | 'trade' | 'not-sure' | ''>(basics.sellOrTrade || '');
  const [loanOrLease, setLoanOrLease] = useState<'loan' | 'lease' | 'neither' | ''>(basics.loanOrLease || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if no vehicle info
  useEffect(() => {
    if (!vehicleInfo) {
      router.push('/');
    }
  }, [vehicleInfo, router]);

  // Format mileage with commas
  const handleMileageChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = numbers ? parseInt(numbers, 10).toLocaleString() : '';
    setMileage(formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!mileage) newErrors.mileage = 'Mileage is required';
    if (!zipCode) newErrors.zipCode = 'ZIP code is required';
    else if (!/^\d{5}$/.test(zipCode)) newErrors.zipCode = 'Enter a valid 5-digit ZIP';
    if (!color) newErrors.color = 'Please select a color';
    if (!transmission) newErrors.transmission = 'Please select a transmission';
    if (!drivetrain) newErrors.drivetrain = 'Please select a drivetrain';
    if (!engine) newErrors.engine = 'Please select an engine';
    if (!sellOrTrade) newErrors.sellOrTrade = 'Please select an option';
    if (!loanOrLease) newErrors.loanOrLease = 'Please select an option';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    updateBasics({
      mileage: parseInt(mileage.replace(/,/g, ''), 10),
      zipCode,
      color,
      transmission,
      drivetrain,
      engine,
      sellOrTrade: sellOrTrade as 'sell' | 'trade' | 'not-sure',
      loanOrLease: loanOrLease as 'loan' | 'lease' | 'neither',
    });

    router.push('/getoffer/features');
  };

  if (!vehicleInfo) return null;

  return (
    <div className="min-h-screen bg-quirk-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <MobileProgress currentStep="basics" />

        <div className="flex gap-8">
          <StepNavigation currentStep="basics" completedSteps={['vehicle']} />

          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
              <h1 className="text-2xl font-bold text-quirk-gray-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                The Basics
              </h1>
              <p className="text-quirk-gray-500 mb-8">
                Tell us more about your {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
              </p>

              {/* Vehicle Summary - Mobile */}
              <div className="lg:hidden mb-8">
                <VehicleImageCompact vehicleInfo={vehicleInfo} />
              </div>

              <div className="space-y-6">
                {/* Mileage & ZIP */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-quirk-gray-700 mb-2">
                      Current Mileage
                    </label>
                    <input
                      type="text"
                      value={mileage}
                      onChange={(e) => handleMileageChange(e.target.value)}
                      placeholder="e.g. 45,000"
                      className={`input-field ${errors.mileage ? 'border-blue-500' : ''}`}
                    />
                    {errors.mileage && (
                      <p className="text-blue-500 text-sm mt-1">{errors.mileage}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-quirk-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="e.g. 03301"
                      maxLength={5}
                      className={`input-field ${errors.zipCode ? 'border-blue-500' : ''}`}
                    />
                    {errors.zipCode && (
                      <p className="text-blue-500 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-quirk-gray-700 mb-2">
                    Exterior Color
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {VEHICLE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          color === c
                            ? 'border-quirk-red bg-quirk-red/5 text-quirk-red'
                            : 'border-quirk-gray-200 text-quirk-gray-600 hover:border-quirk-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {errors.color && (
                    <p className="text-blue-500 text-sm mt-1">{errors.color}</p>
                  )}
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-quirk-gray-700 mb-2">
                    Transmission
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className={`select-field ${errors.transmission ? 'border-blue-500' : ''}`}
                  >
                    <option value="">Select transmission...</option>
                    {TRANSMISSIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.transmission && (
                    <p className="text-blue-500 text-sm mt-1">{errors.transmission}</p>
                  )}
                </div>

                {/* Drivetrain */}
                <div>
                  <label className="block text-sm font-medium text-quirk-gray-700 mb-2">
                    Drivetrain
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {DRIVETRAINS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDrivetrain(d)}
                        className={`py-3 px-4 rounded-lg border-2 text-sm font-medium text-left transition-all ${
                          drivetrain === d
                            ? 'border-quirk-red bg-quirk-red/5 text-quirk-red'
                            : 'border-quirk-gray-200 text-quirk-gray-600 hover:border-quirk-gray-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  {errors.drivetrain && (
                    <p className="text-blue-500 text-sm mt-1">{errors.drivetrain}</p>
                  )}
                </div>

                {/* Engine */}
                <div>
                  <label className="block text-sm font-medium text-quirk-gray-700 mb-2 flex items-center gap-2">
                    Engine
                    <span className="tooltip-trigger relative">
                      <Info className="w-4 h-4 text-quirk-gray-400 cursor-help" />
                      <span className="tooltip -top-8 left-6 w-48">
                        Check your window sticker or owner's manual if unsure
                      </span>
                    </span>
                  </label>
                  <select
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    className={`select-field ${errors.engine ? 'border-blue-500' : ''}`}
                  >
                    <option value="">Select engine...</option>
                    {ENGINES.map((eng) => (
                      <option key={eng} value={eng}>{eng}</option>
                    ))}
                  </select>
                  {errors.engine && (
                    <p className="text-blue-500 text-sm mt-1">{errors.engine}</p>
                  )}
                </div>

                {/* Sell or Trade */}
                <div>
                  <label className="block text-sm font-medium text-quirk-gray-700 mb-2">
                    Are you looking to sell or trade in?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'sell', label: 'Sell' },
                      { value: 'trade', label: 'Trade In' },
                      { value: 'not-sure', label: 'Not Sure' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSellOrTrade(option.value as typeof sellOrTrade)}
                        className={`condition-option ${sellOrTrade === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.sellOrTrade && (
                    <p className="text-blue-500 text-sm mt-1">{errors.sellOrTrade}</p>
                  )}
                </div>

                {/* Loan or Lease */}
                <div>
                  <label className="block text-sm font-medium text-quirk-gray-700 mb-2">
                    Do you have a loan or lease on this vehicle?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'loan', label: 'Loan' },
                      { value: 'lease', label: 'Lease' },
                      { value: 'neither', label: 'Neither' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLoanOrLease(option.value as typeof loanOrLease)}
                        className={`condition-option ${loanOrLease === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.loanOrLease && (
                    <p className="text-blue-500 text-sm mt-1">{errors.loanOrLease}</p>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-10 pt-6 border-t border-quirk-gray-100">
                <button
                  onClick={() => router.back()}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
