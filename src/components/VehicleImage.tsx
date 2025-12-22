'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { VehicleInfo } from '@/types/vehicle';
import { getVehicleImageByMake } from '@/services/vehicleImage';

interface VehicleImageProps {
  vehicleInfo: VehicleInfo | null;
  className?: string;
}

// Car icon SVG for placeholder
function CarPlaceholder() {
  return (
    <svg
      className="h-12 w-12 text-gray-300"
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
  );
}

/**
 * Full-size vehicle image component with overlay
 */
export default function VehicleImage({ vehicleInfo, className = '' }: VehicleImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get image URL synchronously - no async needed since it's just a lookup
  const imageUrl = vehicleInfo ? getVehicleImageByMake(vehicleInfo) : null;

  // Reset error state when vehicle changes
  useEffect(() => {
    setImageError(false);
  }, [vehicleInfo]);

  if (!vehicleInfo) {
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center text-gray-500">
            <CarPlaceholder />
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
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={vehicleName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <CarPlaceholder />
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
 * Just renders the image - parent component handles surrounding card and text
 */
export function VehicleImageCompact({ vehicleInfo, className = '' }: VehicleImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get image URL synchronously - no async needed since it's just a lookup
  const imageUrl = vehicleInfo ? getVehicleImageByMake(vehicleInfo) : null;

  // Reset error state when vehicle changes
  useEffect(() => {
    setImageError(false);
  }, [vehicleInfo]);

  if (!vehicleInfo) {
    return null;
  }

  return (
    <div className={`aspect-[16/9] relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {imageUrl && !imageError ? (
        <Image
          src={imageUrl}
          alt={`${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`}
          fill
          className="object-cover"
          sizes="256px"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <CarPlaceholder />
        </div>
      )}
    </div>
  );
}
