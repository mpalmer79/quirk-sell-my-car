/**
 * Database Types for Offer History
 * Supabase Schema Definitions
 */

// =============================================================================
// OFFER RECORD
// =============================================================================

export interface OfferRecord {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Vehicle Information
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
  
  // Vehicle Basics
  mileage: number;
  zip_code: string | null;
  color: string | null;
  sell_or_trade: 'sell' | 'trade' | 'not-sure' | null;
  loan_or_lease: 'loan' | 'lease' | 'neither' | null;
  
  // Condition
  overall_condition: string | null;
  accident_history: string | null;
  drivability: string | null;
  mechanical_issues: string[] | null;
  engine_issues: string[] | null;
  exterior_damage: string[] | null;
  interior_damage: string[] | null;
  
  // Offer Details
  estimated_value: number;
  offer_amount: number;
  offer_expiry: string;
  is_preliminary: boolean;
  
  // Customer Contact (optional)
  customer_email: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  
  // Status Tracking
  status: OfferStatus;
  status_notes: string | null;
  
  // CRM Integration
  crm_lead_id: string | null;
  crm_synced_at: string | null;
  
  // Metadata
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  source: string;
}

export type OfferStatus = 
  | 'pending'      // Offer generated, awaiting customer action
  | 'viewed'       // Customer viewed the offer
  | 'emailed'      // Offer emailed to customer
  | 'scheduled'    // Appointment scheduled
  | 'inspected'    // Vehicle inspected in person
  | 'accepted'     // Customer accepted offer
  | 'rejected'     // Customer rejected offer
  | 'expired'      // Offer expired
  | 'completed';   // Transaction completed

// =============================================================================
// CREATE/UPDATE DTOs
// =============================================================================

export interface CreateOfferInput {
  // Vehicle Information
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  body_class?: string | null;
  drive_type?: string | null;
  engine_cylinders?: string | null;
  engine_displacement?: string | null;
  fuel_type?: string | null;
  transmission_style?: string | null;
  
  // Vehicle Basics
  mileage: number;
  zip_code?: string | null;
  color?: string | null;
  sell_or_trade?: 'sell' | 'trade' | 'not-sure' | null;
  loan_or_lease?: 'loan' | 'lease' | 'neither' | null;
  
  // Condition
  overall_condition?: string | null;
  accident_history?: string | null;
  drivability?: string | null;
  mechanical_issues?: string[] | null;
  engine_issues?: string[] | null;
  exterior_damage?: string[] | null;
  interior_damage?: string[] | null;
  
  // Offer Details
  estimated_value: number;
  offer_amount: number;
  offer_expiry: string;
  is_preliminary?: boolean;
  
  // Customer Contact (optional)
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_name?: string | null;
  
  // Metadata
  ip_address?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
  source?: string;
}

export interface UpdateOfferInput {
  status?: OfferStatus;
  status_notes?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_name?: string | null;
  crm_lead_id?: string | null;
  crm_synced_at?: string | null;
  offer_amount?: number;
}

// =============================================================================
// QUERY PARAMS
// =============================================================================

export interface OfferQueryParams {
  page?: number;
  limit?: number;
  status?: OfferStatus | OfferStatus[];
  vin?: string;
  email?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  sort_by?: 'created_at' | 'offer_amount' | 'status';
  sort_order?: 'asc' | 'desc';
}

export interface OfferListResponse {
  offers: OfferRecord[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =============================================================================
// ANALYTICS
// =============================================================================

export interface OfferAnalytics {
  total_offers: number;
  total_value: number;
  average_offer: number;
  offers_by_status: Record<OfferStatus, number>;
  offers_by_day: { date: string; count: number; total_value: number }[];
  top_makes: { make: string; count: number }[];
  conversion_rate: number;
}

// =============================================================================
// SUPABASE SQL SCHEMA
// =============================================================================

/**
 * Run this SQL in Supabase SQL Editor to create the offers table:
 * 
 * ```sql
 * -- Enable UUID extension
 * CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
 * 
 * -- Create offers table
 * CREATE TABLE offers (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW(),
 *   
 *   -- Vehicle Information
 *   vin VARCHAR(17) NOT NULL,
 *   year INTEGER NOT NULL,
 *   make VARCHAR(50) NOT NULL,
 *   model VARCHAR(100) NOT NULL,
 *   trim VARCHAR(100),
 *   body_class VARCHAR(100),
 *   drive_type VARCHAR(50),
 *   engine_cylinders VARCHAR(10),
 *   engine_displacement VARCHAR(20),
 *   fuel_type VARCHAR(50),
 *   transmission_style VARCHAR(50),
 *   
 *   -- Vehicle Basics
 *   mileage INTEGER NOT NULL,
 *   zip_code VARCHAR(10),
 *   color VARCHAR(50),
 *   sell_or_trade VARCHAR(20),
 *   loan_or_lease VARCHAR(20),
 *   
 *   -- Condition
 *   overall_condition VARCHAR(50),
 *   accident_history VARCHAR(20),
 *   drivability VARCHAR(20),
 *   mechanical_issues TEXT[],
 *   engine_issues TEXT[],
 *   exterior_damage TEXT[],
 *   interior_damage TEXT[],
 *   
 *   -- Offer Details
 *   estimated_value INTEGER NOT NULL,
 *   offer_amount INTEGER NOT NULL,
 *   offer_expiry TIMESTAMPTZ NOT NULL,
 *   is_preliminary BOOLEAN DEFAULT TRUE,
 *   
 *   -- Customer Contact
 *   customer_email VARCHAR(254),
 *   customer_phone VARCHAR(20),
 *   customer_name VARCHAR(100),
 *   
 *   -- Status Tracking
 *   status VARCHAR(20) DEFAULT 'pending',
 *   status_notes TEXT,
 *   
 *   -- CRM Integration
 *   crm_lead_id VARCHAR(100),
 *   crm_synced_at TIMESTAMPTZ,
 *   
 *   -- Metadata
 *   ip_address VARCHAR(45),
 *   user_agent VARCHAR(500),
 *   session_id UUID,
 *   source VARCHAR(50) DEFAULT 'website'
 * );
 * 
 * -- Create indexes
 * CREATE INDEX idx_offers_vin ON offers(vin);
 * CREATE INDEX idx_offers_status ON offers(status);
 * CREATE INDEX idx_offers_created_at ON offers(created_at DESC);
 * CREATE INDEX idx_offers_customer_email ON offers(customer_email);
 * CREATE INDEX idx_offers_offer_amount ON offers(offer_amount);
 * 
 * -- Create updated_at trigger
 * CREATE OR REPLACE FUNCTION update_updated_at_column()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   NEW.updated_at = NOW();
 *   RETURN NEW;
 * END;
 * $$ language 'plpgsql';
 * 
 * CREATE TRIGGER update_offers_updated_at
 *   BEFORE UPDATE ON offers
 *   FOR EACH ROW
 *   EXECUTE FUNCTION update_updated_at_column();
 * 
 * -- Enable Row Level Security
 * ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
 * 
 * -- Policy for service role (full access)
 * CREATE POLICY "Service role has full access" ON offers
 *   FOR ALL
 *   TO service_role
 *   USING (true)
 *   WITH CHECK (true);
 * 
 * -- Policy for anon role (insert only for new offers)
 * CREATE POLICY "Anyone can create offers" ON offers
 *   FOR INSERT
 *   TO anon
 *   WITH CHECK (true);
 * ```
 */
