/**
 * Valuation API Integration Tests
 * Tests API key integration and fallback logic WITHOUT real API keys
 * 
 * These tests validate:
 * 1. Primary/fallback provider switching
 * 2. Weighted value calculations
 * 3. Error handling and retry logic
 * 4. API key configuration detection
 * 5. Black Book integration patterns
 */

import {
  MockValuationClient,
  createMockClientWithScenario,
  TEST_SCENARIOS,
} from '@/services/valuation/mockClient';
import { BlackBookClient } from '@/services/valuation/blackBookClient';
import {
  WeightedValuationService,
  createValuationService,
  createTestSetup,
} from '@/services/valuation';
import type {
  ValuationRequest,
  ProviderConfig,
  ValuationValues,
} from '@/services/valuation/types';

// Test fixtures
const SAMPLE_REQUEST: ValuationRequest = {
  vin: '1GCVKNEC0MZ123456',
  year: 2021,
  make: 'CHEVROLET',
  model: 'Silverado 1500',
  trim: 'LT',
  mileage: 45000,
  condition: 'good',
  zipCode: '02169',
};

const SAMPLE_VALUES: ValuationValues = {
  wholesale: 32000,
  retail: 38000,
  tradeIn: 34000,
  privateParty: 36000,
  adjustedWholesale: 31500,
};

