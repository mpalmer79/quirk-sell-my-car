'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Mail,
  Eye,
  BarChart3,
  Download,
  ArrowLeft,
  Key,
  Cigarette,
  Wrench,
  CircleDot,
  Shield,
  Paintbrush,
  Sofa,
  Cpu,
  Wind,
  FileText,
  MapPin,
  Gauge,
  CreditCard,
  Truck
} from 'lucide-react';

// Types
interface OfferRecord {
  id: string;
  created_at: string;
  updated_at: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  body_class: string | null;
  drive_type: string | null;
  engine_cylinders: string | null;
  engine_displacement: string | null;
  fuel_type: string | null;
  transmission_style: string | null;
  mileage: number;
  zip_code: string | null;
  color: string | null;
  sell_or_trade: string | null;
  loan_or_lease: string | null;
  offer_amount: number;
  estimated_value: number;
  status: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  overall_condition: string | null;
  accident_history: string | null;
  drivability: string | null;
  mechanical_issues: string[] | null;
  engine_issues: string[] | null;
  exterior_damage: string[] | null;
  interior_damage: string[] | null;
  technology_issues: string[] | null;
  windshield_damage: string | null;
  tires_replaced: string | null;
  modifications: boolean | null;
  smoked_in: boolean | null;
  keys: string | null;
  offer_expiry: string | null;
}

interface OfferListResponse {
  offers: OfferRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface Analytics {
  total_offers: number;
  total_value: number;
  average_offer: number;
  offers_by_status: Record<string, number>;
  conversion_rate: number;
  top_makes: { make: string; count: number }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  viewed: { label: 'Viewed', color: 'bg-blue-100 text-blue-800', icon: Eye },
  emailed: { label: 'Emailed', color: 'bg-purple-100 text-purple-800', icon: Mail },
  scheduled: { label: 'Scheduled', color: 'bg-indigo-100 text-indigo-800', icon: Calendar },
  inspected: { label: 'Inspected', color: 'bg-cyan-100 text-cyan-800', icon: Car },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
};

// Helper to format condition values
const formatConditionValue = (value: string | null | undefined): string => {
  if (!value) return 'N/A';
  return value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Helper to format array values
const formatArrayValue = (arr: string[] | null | undefined): string => {
  if (!arr || arr.length === 0) return 'None';
  if (arr.includes('none')) return 'None';
  return arr.map(item => formatConditionValue(item)).join(', ');
};

// Helper to format boolean values
const formatBooleanValue = (value: boolean | null | undefined, trueLabel: string, falseLabel: string): string => {
  if (value === null || value === undefined) return 'N/A';
  return value ? trueLabel : falseLabel;
};

// Helper to format keys
const formatKeys = (value: string | null | undefined): string => {
  if (!value) return 'N/A';
  if (value === '1') return '1 Key';
  if (value === '2+') return '2+ Keys';
  return value;
};

// Helper to format tires replaced
const formatTiresReplaced = (value: string | null | undefined): string => {
  if (!value || value === 'none') return 'None in last 12 months';
  return `${value} tire${value === '1' ? '' : 's'} replaced`;
};

// Helper to format accident history
const formatAccidentHistory = (value: string | null | undefined): string => {
  if (!value || value === 'none') return 'No accidents';
  if (value === '1') return '1 accident';
  if (value === '2+') return '2+ accidents';
  return value;
};

// Helper to format sell or trade
const formatSellOrTrade = (value: string | null | undefined): string => {
  if (!value) return 'N/A';
  if (value === 'sell') return 'Sell outright';
  if (value === 'trade') return 'Trade-in';
  if (value === 'not-sure') return 'Not sure yet';
  return value;
};

// Helper to format loan or lease
const formatLoanOrLease = (value: string | null | undefined): string => {
  if (!value) return 'N/A';
  if (value === 'loan') return 'Has loan';
  if (value === 'lease') return 'Leased vehicle';
  if (value === 'neither') return 'Owned outright';
  return value;
};

export default function AdminDashboard() {
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');

  // Selected offer for detail view
  const [selectedOffer, setSelectedOffer] = useState<OfferRecord | null>(null);

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
  }, [page, statusFilter, searchQuery, dateRange]);

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

  // Initial fetch
  useEffect(() => {
    fetchOffers();
    fetchAnalytics();
  }, [fetchOffers, fetchAnalytics]);

  // Update offer status
  const updateOfferStatus = async (offerId: string, status: string) => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh offers
      fetchOffers();
      fetchAnalytics();
      
