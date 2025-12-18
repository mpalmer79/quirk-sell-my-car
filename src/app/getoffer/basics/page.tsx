'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import StepNavigation, { MobileProgress } from '@/components/StepNavigation';
import { VehicleImageCompact } from '@/components/VehicleImage';
import { useVehicle } from '@/context/VehicleContext';
import { VEHICLE_COLORS } from '@/types/vehicle';

const ALL_TRANSMISSIONS = [
  'Automatic',
  'Manual',
  'CVT',
  'Automatic, 6-Speed',
  'Automatic, 8-Speed',
  'Automatic, 10-Speed',
];

const ALL_DRIVETRAINS = [
  'Front Wheel Drive (FWD)',
  'Rear Wheel Drive (RWD)',
  '4WD / 4×4',
  'All Wheel Drive (AWD)',
];

const ALL_ENGINES = [
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

// Helper function to determine engine type from VIN data
function getEngineFromVIN(vehicleInfo: { displacement?: string; engineCylinders?: string; fuelType?: string; electrificationLevel?: string } | null): string | null {
  if (!vehicleInfo) return null;
  
  const cylindersStr = vehicleInfo.engineCylinders;
  const cylinders = cylindersStr ? parseInt(cylindersStr, 10) : null;
  const fuelType = vehicleInfo.fuelType?.toLowerCase() || '';
  const electrification = vehicleInfo.electrificationLevel?.toLowerCase() || '';
  const displacement = parseFloat(vehicleInfo.displacement || '0');
  
  // Check for electric first
  if (electrification.includes('ev') || electrification.includes('bev') || electrification.includes('battery electric') || fuelType.includes('electric')) {
    return 'Electric';
  }
  
  // Check for hybrid
  if (electrification.includes('hybrid') || fuelType.includes('hybrid')) {
    return 'Hybrid';
  }
  
  // Check for diesel
  if (fuelType.includes('diesel')) {
    if (cylinders === 4) return '4-Cylinder Diesel';
    if (cylinders === 6) return 'V6 Diesel';
    return '4-Cylinder Diesel'; // Default diesel
  }
  
  // Determine if turbo based on displacement (smaller displacement with higher power usually means turbo)
  // This is a heuristic - ideally VIN data would include forced induction info
  const isTurbo = displacement > 0 && displacement < 2.5 && cylinders === 4;
  
  // Standard gas engines
  if (cylinders === 4) {
    return isTurbo ? '4-Cylinder Turbo' : '4-Cylinder';
  }
  if (cylinders === 6) {
    return 'V6';
  }
  if (cylinders === 8) {
    return 'V8';
  }
  
  return null;
}

// Helper function to determine transmission from VIN data
function getTransmissionFromVIN(vehicleInfo: { transmissionStyle?: string; transmissionSpeeds?: string } | null): string | null {
  if (!vehicleInfo) return null;
  
  const style = vehicleInfo.transmissionStyle?.toLowerCase() || '';
  const speeds = vehicleInfo.transmissionSpeeds;
  
  if (style.includes('cvt') || style.includes('continuously variable')) {
    return 'CVT';
  }
  
  if (style.includes('manual')) {
    return 'Manual';
  }
  
  if (style.includes('automatic') || style.includes('auto')) {
    if (speeds === '6') return 'Automatic, 6-Speed';
    if (speeds === '8') return 'Automatic, 8-Speed';
    if (speeds === '10') return 'Automatic, 10-Speed';
    return 'Automatic';
  }
  
  return null;
}

// Helper function to determine drivetrain from VIN data
function getDrivetrainFromVIN(vehicleInfo: { driveType?: string } | null): string | null {
  if (!vehicleInfo) return null;
  
  const driveType = vehicleInfo.driveType?.toLowerCase() || '';
  
  if (driveType.includes('fwd') || driveType.includes('front')) {
    return 'Front Wheel Drive (FWD)';
  }
  if (driveType.includes('rwd') || driveType.includes('rear')) {
    return 'Rear Wheel Drive (RWD)';
  }
  if (driveType.includes('4wd') || driveType.includes('4x4') || driveType.includes('4×4')) {
    return '4WD / 4×4';
  }
  if (driveType.includes('awd') || driveType.includes('all wheel') || driveType.includes('all-wheel')) {
    return 'All Wheel Drive (AWD)';
  }
  
  return null;
}

export default function BasicsPage() {
  const router = useRouter();
  const { vehicleInfo, basics, updateBasics } = useVehicle();

  // Determine VIN-based values
  const vinEngine = getEngineFromVIN(vehicleInfo);
  const vinTransmission = getTransmissionFromVIN(vehicleInfo);
  const vinDrivetrain = getDrivetrainFromVIN(vehicleInfo);

  const [mileage, setMileage] = useState(basics.mileage?.toString() || '');
  const [zipCode, setZipCode] = useState(basics.zipCode || '');
  const [color, setColor] = useState(basics.color || '');
  const [transmission, setTransmission] = useState(basics.transmission || vinTransmission || '');
  const [drivetrain, setDrivetrain] = useState(basics.drivetrain || vinDrivetrain || '');
  const [engine, setEngine] = useState(basics.engine || vinEngine || '');
  const [sellOrTrade, setSellOrTrade] = useState<'sell' | 'trade' | 'not-sure' | ''>(basics.sellOrTrade || '');
  const [loanOrLease, setLoanOrLease] = useState<'loan' | 'lease' | 'neither' | ''>(basics.loanOrLease || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if no vehicle info
  useEffect(() => {
    if (!vehicleInfo) {
      router.push('/');
    }
  }, [vehicleInfo, router]);

  // Auto-populate from VIN data on mount
  useEffect(() => {
    if (vinEngine && !basics.engine) {
      setEngine(vinEngine);
    }
    if (vinTransmission && !basics.transmission) {
      setTransmission(vinTransmission);
    }
    if (vinDrivetrain && !basics.drivetrain) {
      setDrivetrain(vinDrivetrain);
    }
  }, [vinEngine, vinTransmission, vinDrivetrain, basics]);

  // Format mileage with commas
  const handleMileageChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = numbers ? parseInt(numbers).toLocaleString() : '';
    setMileage(formatted);
    if (errors.mileage) {
      setErrors(prev => ({ ...prev, mileage: '' }));
    }
  };

  // Format ZIP code
  const handleZipChange = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 5);
    setZipCode(numbers);
    if (errors.zipCode) {
      setErrors(prev => ({ ...prev, zipCode: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const mileageNum = parseInt(mileage.replace(/,/g, ''));
    if (!mileage) {
      newErrors.mileage = 'Please enter your current mileage';
    } else if (isNaN(mileageNum) || mileageNum < 0) {
      newErrors.mileage = 'Please enter a valid mileage';
    } else if (mileageNum > 500000) {
      newErrors.mileage = 'Please verify your mileage';
    }

    if (!zipCode) {
      newErrors.zipCode = 'Please enter your ZIP code';
    } else if (zipCode.length !== 5) {
      newErrors.zipCode = 'Please enter a valid 5-digit ZIP code';
    }

    if (!color) {
      newErrors.color = 'Please select your exterior color';
    }

    if (!transmission) {
      newErrors.transmission = 'Please select your transmission type';
    }

    if (!drivetrain) {
      newErrors.drivetrain = 'Please select your drivetrain';
    }

    if (!engine) {
      newErrors.engine = 'Please select your engine type';
    }

    if (!sellOrTrade) {
      newErrors.sellOrTrade = 'Please tell us your preference';
    }

    if (!loanOrLease) {
      newErrors.loanOrLease = 'Please tell us about your loan/lease status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      // Scroll to first error
      const firstError = document.querySelector('.text-red-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    updateBasics({
      mileage: parseInt(mileage.replace(/,/g, '')),
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

  // Determine which options to show - if VIN detected a value, only show that option
  const engineOptions = vinEngine ? [vinEngine] : ALL_ENGINES;
  const transmissionOptions = vinTransmission ? [vinTransmission] : ALL_TRANSMISSIONS;
  const drivetrainOptions = vinDrivetrain ? [vinDrivetrain] : ALL_DRIVETRAINS;

  if (!vehicleInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Progress */}
      <MobileProgress currentStep="2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <StepNavigation currentStep="2" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">The Basics</h1>
              <p className="text-gray-500 mb-8">
                Tell us more about your {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Mileage & ZIP */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Mileage
                    </label>
                    <input
                      type="text"
                      value={mileage}
                      onChange={(e) => handleMileageChange(e.target.value)}
                      placeholder="45,000"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.mileage ? 'border-red-300' : 'border-gray-200'
                      } focus:border-[#0070cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                    />
                    {errors.mileage && (
                      <p className="mt-1 text-sm text-red-500">{errors.mileage}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => handleZipChange(e.target.value)}
                      placeholder="03301"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.zipCode ? 'border-red-300' : 'border-gray-200'
                      } focus:border-[#0070cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                {/* Exterior Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Exterior Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VEHICLE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setColor(c);
                          if (errors.color) {
                            setErrors(prev => ({ ...prev, color: '' }));
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          color === c
                            ? 'bg-blue-50 border-[#0070cc] text-[#0070cc] ring-2 ring-blue-100'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {errors.color && (
                    <p className="mt-2 text-sm text-red-500">{errors.color}</p>
                  )}
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission
                    {vinTransmission && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        ✓ Detected from VIN
                      </span>
                    )}
                  </label>
                  {transmissionOptions.length === 1 ? (
                    // Single option - show as selected button
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg border text-sm font-medium bg-blue-50 border-[#0070cc] text-[#0070cc] ring-2 ring-blue-100"
                      >
                        {transmissionOptions[0]}
                      </button>
                    </div>
                  ) : (
                    // Multiple options - show dropdown
                    <select
                      value={transmission}
                      onChange={(e) => {
                        setTransmission(e.target.value);
                        if (errors.transmission) {
                          setErrors(prev => ({ ...prev, transmission: '' }));
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.transmission ? 'border-red-300' : 'border-gray-200'
                      } focus:border-[#0070cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white`}
                    >
                      <option value="">Select transmission...</option>
                      {transmissionOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  )}
                  {errors.transmission && (
                    <p className="mt-1 text-sm text-red-500">{errors.transmission}</p>
                  )}
                </div>

                {/* Drivetrain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drivetrain
                    {vinDrivetrain && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        ✓ Detected from VIN
                      </span>
                    )}
                  </label>
                  {drivetrainOptions.length === 1 ? (
                    // Single option - show as selected button
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg border text-sm font-medium bg-blue-50 border-[#0070cc] text-[#0070cc] ring-2 ring-blue-100"
                      >
                        {drivetrainOptions[0]}
                      </button>
                    </div>
                  ) : (
                    // Multiple options - show as buttons
                    <div className="flex flex-wrap gap-2">
                      {drivetrainOptions.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDrivetrain(d);
                            if (errors.drivetrain) {
                              setErrors(prev => ({ ...prev, drivetrain: '' }));
                            }
                          }}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            drivetrain === d
                              ? 'bg-blue-50 border-[#0070cc] text-[#0070cc] ring-2 ring-blue-100'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.drivetrain && (
                    <p className="mt-2 text-sm text-red-500">{errors.drivetrain}</p>
                  )}
                </div>

                {/* Engine */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Engine
                    {vinEngine && (
                      <span className="text-xs text-green-600 font-normal">
                        ✓ Detected from VIN
                      </span>
                    )}
                    {!vinEngine && (
                      <span className="text-gray-400 cursor-help" title="Select your engine type">
                        <Info className="w-4 h-4" />
                      </span>
                    )}
                  </label>
                  {engineOptions.length === 1 ? (
                    // Single option - show as selected button (VIN detected)
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg border text-sm font-medium bg-blue-50 border-[#0070cc] text-[#0070cc] ring-2 ring-blue-100"
                      >
                        {engineOptions[0]}
                      </button>
                    </div>
                  ) : (
                    // Multiple options - show dropdown
                    <select
                      value={engine}
                      onChange={(e) => {
                        setEngine(e.target.value);
                        if (errors.engine) {
                          setErrors(prev => ({ ...prev, engine: '' }));
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.engine ? 'border-red-300' : 'border-gray-200'
                      } focus:border-[#0070cc] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white`}
                    >
                      <option value="">Select engine...</option>
                      {engineOptions.map((eng) => (
                        <option key={eng} value={eng}>{eng}</option>
                      ))}
                    </select>
                  )}
                  {errors.engine && (
                    <p className="mt-1 text-sm text-red-500">{errors.engine}</p>
                  )}
                </div>

                {/* Sell or Trade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Are you looking to sell or trade in?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'sell', label: 'Sell' },
                      { value: 'trade', label: 'Trade In' },
                      { value: 'not-sure', label: 'Not Sure' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSellOrTrade(option.value as 'sell' | 'trade' | 'not-sure');
                          if (errors.sellOrTrade) {
                            setErrors(prev => ({ ...prev, sellOrTrade: '' }));
                          }
                        }}
                        className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all ${
                          sellOrTrade === option.value
                            ? 'bg-blue-50 border-[#0070cc] text-[#0070cc] ring-2 ring-blue-100'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.sellOrTrade && (
                    <p className="mt-2 text-sm text-red-500">{errors.sellOrTrade}</p>
                  )}
                </div>

                {/* Loan or Lease */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you have a loan or lease on this vehicle?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'loan', label: 'Yes, a loan' },
                      { value: 'lease', label: 'Yes, a lease' },
                      { value: 'neither', label: 'No, I own it outright' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setLoanOrLease(option.value as 'loan' | 'lease' | 'neither');
                          if (errors.loanOrLease) {
                            setErrors(prev => ({ ...prev, loanOrLease: '' }));
                          }
                        }}
                        className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all ${
                          loanOrLease === option.value
                            ? 'bg-blue-50 border-[#0070cc] text-[#0070cc] ring-2 ring-blue-100'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {errors.loanOrLease && (
                    <p className="mt-2 text-sm text-red-500">{errors.loanOrLease}</p>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => router.push('/getoffer/vehicle')}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0070cc] text-white font-semibold hover:bg-[#005fa3] transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Vehicle Card - Right Sidebar */}
          <div className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <VehicleImageCompact vehicleInfo={vehicleInfo} />
                <div className="mt-4 text-center">
                  <p className="font-bold text-gray-900">
                    {vehicleInfo.year} {vehicleInfo.make}
                  </p>
                  <p className="text-gray-500">{vehicleInfo.model}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