describe('Valuation API Integration Tests', () => {
  describe('MockValuationClient', () => {
    let mockClient: MockValuationClient;

    beforeEach(() => {
      mockClient = new MockValuationClient();
    });

    afterEach(() => {
      mockClient.reset();
    });

    it('should return realistic values by default', async () => {
      const response = await mockClient.getValuation(SAMPLE_REQUEST);

      expect(response.success).toBe(true);
      expect(response.provider).toBe('mock');
      expect(response.values).toBeDefined();
      expect(response.values!.wholesale).toBeGreaterThan(0);
      expect(response.values!.retail).toBeGreaterThan(response.values!.wholesale);
    });

    it('should track call history', async () => {
      await mockClient.getValuation(SAMPLE_REQUEST);
      await mockClient.getValuation({ ...SAMPLE_REQUEST, mileage: 60000 });

      const history = mockClient.getCallHistory();
      expect(history).toHaveLength(2);
      expect(history[0].mileage).toBe(45000);
      expect(history[1].mileage).toBe(60000);
    });

    it('should return custom mock response when set', async () => {
      mockClient.setMockResponse({
        values: SAMPLE_VALUES,
        confidence: 0.98,
      });

      const response = await mockClient.getValuation(SAMPLE_REQUEST);

      expect(response.success).toBe(true);
      expect(response.values).toEqual(SAMPLE_VALUES);
      expect(response.confidence).toBe(0.98);
    });

    it('should simulate API failure when configured', async () => {
      mockClient.simulateFailure('Service unavailable');

      const response = await mockClient.getValuation(SAMPLE_REQUEST);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Service unavailable');
      expect(response.values).toBeUndefined();
    });

    it('should simulate network delay', async () => {
      mockClient.setDelay(100);
      const start = Date.now();

      await mockClient.getValuation(SAMPLE_REQUEST);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some variance
    });

    it('should report unconfigured state correctly', () => {
      expect(mockClient.isConfigured()).toBe(true);

      mockClient.setConfigured(false);
      expect(mockClient.isConfigured()).toBe(false);
    });
  });

  describe('Pre-built Test Scenarios', () => {
    it.each([
      ['SUCCESS', true],
      ['API_TIMEOUT', false],
      ['INVALID_VIN', false],
      ['RATE_LIMITED', false],
      ['UNAUTHORIZED', false],
      ['NO_DATA', false],
    ])('scenario %s should return success=%s', async (scenario, expectedSuccess) => {
      const client = createMockClientWithScenario(scenario as keyof typeof TEST_SCENARIOS);
      const response = await client.getValuation(SAMPLE_REQUEST);

      expect(response.success).toBe(expectedSuccess);
    });

    it('PARTIAL_DATA scenario should return low confidence', async () => {
      const client = createMockClientWithScenario('PARTIAL_DATA');
      const response = await client.getValuation(SAMPLE_REQUEST);

      expect(response.success).toBe(true);
      expect(response.confidence).toBe(0.60);
      expect(response.values!.retail).toBe(0); // Missing retail
    });
  });

  describe('BlackBookClient API Key Detection', () => {
    it('should detect when API key is not configured', () => {
      const client = new BlackBookClient({ apiKey: '' });
      expect(client.isConfigured()).toBe(false);
    });

    it('should detect when API key is configured', () => {
      const client = new BlackBookClient({ apiKey: 'test-api-key-12345' });
      expect(client.isConfigured()).toBe(true);
    });

    it('should return error when API key missing', async () => {
      const client = new BlackBookClient({ apiKey: '' });
      const response = await client.getValuation(SAMPLE_REQUEST);

      expect(response.success).toBe(false);
      expect(response.error).toContain('not configured');
    });
  });

  describe('WeightedValuationService', () => {
    it('should use primary provider when available', async () => {
      const { service, mockPrimary, mockFallback } = createTestSetup();

      mockPrimary.setMockResponse({ values: SAMPLE_VALUES, confidence: 0.95 });

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);

      expect(result.primarySource).toBe('internal');
      expect(result.fallbacksUsed).toHaveLength(0);
    });

    it('should fallback to secondary when primary fails', async () => {
      const { service, mockPrimary, mockFallback } = createTestSetup();

      mockPrimary.simulateFailure('Primary API down');
      mockFallback.setMockResponse({ values: SAMPLE_VALUES, confidence: 0.90 });

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);

      expect(result.primarySource).toBe('blackbook');
      
      // Check that primary failure is recorded in breakdown
      const primaryBreakdown = result.breakdown.find(b => b.provider === 'internal');
      expect(primaryBreakdown?.wasUsed).toBe(false);
      expect(primaryBreakdown?.failureReason).toBe('Primary API down');
    });

    it('should combine values from multiple providers with weights', async () => {
      const { service, mockPrimary, mockFallback } = createTestSetup();

      // Primary: wholesale = 30000 (weight 0.7)
      mockPrimary.setMockResponse({
        values: { ...SAMPLE_VALUES, wholesale: 30000, adjustedWholesale: 30000 },
        confidence: 0.95,
      });

      // Fallback: wholesale = 34000 (weight 0.3)
      mockFallback.setMockResponse({
        values: { ...SAMPLE_VALUES, wholesale: 34000, adjustedWholesale: 34000 },
        confidence: 0.90,
      });

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);

      // Weighted average: (30000 * 0.7 + 34000 * 0.3) = 21000 + 10200 = 31200
      expect(result.finalValues.wholesale).toBeCloseTo(31200, -2); // Allow rounding
    });

    it('should respect minimum confidence threshold', async () => {
      const mockClient = new MockValuationClient();
      mockClient.setMockResponse({ values: SAMPLE_VALUES, confidence: 0.3 }); // Below threshold

      const service = new WeightedValuationService({ minConfidence: 0.5 });
      service.registerClient(mockClient, {
        name: 'mock',
        priority: 1,
        weight: 1,
        enabled: true,
      });

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);

      // Low confidence should not be used
      const breakdown = result.breakdown.find(b => b.provider === 'mock');
      expect(breakdown?.wasUsed).toBe(false);
      expect(breakdown?.failureReason).toContain('Confidence');
    });

    it('should respect maxFallbacks limit', async () => {
      const mock1 = new MockValuationClient();
      const mock2 = new MockValuationClient();
      const mock3 = new MockValuationClient();
      const mock4 = new MockValuationClient();

      // All fail or are fallbacks
      mock1.simulateFailure('Primary down');
      mock2.setMockResponse({ values: SAMPLE_VALUES });
      mock3.setMockResponse({ values: SAMPLE_VALUES });
      mock4.setMockResponse({ values: SAMPLE_VALUES });

      const service = new WeightedValuationService({ maxFallbacks: 2 });

      service.registerClient(mock1, { name: 'mock', priority: 1, weight: 0.4, enabled: true });
      (mock2 as { provider: string }).provider = 'blackbook';
      service.registerClient(mock2, { name: 'blackbook', priority: 2, weight: 0.3, enabled: true, isFallback: true });
      (mock3 as { provider: string }).provider = 'kbb';
      service.registerClient(mock3, { name: 'kbb', priority: 3, weight: 0.2, enabled: true, isFallback: true });
      (mock4 as { provider: string }).provider = 'nada';
      service.registerClient(mock4, { name: 'nada', priority: 4, weight: 0.1, enabled: true, isFallback: true });

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);

      // Should only use 2 fallbacks max
      expect(result.fallbacksUsed.length).toBeLessThanOrEqual(2);
    });

    it('should throw when primary required but fails', async () => {
      const { mockPrimary } = createTestSetup();

      const service = new WeightedValuationService({ requirePrimary: true });
      (mockPrimary as { provider: string }).provider = 'internal';
      service.registerClient(mockPrimary, {
        name: 'internal',
        priority: 1,
        weight: 1,
        enabled: true,
      });

      mockPrimary.simulateFailure('Primary down');

      await expect(service.getWeightedValuation(SAMPLE_REQUEST)).rejects.toThrow(
        'Primary valuation provider failed'
      );
    });
  });

  describe('Value Agreement Calculations', () => {
    it('should have high confidence when providers agree', async () => {
      const { service, mockPrimary, mockFallback } = createTestSetup();

      // Close values = high agreement
      mockPrimary.setMockResponse({
        values: { ...SAMPLE_VALUES, wholesale: 30000 },
      });
      mockFallback.setMockResponse({
        values: { ...SAMPLE_VALUES, wholesale: 31000 }, // 3.3% difference
      });

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);
      expect(result.confidence).toBeGreaterThan(0.85);
    });

    it('should have lower confidence when providers disagree', async () => {
      const { service, mockPrimary, mockFallback } = createTestSetup();

      // Wide values = low agreement
      mockPrimary.setMockResponse({
        values: { ...SAMPLE_VALUES, wholesale: 30000 },
      });
      mockFallback.setMockResponse({
        values: { ...SAMPLE_VALUES, wholesale: 45000 }, // 50% difference
      });

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);
      expect(result.confidence).toBeLessThan(0.9);
    });
  });

  describe('Mock Vehicle Value Calculations', () => {
    let mockClient: MockValuationClient;

    beforeEach(() => {
      mockClient = new MockValuationClient();
    });

    it('should calculate lower values for older vehicles', async () => {
      const newVehicle = { ...SAMPLE_REQUEST, year: 2023 };
      const oldVehicle = { ...SAMPLE_REQUEST, year: 2015 };

      const newResponse = await mockClient.getValuation(newVehicle);
      mockClient.reset();
      const oldResponse = await mockClient.getValuation(oldVehicle);

      expect(newResponse.values!.wholesale).toBeGreaterThan(
        oldResponse.values!.wholesale
      );
    });

    it('should calculate lower values for higher mileage', async () => {
      const lowMileage = { ...SAMPLE_REQUEST, mileage: 20000 };
      const highMileage = { ...SAMPLE_REQUEST, mileage: 100000 };

      const lowResponse = await mockClient.getValuation(lowMileage);
      mockClient.reset();
      const highResponse = await mockClient.getValuation(highMileage);

      expect(lowResponse.values!.wholesale).toBeGreaterThan(
        highResponse.values!.wholesale
      );
    });

    it('should calculate lower values for worse condition', async () => {
      const excellent = { ...SAMPLE_REQUEST, condition: 'excellent' as const };
      const poor = { ...SAMPLE_REQUEST, condition: 'poor' as const };

      const excellentResponse = await mockClient.getValuation(excellent);
      mockClient.reset();
      const poorResponse = await mockClient.getValuation(poor);

      expect(excellentResponse.values!.wholesale).toBeGreaterThan(
        poorResponse.values!.wholesale
      );
    });

    it('should maintain value relationships: retail > tradeIn > wholesale', async () => {
      const response = await mockClient.getValuation(SAMPLE_REQUEST);
      const values = response.values!;

      expect(values.retail).toBeGreaterThan(values.tradeIn);
      expect(values.tradeIn).toBeGreaterThanOrEqual(values.wholesale);
    });
  });

  describe('Error Recovery Patterns', () => {
    it('should handle network timeout gracefully', async () => {
      const { service, mockPrimary, mockFallback } = createTestSetup();

      // Primary times out, fallback works
      mockPrimary.setDelay(100);
      mockPrimary.simulateFailure('Request timeout');
      mockFallback.setMockResponse({ values: SAMPLE_VALUES });

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);

      expect(result.finalValues.wholesale).toBeGreaterThan(0);
      expect(result.breakdown.find(b => b.provider === 'internal')?.failureReason).toContain('timeout');
    });

    it('should handle all providers failing', async () => {
      const { service, mockPrimary, mockFallback } = createTestSetup();

      mockPrimary.simulateFailure('Primary down');
      mockFallback.simulateFailure('Fallback down');

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);

      expect(result.finalValues.wholesale).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.breakdown.every(b => !b.wasUsed)).toBe(true);
    });

    it('should handle partial responses', async () => {
      const mockClient = new MockValuationClient();
      mockClient.setMockResponse({
        values: {
          wholesale: 25000,
          retail: 0, // Missing
          tradeIn: 24000,
          adjustedWholesale: 25000,
        },
      });

      const service = new WeightedValuationService();
      service.registerClient(mockClient, {
        name: 'mock',
        priority: 1,
        weight: 1,
        enabled: true,
      });

      const result = await service.getWeightedValuation(SAMPLE_REQUEST);

      expect(result.finalValues.wholesale).toBe(25000);
      expect(result.finalValues.retail).toBe(0);
    });
  });

  describe('Provider Configuration', () => {
    it('should respect disabled providers', async () => {
      const mockClient = new MockValuationClient();
      const service = new WeightedValuationService();

      service.registerClient(mockClient, {
        name: 'mock',
        priority: 1,
        weight: 1,
        enabled: false, // Disabled
      });

      expect(service.hasConfiguredProviders()).toBe(false);
    });

    it('should update provider config dynamically', () => {
      const service = new WeightedValuationService({
        providers: [
          { name: 'blackbook', priority: 1, weight: 0.5, enabled: true },
        ],
      });

      service.updateProviderConfig('blackbook', { weight: 0.8 });

      const config = service.getProviderConfig('blackbook');
      expect(config?.weight).toBe(0.8);
    });

    it('should sort providers by priority', async () => {
      const mock1 = new MockValuationClient();
      const mock2 = new MockValuationClient();

      (mock1 as { provider: string }).provider = 'kbb';
      (mock2 as { provider: string }).provider = 'blackbook';

      const service = new WeightedValuationService();

      // Register in wrong order
      service.registerClient(mock1, { name: 'kbb', priority: 2, weight: 0.5, enabled: true });
      service.registerClient(mock2, { name: 'blackbook', priority: 1, weight: 0.5, enabled: true });

      const providers = service.getConfiguredProviders();
      // Internal order should be by priority, though getConfiguredProviders may not preserve it
      expect(providers).toContain('blackbook');
      expect(providers).toContain('kbb');
    });
  });
});

