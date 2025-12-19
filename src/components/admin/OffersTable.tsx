'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { OfferRecord } from '@/types/admin';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '@/lib/admin/formatters';

interface OffersTableProps {
  offers: OfferRecord[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onOfferSelect: (offer: OfferRecord) => void;
}

export function OffersTable({
  offers,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onOfferSelect,
}: OffersTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Loading offers...</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">No offers found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mileage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Offer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(offer.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {offer.year} {offer.make} {offer.model}
                  </div>
                  {offer.trim && (
                    <div className="text-sm text-gray-500">{offer.trim}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {offer.vin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {offer.mileage.toLocaleString()} mi
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                  {formatCurrency(offer.offer_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={offer.status} size="sm" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onOfferSelect(offer)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {offers.length} of {total} offers
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
