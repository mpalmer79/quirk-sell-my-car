/**
 * Valuation Service Usage Examples
 * 
 * This file demonstrates how to:
 * 1. Configure primary + fallback providers
 * 2. Set up weights for combining values
 * 3. Handle errors gracefully
 * 4. Integrate with your existing VehicleContext
 */

import {
  WeightedValuationService,
  MockValuationClient,
  BlackBookClient,
  CONDITION_MAP,
  type ValuationRequest,
  type ProviderConfig,
} from '@/services/valuation';

// =================================================================
// EXAMPLE 1: Basic Setup with Primary + Fallback
// =================================================================

export function createProductionService(): WeightedValuationService {
  const service = new WeightedValuationService({
    minConfidence: 0.6,        // Require 60% confidence minimum
    requirePrimary: false,     // Don't fail if primary unavailable
    maxFallbacks: 2,           // Try up to 2 fallback providers
    combineSuccessful: true,   // Combine values from all successful providers
  });

  // Your primary valuation provider (e.g., internal algorithm or preferred API)
  // In production, replace MockValuationClient with your actual primary client
  const primaryClient = new MockValuationClient();
  (primaryClient as { provider: string }).provider = 'internal';
  
  service.registerClient(primaryClient, {
    name: 'internal',
    priority: 1,              // First to try
    weight: 0.7,              // 70% weight in final calculation
    enabled: true,
    isFallback: false,
  });

  // Black Book as fallback
  const blackBookClient = new BlackBookClient({
    apiKey: process.env.BLACKBOOK_API_KEY,
    timeout: 15000,
  });

  service.registerClient(blackBookClient, {
    name: 'blackbook',
    priority: 2,              // Try second if primary fails
    weight: 0.3,              // 30% weight when combined
    enabled: true,
    isFallback: true,
  });

  return service;
}

// =================================================================
// EXAMPLE 2: Using with VehicleContext Data
// =================================================================

interface VehicleContextData {
  vehicleInfo: {
    vin: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
  basics: {
    mileage?: number;
    zipCode?: string;
  };
  condition: {
    overallCondition?: string;
  };
}

export function createValuationRequest(data: VehicleContextData): ValuationRequest | null {
  if (!data.vehicleInfo || !data.basics.mileage) {
    return null;
  }

  const conditionKey = data.condition.overallCondition ?? 'fair';
  
  return {
    vin: data.vehicleInfo.vin,
    year: data.vehicleInfo.year,
    make: data.vehicleInfo.make,
    model: data.vehicleInfo.model,
    trim: data.vehicleInfo.trim,
    mileage: data.basics.mileage,
    condition: CONDITION_MAP[conditionKey] ?? 'fair',
    zipCode: data.basics.zipCode,
  };
}

// =================================================================
// EXAMPLE 3: Hook for React Components
// =================================================================

/**
 * Example React hook (not a real hook, just shows the pattern)
 * 
 * Usage in component:
 *   const { getValuation, isLoading, error, result } = useValuation();
 *   
 *   const handleSubmit = async () => {
 *     const result = await getValuation(vehicleData);
 *     if (result) {
 *       setOfferAmount(result.finalValues.tradeIn);
 *     }
 *   };
 */
export const valuationHookPattern = `
import { useState, useCallback, useRef } from 'react';
import { createProductionService, createValuationRequest } from './valuationUsage';
import type { WeightedValuation } from '@/services/valuation';

export function useValuation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WeightedValuation | null>(null);
  
  // Create service once
  const serviceRef = useRef(createProductionService());

  const getValuation = useCallback(async (vehicleData: VehicleContextData) => {
    const request = createValuationRequest(vehicleData);
    if (!request) {
      setError('Missing vehicle data');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const valuation = await serviceRef.current.getWeightedValuation(request);
      setResult(valuation);
      
      if (valuation.confidence < 0.5) {
        setError('Low confidence in valuation - manual review recommended');
      }
      
      return valuation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Valuation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getValuation, isLoading, error, result };
}
`;

// =================================================================
// EXAMPLE 4: Weight Configuration Strategies
// =================================================================

export const WEIGHT_STRATEGIES = {
  // Primary-focused: Trust your internal data most
  PRIMARY_HEAVY: {
    internal: { priority: 1, weight: 0.8 },
    blackbook: { priority: 2, weight: 0.2, isFallback: true },
  },

  // Balanced: Equal trust in both sources
  BALANCED: {
    internal: { priority: 1, weight: 0.5 },
    blackbook: { priority: 2, weight: 0.5, isFallback: true },
  },

  // Market-focused: Trust market data more
  MARKET_HEAVY: {
    blackbook: { priority: 1, weight: 0.7 },
    internal: { priority: 2, weight: 0.3, isFallback: true },
  },

  // Multi-source: Combine many providers
  MULTI_SOURCE: {
    internal: { priority: 1, weight: 0.4 },
    blackbook: { priority: 2, weight: 0.25, isFallback: true },
    kbb: { priority: 3, weight: 0.20, isFallback: true },
    nada: { priority: 4, weight: 0.15, isFallback: true },
  },
};

// =================================================================
// EXAMPLE 5: Error Handling Patterns
// =================================================================

export async function getValuationWithRetry(
  service: WeightedValuationService,
  request: ValuationRequest,
  maxRetries: number = 2
): Promise<{
  success: boolean;
  valuation?: Awaited<ReturnType<typeof service.getWeightedValuation>>;
  error?: string;
  attempts: number;
}> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const valuation = await service.getWeightedValuation(request);
      
