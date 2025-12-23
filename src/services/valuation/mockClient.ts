/**
 * Mock Valuation Client
 * Simulates API responses for testing without real API keys
 * 
 * Usage in tests:
 *   const mockClient = new MockValuationClient();
 *   mockClient.setMockResponse({ ... });  // Set expected response
 *   mockClient.simulateFailure('API timeout');  // Test failure handling
 */

import {
  ValuationClient,
  ValuationRequest,
  ValuationResponse,
  ValuationValues,
  ValuationProvider,
} from './types';

export interface MockScenario {
  name: string;
  response?: Partial<ValuationResponse>;
  shouldFail?: boolean;
  failureMessage?: string;
  delay?: number;  // Simulate network latency
}

// Realistic base values by body type for mock responses
const BASE_VALUES: Record<string, number> = {
  'pickup': 38000,
  'truck': 38000,
  'suv': 35000,
  'sedan': 25000,
  'coupe': 28000,
  'van': 30000,
  'wagon': 27000,
  'default': 30000,
};

// Depreciation curve by age
const DEPRECIATION_BY_YEAR: Record<number, number> = {
  0: 1.0,
  1: 0.85,
  2: 0.78,
  3: 0.72,
  4: 0.66,
  5: 0.60,
  6: 0.55,
  7: 0.50,
  8: 0.45,
  9: 0.40,
  10: 0.35,
};

export class MockValuationClient implements ValuationClient {
  provider: ValuationProvider = 'mock';
  
  private mockResponse: Partial<ValuationResponse> | null = null;
  private shouldFail: boolean = false;
  private failureMessage: string = '';
  private simulatedDelay: number = 0;
  private callHistory: ValuationRequest[] = [];
  private configured: boolean = true;

  /**
   * Set a custom mock response for testing
   */
  setMockResponse(response: Partial<ValuationResponse>): void {
    this.mockResponse = response;
    this.shouldFail = false;
  }

  /**
   * Configure the mock to simulate API failure
   */
  simulateFailure(message: string = 'Mock API failure'): void {
    this.shouldFail = true;
    this.failureMessage = message;
    this.mockResponse = null;
  }

  /**
   * Set simulated network delay
   */
  setDelay(ms: number): void {
    this.simulatedDelay = ms;
  }

  /**
   * Set whether client is configured (has API key)
   */
  setConfigured(configured: boolean): void {
    this.configured = configured;
  }

  /**
   * Reset to default state
   */
  reset(): void {
    this.mockResponse = null;
    this.shouldFail = false;
    this.failureMessage = '';
    this.simulatedDelay = 0;
    this.callHistory = [];
    this.configured = true;
  }

  /**
   * Get history of all requests made
   */
  getCallHistory(): ValuationRequest[] {
    return [...this.callHistory];
  }

  /**
   * Get last request made
   */
  getLastCall(): ValuationRequest | undefined {
    return this.callHistory[this.callHistory.length - 1];
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async getValuation(request: ValuationRequest): Promise<ValuationResponse> {
    this.callHistory.push({ ...request });

    // Simulate network delay
    if (this.simulatedDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.simulatedDelay));
    }

    // Return failure if configured to fail
    if (this.shouldFail) {
      return {
        provider: 'mock',
        success: false,
        error: this.failureMessage,
        timestamp: new Date().toISOString(),
      };
    }

    // Return custom response if set
    if (this.mockResponse) {
      return {
        provider: 'mock',
        success: true,
        timestamp: new Date().toISOString(),
        confidence: 0.95,
        ...this.mockResponse,
      } as ValuationResponse;
    }

