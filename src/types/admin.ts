/**
 * Admin Dashboard Types
 */

export interface OfferRecord {
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

export interface OfferListResponse {
  offers: OfferRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface OfferAnalytics {
  total_offers: number;
  total_value: number;
  average_offer: number;
  offers_by_status: Record<string, number>;
  conversion_rate: number;
  top_makes: { make: string; count: number }[];
}

export type DateRangeFilter = '7' | '30' | '90' | 'all';

export interface OfferFilters {
  status: string;
  search: string;
  dateRange: DateRangeFilter;
}