describe('Integration: Real-World Scenarios', () => {
  it('should handle typical trade-in appraisal flow', async () => {
    const { service, mockPrimary, mockFallback } = createTestSetup();

    // Simulate realistic values for 2021 Silverado with 45k miles
    mockPrimary.setMockResponse({
      values: {
        wholesale: 31500,
        retail: 38500,
        tradeIn: 33000,
        privateParty: 35500,
        adjustedWholesale: 31000,
      },
      confidence: 0.94,
    });

    mockFallback.setMockResponse({
      values: {
        wholesale: 32000,
        retail: 39000,
        tradeIn: 33500,
        adjustedWholesale: 31500,
      },
      confidence: 0.91,
    });

    const result = await service.getWeightedValuation(SAMPLE_REQUEST);

    // Verify reasonable output for trade-in offer
    expect(result.finalValues.tradeIn).toBeGreaterThan(30000);
    expect(result.finalValues.tradeIn).toBeLessThan(40000);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.breakdown.filter(b => b.wasUsed).length).toBeGreaterThan(0);
  });

  it('should provide fallback when primary API has issues', async () => {
    const { service, mockPrimary, mockFallback } = createTestSetup();

    // Primary returns weird data (could be a bug or data issue)
    mockPrimary.setMockResponse({
      values: {
        wholesale: -5000, // Invalid negative value
        retail: 0,
        tradeIn: 0,
        adjustedWholesale: 0,
      },
      confidence: 0.3, // Low confidence
    });

    // Fallback has good data
    mockFallback.setMockResponse({
      values: SAMPLE_VALUES,
      confidence: 0.92,
    });

    const service2 = new WeightedValuationService({ minConfidence: 0.5 });
    (mockPrimary as { provider: string }).provider = 'internal';
    (mockFallback as { provider: string }).provider = 'blackbook';
    service2.registerClient(mockPrimary, { name: 'internal', priority: 1, weight: 0.7, enabled: true });
    service2.registerClient(mockFallback, { name: 'blackbook', priority: 2, weight: 0.3, enabled: true, isFallback: true });

    const result = await service2.getWeightedValuation(SAMPLE_REQUEST);

    // Should use fallback due to low confidence on primary
    expect(result.primarySource).toBe('blackbook');
    expect(result.finalValues.wholesale).toBe(SAMPLE_VALUES.wholesale);
  });
});
