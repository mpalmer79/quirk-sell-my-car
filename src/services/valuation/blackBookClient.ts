/**
 * Black Book Valuation Client
 * Integrates with Black Book API for vehicle valuations
 * 
 * API Documentation: https://www.blackbook.com/api/
 * 
 * Environment Variables:
 *   BLACKBOOK_API_KEY - Your Black Book API key
 *   BLACKBOOK_API_URL - API base URL (optional, defaults to production)
 */

import {
  ValuationClient,
  ValuationRequest,
  ValuationResponse,
  ValuationValues,
  ValuationCondition,
} from './types';

// Black Book condition codes
const BB_CONDITION_MAP: Record<ValuationCondition, string> = {
  'excellent': 'XCLEAN',
  'good': 'CLEAN',
  'fair': 'AVG',
  'poor': 'ROUGH',
  'salvage': 'DAMAGE',
};

// Black Book API response structure (based on typical API patterns)
interface BlackBookAPIResponse {
  success: boolean;
  error_code?: string;
  error_message?: string;
  vehicle?: {
    vin: string;
    year: number;
    make: string;
    model: string;
    style?: string;
  };
  values?: {
    wholesale_avg: number;
    wholesale_rough: number;
    wholesale_clean: number;
    retail_avg: number;
    retail_clean: number;
    tradein_avg: number;
    tradein_clean: number;
    adjustments?: {
      mileage: number;
      condition: number;
      regional: number;
    };
  };
  request_id?: string;
}

export class BlackBookClient implements ValuationClient {
  provider: 'blackbook' = 'blackbook';
  
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config?: {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
  }) {
    this.apiKey = config?.apiKey ?? process.env.BLACKBOOK_API_KEY ?? '';
    this.baseUrl = config?.baseUrl ?? process.env.BLACKBOOK_API_URL ?? 'https://api.blackbook.com/v2';
    this.timeout = config?.timeout ?? 30000;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async getValuation(request: ValuationRequest): Promise<ValuationResponse> {
    if (!this.isConfigured()) {
      return {
        provider: 'blackbook',
        success: false,
        error: 'Black Book API key not configured',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const response = await this.callAPI(request);
      return this.parseResponse(response);
    } catch (error) {
      return {
        provider: 'blackbook',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async callAPI(request: ValuationRequest): Promise<BlackBookAPIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = this.buildRequestUrl(request);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildRequestUrl(request: ValuationRequest): string {
    const params = new URLSearchParams({
      vin: request.vin,
      mileage: request.mileage.toString(),
      condition: BB_CONDITION_MAP[request.condition] ?? 'AVG',
    });

    if (request.zipCode) {
      params.append('zip', request.zipCode);
    }

    return `${this.baseUrl}/valuation?${params.toString()}`;
  }

  private parseResponse(apiResponse: BlackBookAPIResponse): ValuationResponse {
    if (!apiResponse.success || !apiResponse.values) {
      return {
        provider: 'blackbook',
        success: false,
        error: apiResponse.error_message ?? 'No valuation data returned',
        timestamp: new Date().toISOString(),
        requestId: apiResponse.request_id,
      };
    }

    const values = apiResponse.values;
    
    // Calculate adjusted wholesale based on condition
    let adjustedWholesale = values.wholesale_avg;
    if (values.adjustments) {
      adjustedWholesale += values.adjustments.mileage;
      adjustedWholesale += values.adjustments.condition;
      adjustedWholesale += values.adjustments.regional;
    }

    const parsedValues: ValuationValues = {
      wholesale: values.wholesale_avg,
      retail: values.retail_avg,
      tradeIn: values.tradein_avg,
      adjustedWholesale: Math.round(adjustedWholesale),
    };

    return {
      provider: 'blackbook',
      success: true,
      values: parsedValues,
      timestamp: new Date().toISOString(),
      requestId: apiResponse.request_id,
      confidence: 0.92, // Black Book typically high confidence
    };
  }
}

/**
 * Create a testable Black Book client that can be injected with mocks
 */
export function createBlackBookClient(
  fetchImpl?: typeof fetch,
  config?: { apiKey?: string; baseUrl?: string; timeout?: number }
): BlackBookClient {
  // For testing, we can inject a mock fetch
  if (fetchImpl) {
    const originalFetch = global.fetch;
    global.fetch = fetchImpl;
    const client = new BlackBookClient(config);
    global.fetch = originalFetch;
    return client;
  }
  
  return new BlackBookClient(config);
}
