/**
 * Supabase Client & Offer Service
 * Database operations for offer history
 */

import {
  OfferRecord,
  CreateOfferInput,
  UpdateOfferInput,
  OfferQueryParams,
  OfferListResponse,
  OfferAnalytics,
  OfferStatus,
} from './types';

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return { url, anonKey, serviceKey };
}

async function supabaseRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
    useServiceKey?: boolean;
    headers?: Record<string, string>;
  } = {}
): Promise<{ data: T | null; error: string | null; count?: number }> {
  const config = getSupabaseConfig();
  const { method = 'GET', body, useServiceKey = false, headers = {} } = options;

  const apiKey = useServiceKey && config.serviceKey ? config.serviceKey : config.anonKey;

  try {
    const response = await fetch(`${config.url}/rest/v1/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Prefer': method === 'POST' ? 'return=representation' : 'count=exact',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Get count from headers for list queries
    const countHeader = response.headers.get('content-range');
    const count = countHeader ? parseInt(countHeader.split('/')[1]) : undefined;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null,
        error: errorData.message || `Request failed with status ${response.status}`,
      };
    }

    // Handle empty responses
    if (response.status === 204) {
      return { data: null, error: null };
    }

    const data = await response.json();
    return { data, error: null, count };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network request failed',
    };
  }
}

// =============================================================================
// OFFER SERVICE
// =============================================================================

export const offerService = {
  /**
   * Create a new offer
   */
  async create(input: CreateOfferInput): Promise<{ offer: OfferRecord | null; error: string | null }> {
    const offerData = {
      ...input,
      status: 'pending' as OfferStatus,
      source: input.source || 'website',
      is_preliminary: input.is_preliminary ?? true,
    };

    const { data, error } = await supabaseRequest<OfferRecord[]>('offers', {
      method: 'POST',
      body: offerData,
      useServiceKey: true,
    });

    if (error || !data || data.length === 0) {
      return { offer: null, error: error || 'Failed to create offer' };
    }

    return { offer: data[0], error: null };
  },

  /**
   * Get offer by ID
   */
  async getById(id: string): Promise<{ offer: OfferRecord | null; error: string | null }> {
    const { data, error } = await supabaseRequest<OfferRecord[]>(
      `offers?id=eq.${id}`,
      { useServiceKey: true }
    );

    if (error) {
      return { offer: null, error };
    }

    return { offer: data?.[0] || null, error: null };
  },

  /**
   * Get offer by VIN (most recent)
   */
  async getByVin(vin: string): Promise<{ offer: OfferRecord | null; error: string | null }> {
    const { data, error } = await supabaseRequest<OfferRecord[]>(
      `offers?vin=eq.${vin}&order=created_at.desc&limit=1`,
      { useServiceKey: true }
    );

    if (error) {
      return { offer: null, error };
    }

    return { offer: data?.[0] || null, error: null };
  },

  /**
   * List offers with filtering and pagination
   */
  async list(params: OfferQueryParams = {}): Promise<OfferListResponse> {
    const {
      page = 1,
      limit = 20,
      status,
      vin,
      email,
      date_from,
      date_to,
      min_amount,
      max_amount,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    // Build query string
    const queryParts: string[] = [];

    if (status) {
      if (Array.isArray(status)) {
        queryParts.push(`status=in.(${status.join(',')})`);
      } else {
        queryParts.push(`status=eq.${status}`);
      }
    }

    if (vin) {
      queryParts.push(`vin=eq.${vin}`);
    }

    if (email) {
      queryParts.push(`customer_email=eq.${email}`);
    }

    if (date_from) {
      queryParts.push(`created_at=gte.${date_from}`);
    }

    if (date_to) {
      queryParts.push(`created_at=lte.${date_to}`);
    }

    if (min_amount !== undefined) {
      queryParts.push(`offer_amount=gte.${min_amount}`);
    }

    if (max_amount !== undefined) {
      queryParts.push(`offer_amount=lte.${max_amount}`);
    }

    // Add ordering
    queryParts.push(`order=${sort_by}.${sort_order}`);

    // Add pagination
    const offset = (page - 1) * limit;
    queryParts.push(`offset=${offset}`);
    queryParts.push(`limit=${limit}`);

    const queryString = queryParts.join('&');

    const { data, error, count } = await supabaseRequest<OfferRecord[]>(
      `offers?${queryString}`,
      { 
        useServiceKey: true,
        headers: { 'Range-Unit': 'items' }
      }
    );

    if (error) {
      console.error('Error listing offers:', error);
      return {
        offers: [],
        total: 0,
        page,
        limit,
        total_pages: 0,
      };
    }

    const total = count || 0;

    return {
      offers: data || [],
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  },

  /**
   * Update an offer
   */
  async update(
    id: string,
    input: UpdateOfferInput
  ): Promise<{ offer: OfferRecord | null; error: string | null }> {
    const { data, error } = await supabaseRequest<OfferRecord[]>(
      `offers?id=eq.${id}`,
      {
        method: 'PATCH',
        body: input,
        useServiceKey: true,
        headers: { 'Prefer': 'return=representation' },
      }
    );

    if (error || !data || data.length === 0) {
      return { offer: null, error: error || 'Failed to update offer' };
    }

    return { offer: data[0], error: null };
  },

  /**
   * Update offer status
   */
  async updateStatus(
    id: string,
    status: OfferStatus,
    notes?: string
  ): Promise<{ offer: OfferRecord | null; error: string | null }> {
    return this.update(id, { status, status_notes: notes });
  },

  /**
   * Mark offer as emailed
   */
  async markEmailed(
    id: string,
    email: string
  ): Promise<{ offer: OfferRecord | null; error: string | null }> {
    return this.update(id, {
      status: 'emailed',
      customer_email: email,
    });
  },

  /**
   * Get analytics/stats
   */
  async getAnalytics(days: number = 30): Promise<OfferAnalytics> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Get all offers for the period
    const { offers } = await this.list({
      date_from: dateFrom.toISOString(),
      limit: 1000,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    // Calculate stats
    const total_offers = offers.length;
    const total_value = offers.reduce((sum, o) => sum + o.offer_amount, 0);
    const average_offer = total_offers > 0 ? Math.round(total_value / total_offers) : 0;

    // Group by status
    const offers_by_status = offers.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<OfferStatus, number>);

    // Group by day
    const offersByDay = new Map<string, { count: number; total_value: number }>();
    offers.forEach((o) => {
      const date = o.created_at.split('T')[0];
      const existing = offersByDay.get(date) || { count: 0, total_value: 0 };
      offersByDay.set(date, {
        count: existing.count + 1,
        total_value: existing.total_value + o.offer_amount,
      });
    });

    const offers_by_day = Array.from(offersByDay.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top makes
    const makeCount = new Map<string, number>();
    offers.forEach((o) => {
      makeCount.set(o.make, (makeCount.get(o.make) || 0) + 1);
    });

    const top_makes = Array.from(makeCount.entries())
      .map(([make, count]) => ({ make, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Conversion rate
    const completed = offers_by_status['completed'] || 0;
    const conversion_rate = total_offers > 0 ? (completed / total_offers) * 100 : 0;

    return {
      total_offers,
      total_value,
      average_offer,
      offers_by_status,
      offers_by_day,
      top_makes,
      conversion_rate,
    };
  },

  /**
   * Check if Supabase is configured
   */
  isConfigured(): boolean {
    try {
      getSupabaseConfig();
      return true;
    } catch {
      return false;
    }
  },
};

export default offerService;