      // Check if we got usable data
      if (valuation.finalValues.wholesale > 0) {
        return {
          success: true,
          valuation,
          attempts: attempt,
        };
      }
      
      // No usable data, treat as failure and retry
      lastError = new Error('No valid valuation data returned');
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error');
      
      // Wait before retry (exponential backoff)
      if (attempt <= maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message ?? 'Valuation failed after retries',
    attempts: maxRetries + 1,
  };
}

// =================================================================
// EXAMPLE 6: Logging and Monitoring
// =================================================================

export function logValuationResult(
  request: ValuationRequest,
  result: Awaited<ReturnType<WeightedValuationService['getWeightedValuation']>>
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    vin: request.vin,
    year: request.year,
    make: request.make,
    model: request.model,
    mileage: request.mileage,
    condition: request.condition,
    
    // Results
    primarySource: result.primarySource,
    fallbacksUsed: result.fallbacksUsed,
    confidence: result.confidence,
    wholesaleValue: result.finalValues.wholesale,
    tradeInValue: result.finalValues.tradeIn,
    
    // Breakdown
    providerResults: result.breakdown.map(b => ({
      provider: b.provider,
      wasUsed: b.wasUsed,
      wholesale: b.values.wholesale,
      failureReason: b.failureReason,
    })),
  };

  // In production, send to your logging service
  console.log('[Valuation]', JSON.stringify(logData, null, 2));
}

// =================================================================
// EXAMPLE 7: Testing Setup
// =================================================================

export function createTestingService(): {
  service: WeightedValuationService;
  mockPrimary: MockValuationClient;
  mockFallback: MockValuationClient;
} {
  const mockPrimary = new MockValuationClient();
  const mockFallback = new MockValuationClient();
  
  (mockPrimary as { provider: string }).provider = 'internal';
  (mockFallback as { provider: string }).provider = 'blackbook';

  const service = new WeightedValuationService({
    minConfidence: 0.5,
    combineSuccessful: true,
    requirePrimary: false,
    maxFallbacks: 2,
  });

  service.registerClient(mockPrimary, {
    name: 'internal',
    priority: 1,
    weight: 0.7,
    enabled: true,
  });

  service.registerClient(mockFallback, {
    name: 'blackbook',
    priority: 2,
    weight: 0.3,
    enabled: true,
    isFallback: true,
  });

  return { service, mockPrimary, mockFallback };
}

/**
 * Test example:
 * 
 * const { service, mockPrimary, mockFallback } = createTestingService();
 * 
 * // Test successful valuation
 * mockPrimary.setMockResponse({ values: { wholesale: 30000, ... } });
 * const result = await service.getWeightedValuation(request);
 * expect(result.finalValues.wholesale).toBeGreaterThan(0);
 * 
 * // Test fallback behavior
 * mockPrimary.simulateFailure('API down');
 * mockFallback.setMockResponse({ values: { wholesale: 28000, ... } });
 * const fallbackResult = await service.getWeightedValuation(request);
 * expect(fallbackResult.primarySource).toBe('blackbook');
 */
