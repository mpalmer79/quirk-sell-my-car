/**
 * Valuation Service
 * Multi-provider vehicle valuation with weighted fallbacks
 */

// Types
export type {
  ValuationRequest,
  ValuationResponse,
  ValuationValues,
  ValuationCondition,
  ValuationProvider,
  ValuationClient,
  ProviderConfig,
  WeightedValuation,
  ProviderBreakdown,
} from './types';

export { CONDITION_MAP } from './types';

// Clients
export { MockValuationClient, TEST_SCENARIOS, createMockClientWithScenario } from './mockClient';
export { BlackBookClient, createBlackBookClient } from './blackBookClient';

// Service
export { WeightedValuationService, createValuationService } from './weightedService';
export type { ValuationServiceConfig } from './weightedService';

/**
 * Quick setup for testing
 * 
 * @example
 * const { service, mockPrimary, mockFallback } = createTestSetup();
 * mockPrimary.simulateFailure('API down');
 * const result = await service.getWeightedValuation(request);
 * // Will use fallback since primary failed
 */
import { MockValuationClient } from './mockClient';
import { WeightedValuationService, createValuationService } from './weightedService';
import { ProviderConfig } from './types';

export function createTestSetup(): {
  service: WeightedValuationService;
  mockPrimary: MockValuationClient;
  mockFallback: MockValuationClient;
} {
  const mockPrimary = new MockValuationClient();
  (mockPrimary as { provider: string }).provider = 'internal'; // Rebrand as primary
  
  const mockFallback = new MockValuationClient();
  (mockFallback as { provider: string }).provider = 'blackbook'; // Rebrand as fallback
  
  const configs: ProviderConfig[] = [
    {
      name: 'internal',
      priority: 1,
      weight: 0.7,
      enabled: true,
      isFallback: false,
    },
    {
      name: 'blackbook',
      priority: 2,
      weight: 0.3,
      enabled: true,
      isFallback: true,
    },
  ];
  
  const service = createValuationService([mockPrimary, mockFallback], configs, {
    combineSuccessful: true,
    requirePrimary: false,
    maxFallbacks: 2,
    minConfidence: 0.5,
  });
  
  return { service, mockPrimary, mockFallback };
}
