'use client';

import { Car, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { OfferAnalytics } from '@/types/admin';
import { formatCurrency } from '@/lib/admin/formatters';

interface AnalyticsCardsProps {
  analytics: OfferAnalytics;
}

export function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Offers</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.total_offers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(analytics.total_value)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Offer</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(analytics.average_offer)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.conversion_rate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
