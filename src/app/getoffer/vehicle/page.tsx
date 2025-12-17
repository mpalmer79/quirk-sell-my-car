
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, ChevronDown, ArrowRight } from 'lucide-react';
import VehicleImage from '@/components/VehicleImage';
import { useVehicle } from '@/context/VehicleContext';
import { VehicleInfo } from '@/types/vehicle';
import { getAvailableTrims } from '@/services/vinDecoder';

function VehiclePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setVehicleInfo } = useVehicle();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [availableTrims, setAvailableTrims] = useState<string[]>([]);
  const [selectedTrim, setSelectedTrim] = useState<string>('');

  const vin = searchParams.get('vin');

  useEffect(() => {
    if (!vin) {
      router.push('/');
      return;
    }

    const fetchVehicle = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/decode-vin?vin=${vin}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to decode VIN');
        }

        setVehicle(data);
        
        // Get available trims if needed
        const trims = getAvailableTrims(data);
        setAvailableTrims(trims);
        
        // If trim already decoded, set it
        if (data.trim) {
          setSelectedTrim(data.trim);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to look up vehicle');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vin, router]);

  const handleContinue = () => {
    if (!vehicle) return;

    const updatedVehicle = {
      ...vehicle,
      trim: selectedTrim || vehicle.trim,
    };

    setVehicleInfo(updatedVehicle);
    router.push('/getoffer/basics');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quirk-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-quirk-red animate-spin mx-auto mb-4" />
          <p className="text-quirk-gray-600 text-lg">Looking up your vehicle...</p>
          <p className="text-quirk-gray-400 text-sm mt-2">VIN: {vin}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quirk-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-quirk-gray-900 mb-2">
            Unable to Find Vehicle
          </h2>
          <p className="text-quirk-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quirk-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Vehicle Image */}
          <VehicleImage vehicleInfo={vehicle} className="w-full" />

          {/* Vehicle Details */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-quirk-gray-500 text-sm mb-2">We found your vehicle</p>
              <h1 className="text-3xl font-bold text-quirk-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                {vehicle?.year} {vehicle?.make} {vehicle?.model}
              </h1>
              <p className="text-quirk-gray-400 text-sm mt-2 font-mono">VIN: {vin}</p>
            </div>

            {/* Vehicle Specs */}
            {vehicle && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {vehicle.bodyClass && (
                  <div className="bg-quirk-gray-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-quirk-gray-400 mb-1">Body Style</p>
                    <p className="font-semibold text-quirk-gray-800">{vehicle.bodyClass}</p>
                  </div>
                )}
                {vehicle.driveType && (
                  <div className="bg-quirk-gray-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-quirk-gray-400 mb-1">Drive Type</p>
                    <p className="font-semibold text-quirk-gray-800">{vehicle.driveType}</p>
                  </div>
                )}
                {vehicle.engineCylinders && (
                  <div className="bg-quirk-gray-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-quirk-gray-400 mb-1">Engine</p>
                    <p className="font-semibold text-quirk-gray-800">
                      {vehicle.engineCylinders}-Cyl {vehicle.engineDisplacement && `${vehicle.engineDisplacement}L`}
                    </p>
                  </div>
                )}
                {vehicle.fuelType && (
                  <div className="bg-quirk-gray-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-quirk-gray-400 mb-1">Fuel Type</p>
                    <p className="font-semibold text-quirk-gray-800">{vehicle.fuelType}</p>
                  </div>
                )}
              </div>
            )}

            {/* Trim Selection */}
            {availableTrims.length > 0 && !vehicle?.trim && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-quirk-gray-700 mb-2">
                  Select Your Trim Level
                </label>
                <div className="relative">
                  <select
                    value={selectedTrim}
                    onChange={(e) => setSelectedTrim(e.target.value)}
                    className="select-field"
                  >
                    <option value="">Select trim...</option>
                    {availableTrims.map((trim) => (
                      <option key={trim} value={trim}>
                        {trim}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-quirk-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/')}
                className="btn-secondary flex-1"
              >
                This isn't my vehicle
              </button>
              <button
                onClick={handleContinue}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VehiclePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-quirk-gray-50">
        <Loader2 className="w-12 h-12 text-quirk-red animate-spin" />
      </div>
    }>
      <VehiclePageContent />
    </Suspense>
  );
}
