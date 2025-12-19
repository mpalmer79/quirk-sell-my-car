'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { OfferRecord } from '@/types/admin';
import { useOffers } from '@/hooks/useOffers';
import {
  AnalyticsCards,
  OffersFilters,
  OffersTable,
  OfferDetailModal,
} from '@/components/admin';

export default function AdminDashboard() {
  const [selectedOffer, setSelectedOffer] = useState<OfferRecord | null>(null);

  const {
    offers,
    analytics,
    total,
    totalPages,
    page,
    loading,
    error,
    dbConfigured,
    statusFilter,
    searchQuery,
    dateRange,
    setPage,
    setStatusFilter,
    setSearchQuery,
    setDateRange,
    refresh,
    updateOfferStatus,
    exportToCSV,
  } = useOffers();

  // Handle status update with optimistic UI
  const handleStatusUpdate = async (offerId: string, status: string) => {
    const updatedOffer = await updateOfferStatus(offerId, status);
    if (updatedOffer && selectedOffer?.id === offerId) {
      setSelectedOffer(updatedOffer);
    }
  };

  // Database not configured state
  if (!dbConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Database Not Configured</h1>
          <p className="text-gray-600 mb-6">
            To enable offer history, configure Supabase by adding these environment variables:
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left text-sm font-mono mb-6">
            <p>NEXT_PUBLIC_SUPABASE_URL=...</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
            <p>SUPABASE_SERVICE_ROLE_KEY=...</p>
          </div>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Offer Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={refresh}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics */}
        {analytics && <AnalyticsCards analytics={analytics} />}

        {/* Filters */}
        <OffersFilters
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          dateRange={dateRange}
          onStatusChange={setStatusFilter}
          onSearchChange={setSearchQuery}
          onDateRangeChange={setDateRange}
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Table */}
        <OffersTable
          offers={offers}
          loading={loading}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          onOfferSelect={setSelectedOffer}
        />
      </main>

      {/* Detail Modal */}
      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
