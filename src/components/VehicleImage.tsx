'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { VehicleInfo } from '@/types/vehicle';
import { getVehicleImage } from '@/services/vehicleImage';

interface VehicleImageProps {
  vehicleInfo: VehicleInfo | null;
  className?: string;
}

/**
 * Full-size vehicle image component with overlay
 */
export default function VehicleImage({ vehicleInfo, className = '' }: VehicleImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (vehicleInfo) {
      setIsLoading(true);
      getVehicleImage(vehicleInfo)
        .then(setImageUrl)
        .catch(() => setImageUrl(null))
        .finally(() => setIsLoading(false));
    } else {
      setImageUrl(null);
    }
  }, [vehicleInfo]);

  if (!vehicleInfo) {
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
            <p className="mt-2 text-sm">Enter your VIN to see your vehicle</p>
          </div>
        </div>
      </div>
    );
  }

  const vehicleName = `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`;

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <div className="aspect-video relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0070cc]"></div>
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={vehicleName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">Image unavailable</span>
          </div>
        )}
        
        {/* Vehicle info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">{vehicleName}</h3>
          {vehicleInfo.trim && (
            <p className="text-white/80 text-sm">{vehicleInfo.trim}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact vehicle image component for sidebars/cards
 */
export function VehicleImageCompact({ vehicleInfo, className = '' }: VehicleImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (vehicleInfo) {
      setIsLoading(true);
      getVehicleImage(vehicleInfo)
        .then(setImageUrl)
        .catch(() => setImageUrl(null))
        .finally(() => setIsLoading(false));
    } else {
      setImageUrl(null);
    }
  }, [vehicleInfo]);

  if (!vehicleInfo) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="aspect-[16/9] relative bg-gray-100">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0070cc]"></div>
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900">
          {vehicleInfo.year} {vehicleInfo.make}
        </p>
        <p className="text-sm text-gray-600">{vehicleInfo.model}</p>
        {vehicleInfo.trim && (
          <p className="text-xs text-gray-500 mt-1">{vehicleInfo.trim}</p>
        )}
      </div>
    </div>
  );
}
