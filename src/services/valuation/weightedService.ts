/**
 * Weighted Valuation Service
 * Combines multiple valuation providers with configurable weights
 * 
 * Strategy:
 *   1. Try primary provider first
 *   2. On failure, try fallbacks in order of priority
 *   3. If multiple succeed, calculate weighted average
 *   4. Return combined result with confidence score
 */

import {
  ValuationClient,
  ValuationRequest,
  ValuationResponse,
  ValuationValues,
  WeightedValuation,
  ProviderBreakdown,
  ProviderConfig,
  ValuationProvider,
} from './types';

export interface ValuationServiceConfig {
  providers: ProviderConfig[];
  minConfidence: number;           // Minimum confidence to accept result
  requirePrimary: boolean;         // If true, fail if primary fails
  maxFallbacks: number;            // Max fallbacks to try
  combineSuccessful: boolean;      // Combine all successful responses
}

const DEFAULT_CONFIG: ValuationServiceConfig = {
  providers: [],
  minConfidence: 0.5,
  requirePrimary: false,
  maxFallbacks: 2,
  combineSuccessful: true,
};

export class WeightedValuationService {
  private clients: Map<ValuationProvider, ValuationClient> = new Map();
  private config: ValuationServiceConfig;

  constructor(config: Partial<ValuationServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a valuation client
   */
  registerClient(client: ValuationClient, config: ProviderConfig): void {
    if (!config.enabled) return;
    
    this.clients.set(client.provider, client);
    
    // Update or add provider config
    const existingIndex = this.config.providers.findIndex(
      p => p.name === config.name
    );
    
    if (existingIndex >= 0) {
      this.config.providers[existingIndex] = config;
    } else {
      this.config.providers.push(config);
    }
    
    // Sort by priority
    this.config.providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get valuation using weighted provider strategy
   */
  async getWeightedValuation(request: ValuationRequest): Promise<WeightedValuation> {
    const results: ProviderBreakdown[] = [];
    const successfulProviders: ValuationProvider[] = [];
    const fallbacksUsed: ValuationProvider[] = [];
    
    let primarySource: ValuationProvider | null = null;
    let fallbackCount = 0;

    // Process providers in priority order
    for (const providerConfig of this.config.providers) {
      const client = this.clients.get(providerConfig.name);
      
      if (!client || !client.isConfigured()) {
        results.push({
          provider: providerConfig.name,
          weight: providerConfig.weight,
          values: this.emptyValues(),
          wasUsed: false,
          failureReason: 'Provider not configured',
        });
        continue;
      }

      // Check fallback limit
      if (providerConfig.isFallback && fallbackCount >= this.config.maxFallbacks) {
        continue;
      }

      try {
        const response = await client.getValuation(request);
        
        if (response.success && response.values) {
          // Check confidence threshold
          if ((response.confidence ?? 1) >= this.config.minConfidence) {
            results.push({
              provider: providerConfig.name,
              weight: providerConfig.weight,
              values: response.values,
              wasUsed: true,
            });
            
            successfulProviders.push(providerConfig.name);
            
            if (!primarySource) {
              primarySource = providerConfig.name;
            } else if (providerConfig.isFallback) {
              fallbacksUsed.push(providerConfig.name);
              fallbackCount++;
            }

            // If not combining, stop after first success
            if (!this.config.combineSuccessful) {
              break;
            }
          } else {
            results.push({
              provider: providerConfig.name,
              weight: providerConfig.weight,
              values: response.values,
              wasUsed: false,
              failureReason: `Confidence ${response.confidence} below threshold ${this.config.minConfidence}`,
            });
          }
        } else {
          results.push({
            provider: providerConfig.name,
            weight: providerConfig.weight,
            values: this.emptyValues(),
            wasUsed: false,
            failureReason: response.error ?? 'Unknown error',
          });

          if (providerConfig.isFallback) {
            fallbackCount++;
          }
        }
      } catch (error) {
        results.push({
          provider: providerConfig.name,
          weight: providerConfig.weight,
          values: this.emptyValues(),
          wasUsed: false,
          failureReason: error instanceof Error ? error.message : 'Exception occurred',
        });

        if (providerConfig.isFallback) {
          fallbackCount++;
        }
      }
    }

    // Check if primary is required
    if (this.config.requirePrimary && !primarySource) {
      throw new Error('Primary valuation provider failed and is required');
    }

    // Calculate weighted final values
    const finalValues = this.calculateWeightedValues(results);
    const confidence = this.calculateConfidence(results, successfulProviders);

    return {
      finalValues,
      breakdown: results,
      confidence,
      primarySource: primarySource ?? 'internal',
      fallbacksUsed,
    };
  }

  /**
   * Calculate weighted average of all successful valuations
   */
  private calculateWeightedValues(results: ProviderBreakdown[]): ValuationValues {
    const usedResults = results.filter(r => r.wasUsed);
    
    if (usedResults.length === 0) {
      return this.emptyValues();
    }

    // Normalize weights
    const totalWeight = usedResults.reduce((sum, r) => sum + r.weight, 0);
    
    if (totalWeight === 0) {
      // Equal weighting if no weights specified
      const count = usedResults.length;
      return {
        wholesale: Math.round(usedResults.reduce((sum, r) => sum + r.values.wholesale, 0) / count),
        retail: Math.round(usedResults.reduce((sum, r) => sum + r.values.retail, 0) / count),
        tradeIn: Math.round(usedResults.reduce((sum, r) => sum + r.values.tradeIn, 0) / count),
        privateParty: Math.round(usedResults.reduce((sum, r) => sum + (r.values.privateParty ?? 0), 0) / count) || undefined,
        adjustedWholesale: Math.round(usedResults.reduce((sum, r) => sum + r.values.adjustedWholesale, 0) / count),
      };
    }

    return {
      wholesale: Math.round(
        usedResults.reduce((sum, r) => sum + (r.values.wholesale * r.weight / totalWeight), 0)
      ),
      retail: Math.round(
        usedResults.reduce((sum, r) => sum + (r.values.retail * r.weight / totalWeight), 0)
      ),
      tradeIn: Math.round(
        usedResults.reduce((sum, r) => sum + (r.values.tradeIn * r.weight / totalWeight), 0)
      ),
      privateParty: Math.round(
        usedResults.reduce((sum, r) => sum + ((r.values.privateParty ?? 0) * r.weight / totalWeight), 0)
      ) || undefined,
      adjustedWholesale: Math.round(
        usedResults.reduce((sum, r) => sum + (r.values.adjustedWholesale * r.weight / totalWeight), 0)
      ),
    };
  }

  /**
   * Calculate overall confidence based on provider results
   */
  private calculateConfidence(
    results: ProviderBreakdown[],
    successfulProviders: ValuationProvider[]
  ): number {
    if (successfulProviders.length === 0) {
      return 0;
    }

    // Base confidence on:
    // 1. Number of successful providers (more = higher)
    // 2. Whether primary succeeded (primary = higher)
    // 3. Agreement between providers (closer values = higher)
    
    const providerBonus = Math.min(successfulProviders.length * 0.1, 0.3);
    const usedResults = results.filter(r => r.wasUsed);
    
    // Check value agreement
    const wholesaleValues = usedResults.map(r => r.values.wholesale).filter(v => v > 0);
    const valueAgreement = this.calculateValueAgreement(wholesaleValues);
    
    return Math.min(0.7 + providerBonus + (valueAgreement * 0.2), 1.0);
  }

  /**
   * Calculate how well values agree (0-1, higher = better agreement)
   */
  private calculateValueAgreement(values: number[]): number {
    if (values.length < 2) return 1.0;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const maxDeviation = Math.max(...values.map(v => Math.abs(v - avg) / avg));
    
    // 10% deviation = 0.9 agreement, 50% = 0.5, etc.
    return Math.max(0, 1 - maxDeviation);
  }

  private emptyValues(): ValuationValues {
    return {
      wholesale: 0,
      retail: 0,
      tradeIn: 0,
      adjustedWholesale: 0,
    };
  }

  /**
   * Get configuration for a specific provider
   */
  getProviderConfig(provider: ValuationProvider): ProviderConfig | undefined {
    return this.config.providers.find(p => p.name === provider);
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(provider: ValuationProvider, updates: Partial<ProviderConfig>): void {
    const index = this.config.providers.findIndex(p => p.name === provider);
    if (index >= 0) {
      this.config.providers[index] = { ...this.config.providers[index], ...updates };
      this.config.providers.sort((a, b) => a.priority - b.priority);
    }
  }

  /**
   * Check if any provider is configured
   */
  hasConfiguredProviders(): boolean {
    return Array.from(this.clients.values()).some(c => c.isConfigured());
  }

  /**
   * Get list of configured providers
   */
  getConfiguredProviders(): ValuationProvider[] {
    return Array.from(this.clients.entries())
      .filter(([_, client]) => client.isConfigured())
      .map(([name]) => name);
  }
}

/**
 * Create a pre-configured valuation service
 */
export function createValuationService(
  clients: ValuationClient[],
  configs: ProviderConfig[],
  options?: Partial<ValuationServiceConfig>
): WeightedValuationService {
  const service = new WeightedValuationService(options);
  
  clients.forEach((client, index) => {
    const config = configs.find(c => c.name === client.provider) ?? {
      name: client.provider,
      priority: index + 1,
      weight: 1 / clients.length,
      enabled: true,
    };
    service.registerClient(client, config);
  });
  
  return service;
}