      // Update selected offer if viewing
      if (selectedOffer?.id === offerId) {
        const { offer } = await response.json();
        setSelectedOffer(offer);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'VIN', 'Year', 'Make', 'Model', 'Mileage', 'Offer', 'Status', 'Email'];
    const rows = offers.map(o => [
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

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
                onClick={() => { fetchOffers(); fetchAnalytics(); }}
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
        {/* Analytics Cards */}
        {analytics && (
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
                    ${analytics.total_value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. Offer</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analytics.average_offer.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conversion</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.conversion_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by VIN..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value as typeof dateRange); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Offers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center p-12">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No offers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">VIN</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Mileage</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Offer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {offers.map((offer) => {
                    const statusConfig = STATUS_CONFIG[offer.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(offer.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            {offer.year} {offer.make} {offer.model}
                          </p>
                          {offer.trim && (
                            <p className="text-xs text-gray-500">{offer.trim}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">
                          {offer.vin}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {offer.mileage.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-gray-900">
                            ${offer.offer_amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {offer.customer_email || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedOffer(offer)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} offers
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Detail Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedOffer.year} {selectedOffer.make} {selectedOffer.model}
                  </h2>
                  <p className="text-sm text-gray-500 font-mono mt-1">{selectedOffer.vin}</p>
                </div>
                <button
                  onClick={() => setSelectedOffer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Offer Amount */}
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <p className="text-sm text-green-600 mb-1">Offer Amount</p>
                <p className="text-4xl font-bold text-green-700">
                  ${selectedOffer.offer_amount.toLocaleString()}
                </p>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Gauge className="w-4 h-4" />
                    <span className="text-xs">Mileage</span>
                  </div>
                  <p className="font-semibold">{selectedOffer.mileage.toLocaleString()} mi</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs">Condition</span>
                  </div>
                  <p className="font-semibold">{formatConditionValue(selectedOffer.overall_condition)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Created</span>
                  </div>
                  <p className="font-semibold text-sm">{new Date(selectedOffer.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs">Zip Code</span>
                  </div>
                  <p className="font-semibold">{selectedOffer.zip_code || 'N/A'}</p>
                </div>
              </div>

              {/* Customer Questionnaire Responses */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Customer Questionnaire Responses
                </h3>
                
                {/* Vehicle Basics Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Vehicle Basics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Paintbrush className="w-4 h-4" />
                        <span className="text-xs font-medium">Color</span>
                      </div>
                      <p className="font-semibold text-gray-900">{selectedOffer.color || 'N/A'}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Truck className="w-4 h-4" />
                        <span className="text-xs font-medium">Intent</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formatSellOrTrade(selectedOffer.sell_or_trade)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-xs font-medium">Ownership</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formatLoanOrLease(selectedOffer.loan_or_lease)}</p>
                    </div>
                  </div>
                </div>

                {/* Condition Overview Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Condition Overview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-600 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Accidents</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formatAccidentHistory(selectedOffer.accident_history)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-600 mb-1">
                        <Car className="w-4 h-4" />
                        <span className="text-xs font-medium">Drivability</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formatConditionValue(selectedOffer.drivability)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-600 mb-1">
                        <Cigarette className="w-4 h-4" />
                        <span className="text-xs font-medium">Smoker Vehicle</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formatBooleanValue(selectedOffer.smoked_in, 'Yes - Smoked In', 'Non-Smoker')}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-600 mb-1">
                        <Key className="w-4 h-4" />
                        <span className="text-xs font-medium">Keys</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formatKeys(selectedOffer.keys)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-600 mb-1">
                        <CircleDot className="w-4 h-4" />
                        <span className="text-xs font-medium">Tires Replaced</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formatTiresReplaced(selectedOffer.tires_replaced)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-amber-600 mb-1">
                        <Wrench className="w-4 h-4" />
                        <span className="text-xs font-medium">Modifications</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formatBooleanValue(selectedOffer.modifications, 'Has Modifications', 'Stock / No Mods')}</p>
                    </div>
                  </div>
                </div>

                {/* Issues & Damage Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Reported Issues & Damage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-600 mb-1">
                        <Wrench className="w-4 h-4" />
                        <span className="text-xs font-medium">Mechanical Issues</span>
                      </div>
                      <p className="text-gray-900">{formatArrayValue(selectedOffer.mechanical_issues)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-600 mb-1">
                        <Car className="w-4 h-4" />
                        <span className="text-xs font-medium">Engine Issues</span>
                      </div>
                      <p className="text-gray-900">{formatArrayValue(selectedOffer.engine_issues)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-600 mb-1">
                        <Paintbrush className="w-4 h-4" />
                        <span className="text-xs font-medium">Exterior Damage</span>
                      </div>
                      <p className="text-gray-900">{formatArrayValue(selectedOffer.exterior_damage)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-600 mb-1">
                        <Sofa className="w-4 h-4" />
                        <span className="text-xs font-medium">Interior Damage</span>
                      </div>
                      <p className="text-gray-900">{formatArrayValue(selectedOffer.interior_damage)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-600 mb-1">
                        <Cpu className="w-4 h-4" />
                        <span className="text-xs font-medium">Technology Issues</span>
                      </div>
                      <p className="text-gray-900">{formatArrayValue(selectedOffer.technology_issues)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-600 mb-1">
                        <Wind className="w-4 h-4" />
                        <span className="text-xs font-medium">Windshield Damage</span>
                      </div>
                      <p className="text-gray-900">{formatConditionValue(selectedOffer.windshield_damage) || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Contact Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Customer Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-purple-600 mb-1">
                        <Mail className="w-4 h-4" />
                        <span className="text-xs font-medium">Email</span>
                      </div>
                      <p className="font-semibold text-gray-900">{selectedOffer.customer_email || 'N/A'}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-purple-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium">Estimated Value</span>
                      </div>
                      <p className="font-semibold text-gray-900">${selectedOffer.estimated_value.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-purple-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">Offer Expires</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {selectedOffer.offer_expiry 
                          ? new Date(selectedOffer.offer_expiry).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const isActive = selectedOffer.status === key;
                    return (
                      <button
                        key={key}
                        onClick={() => updateOfferStatus(selectedOffer.id, key)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? config.color
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedOffer(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
