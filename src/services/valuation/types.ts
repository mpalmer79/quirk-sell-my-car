/**
 * Valuation Service Types
 * Supports multiple valuation providers with primary/fallback logic
 */

export interface ValuationRequest {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  condition: ValuationCondition;
  zipCode?: string;
}

export type ValuationCondition = 
  | 'excellent'   // like-new
  | 'good'        // pretty-great
  | 'fair'        // just-okay
  | 'poor'        // kind-of-rough
  | 'salvage';    // major-issues

export interface ValuationResponse {
  provider: ValuationProvider;
  success: boolean;
  values?: ValuationValues;
  error?: string;
  timestamp: string;
  requestId?: string;
  confidence?: number; // 0-1 scale
}

export interface ValuationValues {
  wholesale: number;      // Auction/trade-in value
  retail: number;         // Dealer retail price
  tradeIn: number;        // Consumer trade-in
  privateParty?: number;  // Private sale value
  adjustedWholesale: number; // After condition/mileage adjustments
}

export type ValuationProvider = 
  | 'blackbook'
  | 'kbb'
  | 'nada'
  | 'manheim'
  | 'internal'  // Your primary evaluator
  | 'mock';     // For testing

export interface ProviderConfig {
  name: ValuationProvider;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  priority: number;       // Lower = higher priority (1 = primary)
  weight: number;         // 0-1, how much this source contributes
  enabled: boolean;
  isFallback?: boolean;
}

export interface WeightedValuation {
  finalValues: ValuationValues;
  breakdown: ProviderBreakdown[];
  confidence: number;
  primarySource: ValuationProvider;
  fallbacksUsed: ValuationProvider[];
}

export interface ProviderBreakdown {
  provider: ValuationProvider;
  weight: number;
  values: ValuationValues;
  wasUsed: boolean;
  failureReason?: string;
}

// API client interface - all providers must implement this
export interface ValuationClient {
  provider: ValuationProvider;
  isConfigured(): boolean;
  getValuation(request: ValuationRequest): Promise<ValuationResponse>;
}

// Condition mapping helper
export const CONDITION_MAP: Record<string, ValuationCondition> = {
  'like-new': 'excellent',
  'pretty-great': 'good',
  'just-okay': 'fair',
  'kind-of-rough': 'poor',
  'major-issues': 'salvage',
};
