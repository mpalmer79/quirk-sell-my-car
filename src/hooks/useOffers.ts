/**
 * useOffers Hook
 * Handles offer data fetching, filtering, and mutations
 */

import { useState, useEffect, useCallback } from 'react';
import { OfferRecord, OfferListResponse, OfferAnalytics, DateRangeFilter } from '@/types/admin';

interface UseOffersOptions {
  initialPage?: number;
  limit?: number;
}

interface UseOffersReturn {
  // Data
  offers: OfferRecord[];
  analytics: OfferAnalytics | null;
  total: number;
  totalPages: number;
  page: number;

  // State
  loading: boolean;
  error: string | null;
  dbConfigured: boolean;

  // Filters
  statusFilter: string;
  searchQuery: string;
  dateRange: DateRangeFilter;

  // Actions
  setPage: (page: number) => void;
  setStatusFilter: (status: string) => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (range: DateRangeFilter) => void;
  refresh: () => void;
  updateOfferStatus: (offerId: string, status: string) => Promise<OfferRecord | null>;
  exportToCSV: () => void;
}

export function useOffers(options: UseOffersOptions = {}): UseOffersReturn {
  const { initialPage = 1, limit = 20 } = options;

  // Data state
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [analytics, setAnalytics] = useState<OfferAnalytics | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);

  // Filter state
  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30');

  // Fetch offers
  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      if (statusFilter) {
        params.set('status', statusFilter);
      }

      if (searchQuery) {
        params.set('vin', searchQuery);
      }

      if (dateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
        params.set('date_from', daysAgo.toISOString());
      }

      const response = await fetch(`/api/offers?${params.toString()}`);

      if (response.status === 503) {
        setDbConfigured(false);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }

      const data: OfferListResponse = await response.json();
      setOffers(data.offers);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery, dateRange]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const days = dateRange === 'all' ? 365 : parseInt(dateRange);
      const response = await fetch(`/api/offers/analytics?days=${days}`);

      if (response.status === 503) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, [dateRange]);

  // Initial fetch and refresh on filter changes
  useEffect(() => {
    fetchOffers();
    fetchAnalytics();
  }, [fetchOffers, fetchAnalytics]);

  // Update offer status
  const updateOfferStatus = async (
    offerId: string,
    status: string
  ): Promise<OfferRecord | null> => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const { offer } = await response.json();

      // Refresh data
      fetchOffers();
      fetchAnalytics();

      return offer;
    } catch (err) {
      console.error('Error updating status:', err);
      return null;
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'VIN', 'Year', 'Make', 'Model', 'Mileage', 'Offer', 'Status', 'Email'];
    const rows = offers.map((o) => [
      new Date(o.created_at).toLocaleDateString(),
      o.vin,
      o.year,
      o.make,
      o.model,
      o.mileage,
      o.offer_amount,
      o.status,
      o.customer_email || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Refresh function
  const refresh = () => {
    fetchOffers();
    fetchAnalytics();
  };

  return {
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
  };
}
