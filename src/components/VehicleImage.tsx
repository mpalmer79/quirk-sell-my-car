
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Car, Loader2 } from 'lucide-react';
import { VehicleInfo } from '@/types/vehicle';
import { getVehicleImage } from '@/services/vehicleImage';

interface VehicleImageProps {
  vehicleInfo: VehicleInfo | null;
  className?: string;
}

export default function VehicleImage({ vehicleInfo, className = '' }: VehicleImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (vehicleInfo) {
      setLoading(true);
      setError(false);
      getVehicleImage(vehicleInfo)
        .then((url) => {
          setImageUrl(url);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [vehicleInfo]);

  if (!vehicleInfo) {
    return (
      <div className={`relative bg-quirk-gray-100 rounded-xl overflow-hidden ${className}`}>
        <div className="aspect-[16/10] flex items-center justify-center">
          <div className="text-center">
            <Car className="w-16 h-16 text-quirk-gray-300 mx-auto mb-2" />
            <p className="text-quirk-gray-400 text-sm">Enter your VIN to see your vehicle</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-quirk-gray-100 rounded-xl overflow-hidden ${className}`}>
      <div className="aspect-[16/10] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-quirk-red animate-spin" />
          </div>
        ) : error || !imageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Car className="w-16 h-16 text-quirk-gray-300 mx-auto mb-2" />
              <p className="text-quirk-gray-500 font-medium">
                {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
              </p>
            </div>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}
      </div>
      
      {/* Vehicle info overlay */}
      {vehicleInfo && !loading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">
            {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
          </h3>
          {vehicleInfo.trim && (
            <p className="text-white/80 text-sm">{vehicleInfo.trim}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for the wizard sidebar
export function VehicleImageCompact({ vehicleInfo }: { vehicleInfo: VehicleInfo | null }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (vehicleInfo) {
      getVehicleImage(vehicleInfo).then(setImageUrl);
    }
  }, [vehicleInfo]);

  if (!vehicleInfo) return null;

  return (
    <div className="bg-white rounded-lg border border-quirk-gray-200 overflow-hidden">
      <div className="aspect-[16/9] relative bg-quirk-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}
            fill
            className="object-cover"
            sizes="300px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="w-10 h-10 text-quirk-gray-300" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-quirk-gray-900 text-sm">
          {vehicleInfo.year} {vehicleInfo.make}
        </p>
        <p className="text-quirk-gray-600 text-sm">{vehicleInfo.model}</p>
        {vehicleInfo.trim && (
          <p className="text-quirk-gray-400 text-xs mt-1">{vehicleInfo.trim}</p>
        )}
      </div>
    </div>
  );
}