    // Generate realistic default response based on request
    return this.generateRealisticResponse(request);
  }

  /**
   * Generate a realistic valuation based on vehicle data
   */
  private generateRealisticResponse(request: ValuationRequest): ValuationResponse {
    const values = this.calculateMockValues(request);
    
    return {
      provider: 'mock',
      success: true,
      values,
      timestamp: new Date().toISOString(),
      requestId: `mock-${Date.now()}`,
      confidence: 0.90,
    };
  }

  /**
   * Calculate mock values using realistic formulas
   */
  private calculateMockValues(request: ValuationRequest): ValuationValues {
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - request.year);
    
    // Get base value (would come from make/model in real API)
    const baseValue = this.getBaseValue(request);
    
    // Apply depreciation
    const depreciationRate = DEPRECIATION_BY_YEAR[Math.min(age, 10)] ?? 0.30;
    let adjustedValue = baseValue * depreciationRate;
    
    // Mileage adjustment
    const expectedMileage = age * 12000;
    const mileageDiff = request.mileage - expectedMileage;
    const mileageAdjustment = mileageDiff * 0.05;
    adjustedValue -= mileageAdjustment;
    
    // Condition adjustment
    const conditionMultipliers: Record<string, number> = {
      'excellent': 1.10,
      'good': 1.00,
      'fair': 0.90,
      'poor': 0.75,
      'salvage': 0.50,
    };
    adjustedValue *= conditionMultipliers[request.condition] ?? 1.0;
    
    // Ensure minimum value
    adjustedValue = Math.max(adjustedValue, 500);
    
    // Calculate different value types
    const wholesale = Math.round(adjustedValue * 0.85);
    const retail = Math.round(adjustedValue * 1.15);
    const tradeIn = Math.round(adjustedValue * 0.90);
    const privateParty = Math.round(adjustedValue);
    
    return {
      wholesale,
      retail,
      tradeIn,
      privateParty,
      adjustedWholesale: wholesale,
    };
  }

  private getBaseValue(request: ValuationRequest): number {
    const model = request.model.toLowerCase();
    
    // Check for specific vehicle types
    if (model.includes('silverado') || model.includes('f-150') || model.includes('ram')) {
      return BASE_VALUES['truck'];
    }
    if (model.includes('tahoe') || model.includes('explorer') || model.includes('4runner')) {
      return BASE_VALUES['suv'];
    }
    if (model.includes('camry') || model.includes('accord') || model.includes('civic')) {
      return BASE_VALUES['sedan'];
    }
    
    return BASE_VALUES['default'];
  }
}

// Pre-configured test scenarios
export const TEST_SCENARIOS: Record<string, MockScenario> = {
  SUCCESS: {
    name: 'Successful valuation',
    response: {
      success: true,
      confidence: 0.95,
    },
  },
  API_TIMEOUT: {
    name: 'API Timeout',
    shouldFail: true,
    failureMessage: 'Request timeout after 30000ms',
    delay: 100,
  },
  INVALID_VIN: {
    name: 'Invalid VIN',
    shouldFail: true,
    failureMessage: 'Invalid VIN format or VIN not found',
  },
  RATE_LIMITED: {
    name: 'Rate limited',
    shouldFail: true,
    failureMessage: 'Rate limit exceeded. Try again in 60 seconds.',
  },
  UNAUTHORIZED: {
    name: 'Invalid API key',
    shouldFail: true,
    failureMessage: 'Unauthorized: Invalid API key',
  },
  NO_DATA: {
    name: 'Vehicle not found',
    shouldFail: true,
    failureMessage: 'No valuation data available for this vehicle',
  },
  PARTIAL_DATA: {
    name: 'Partial data available',
    response: {
      success: true,
      confidence: 0.60,
      values: {
        wholesale: 15000,
        retail: 0,  // Missing retail
        tradeIn: 14000,
        adjustedWholesale: 15000,
      },
    },
  },
};

/**
 * Factory function to create mock client with specific scenario
 */
export function createMockClientWithScenario(scenarioName: keyof typeof TEST_SCENARIOS): MockValuationClient {
  const client = new MockValuationClient();
  const scenario = TEST_SCENARIOS[scenarioName];
  
  if (scenario.shouldFail) {
    client.simulateFailure(scenario.failureMessage);
  } else if (scenario.response) {
    client.setMockResponse(scenario.response);
  }
  
  if (scenario.delay) {
    client.setDelay(scenario.delay);
  }
  
  return client;
}
