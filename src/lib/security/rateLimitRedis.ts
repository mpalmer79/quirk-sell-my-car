/**
 * Redis-based Rate Limiting with In-Memory Fallback
 * 
 * Uses Redis for distributed rate limiting in production.
 * Falls back to in-memory storage if Redis is unavailable.
 * 
 * To enable Redis, add to .env:
 *   REDIS_URL=redis://localhost:6379
 *   or
 *   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=xxx
 */

import { NextRequest } from 'next/server';
import { generateFingerprint, getClientIp, RATE_LIMIT_CONFIGS } from './rateLimit';

// =============================================================================
// TYPES
// =============================================================================

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
  retryAfter?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
  suspicionThreshold: number;
}

interface RedisRecord {
  requests: number[];
  blocked: boolean;
  blockedUntil?: number;
  suspicionScore: number;
}

// =============================================================================
// REDIS CLIENT (Upstash REST API - Edge compatible)
// =============================================================================

class UpstashRedisClient {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url;
    this.token = token;
  }

  private async command<T>(cmd: string[]): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cmd),
      });

      if (!response.ok) {
        console.error(`Redis command failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.result as T;
    } catch (error) {
      console.error('Redis connection error:', error);
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    return this.command<string>(['GET', key]);
  }

  async set(key: string, value: string, exSeconds?: number): Promise<boolean> {
    const cmd = exSeconds 
      ? ['SET', key, value, 'EX', exSeconds.toString()]
      : ['SET', key, value];
    const result = await this.command<string>(cmd);
    return result === 'OK';
  }

  async del(key: string): Promise<boolean> {
    const result = await this.command<number>(['DEL', key]);
    return result === 1;
  }

  async incr(key: string): Promise<number | null> {
    return this.command<number>(['INCR', key]);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.command<number>(['EXPIRE', key, seconds.toString()]);
    return result === 1;
  }

  async ttl(key: string): Promise<number | null> {
    return this.command<number>(['TTL', key]);
  }
}

// =============================================================================
// STORAGE ABSTRACTION
// =============================================================================

interface RateLimitStorage {
  get(key: string): Promise<RedisRecord | null>;
  set(key: string, record: RedisRecord, ttlSeconds: number): Promise<void>;
  isAvailable(): boolean;
}

// In-memory fallback storage
class InMemoryStorage implements RateLimitStorage {
  private store = new Map<string, { record: RedisRecord; expiresAt: number }>();

  constructor() {
    // Cleanup expired entries every 5 minutes
    if (typeof setInterval !== 'undefined' && process.env.NODE_ENV !== 'test') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    this.store.forEach((value, key) => {
      if (value.expiresAt < now) {
        this.store.delete(key);
      }
    });
  }

  async get(key: string): Promise<RedisRecord | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.record;
  }

  async set(key: string, record: RedisRecord, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      record,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  isAvailable(): boolean {
    return true;
  }
}

// Redis storage
class RedisStorage implements RateLimitStorage {
  private client: UpstashRedisClient | null = null;
  private available = false;
  private lastCheck = 0;
  private checkInterval = 60000; // Re-check availability every minute

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      this.client = new UpstashRedisClient(url, token);
      this.available = true;
      console.log('✅ Redis rate limiting enabled (Upstash)');
    } else {
      console.log('⚠️ Redis not configured - using in-memory rate limiting');
      this.available = false;
    }
  }

  async get(key: string): Promise<RedisRecord | null> {
    if (!this.client) return null;

    try {
      const data = await this.client.get(`ratelimit:${key}`);
      if (!data) return null;
      return JSON.parse(data) as RedisRecord;
    } catch (error) {
      console.error('Redis get error:', error);
      this.available = false;
      return null;
    }
  }

  async set(key: string, record: RedisRecord, ttlSeconds: number): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.set(
        `ratelimit:${key}`,
        JSON.stringify(record),
        ttlSeconds
      );
    } catch (error) {
      console.error('Redis set error:', error);
      this.available = false;
    }
  }

  isAvailable(): boolean {
    // Periodically re-check if Redis becomes available
    if (!this.available && Date.now() - this.lastCheck > this.checkInterval) {
      this.lastCheck = Date.now();
      this.initClient();
    }
    return this.available && this.client !== null;
  }
}

// =============================================================================
// RATE LIMITER
// =============================================================================

class DistributedRateLimiter {
  private redis: RedisStorage;
  private memory: InMemoryStorage;

  constructor() {
    this.redis = new RedisStorage();
    this.memory = new InMemoryStorage();
  }

  private getStorage(): RateLimitStorage {
    return this.redis.isAvailable() ? this.redis : this.memory;
  }

  getStorageType(): 'redis' | 'memory' {
    return this.redis.isAvailable() ? 'redis' : 'memory';
  }

  async checkRateLimit(
    request: NextRequest,
    endpoint?: string
  ): Promise<RateLimitResult> {
    const config = endpoint && RATE_LIMIT_CONFIGS[endpoint]
      ? RATE_LIMIT_CONFIGS[endpoint]
      : {
          windowMs: 60 * 1000,
          maxRequests: 30,
          blockDurationMs: 15 * 60 * 1000,
          suspicionThreshold: 100,
        };

    const fingerprint = generateFingerprint(request);
    const key = endpoint ? `${endpoint}:${fingerprint}` : fingerprint;
    const now = Date.now();
    const storage = this.getStorage();

    // Get or create record
    let record = await storage.get(key);
    if (!record) {
      record = {
        requests: [],
        blocked: false,
        suspicionScore: 0,
      };
    }

    // Check if currently blocked
    if (record.blocked && record.blockedUntil && now < record.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.blockedUntil,
        blocked: true,
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000),
      };
    }

    // Unblock if block has expired
    if (record.blocked && record.blockedUntil && now >= record.blockedUntil) {
      record.blocked = false;
      record.blockedUntil = undefined;
      record.suspicionScore = Math.floor(record.suspicionScore / 2);
    }

    // Clean old requests outside window
    record.requests = record.requests.filter(
      (time) => now - time < config.windowMs
    );

    // Calculate suspicion score
    const suspicionScore = this.calculateSuspicionScore(request, record);
    record.suspicionScore = Math.min(
      record.suspicionScore + suspicionScore,
      config.suspicionThreshold * 2
    );

    // Check if should be blocked due to suspicion
    if (record.suspicionScore >= config.suspicionThreshold) {
      record.blocked = true;
      record.blockedUntil = now + config.blockDurationMs;

      await storage.set(key, record, Math.ceil(config.blockDurationMs / 1000) + 60);

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.blockedUntil,
        blocked: true,
        retryAfter: Math.ceil(config.blockDurationMs / 1000),
      };
    }

    // Check rate limit
    if (record.requests.length >= config.maxRequests) {
      const oldestRequest = record.requests[0];
      const resetTime = oldestRequest + config.windowMs;

      record.suspicionScore += 10;
      await storage.set(key, record, Math.ceil(config.windowMs / 1000) + 60);

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        blocked: false,
        retryAfter: Math.ceil((resetTime - now) / 1000),
      };
    }

    // Add current request
    record.requests.push(now);

    // Decay suspicion score over time
    if (record.requests.length === 1) {
      record.suspicionScore = Math.max(0, record.suspicionScore - 5);
    }

    // Store updated record
    const ttlSeconds = Math.ceil(config.windowMs / 1000) + 60;
    await storage.set(key, record, ttlSeconds);

    return {
      allowed: true,
      remaining: config.maxRequests - record.requests.length,
      resetTime: now + config.windowMs,
      blocked: false,
    };
  }

  private calculateSuspicionScore(request: NextRequest, record: RedisRecord): number {
    let score = 0;
    const now = Date.now();

    // High request frequency in short period
    const recentRequests = record.requests.filter((time) => now - time < 10000);
    if (recentRequests.length > 5) {
      score += recentRequests.length * 5;
    }

    // Missing or suspicious user agent
    const userAgent = request.headers.get('user-agent') || '';
    if (!userAgent) {
      score += 20;
    } else if (userAgent.length < 20) {
      score += 10;
    } else if (/bot|crawler|spider|scraper/i.test(userAgent)) {
      score += 15;
    }

    // Missing common headers
    if (!request.headers.get('accept-language')) {
      score += 5;
    }
    if (!request.headers.get('accept')) {
      score += 5;
    }

    // Requests at exact intervals (bot behavior)
    if (record.requests.length >= 3) {
      const intervals = [];
      for (let i = 1; i < Math.min(record.requests.length, 10); i++) {
        intervals.push(record.requests[i] - record.requests[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;

      if (variance < 100 && intervals.length >= 3) {
        score += 25;
      }
    }

    return score;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let rateLimiterInstance: DistributedRateLimiter | null = null;

export function getRateLimiter(): DistributedRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new DistributedRateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Check rate limit using distributed storage (Redis with in-memory fallback)
 */
export async function checkDistributedRateLimit(
  request: NextRequest,
  endpoint?: string
): Promise<RateLimitResult> {
  return getRateLimiter().checkRateLimit(request, endpoint);
}

/**
 * Get current storage type being used
 */
export function getRateLimitStorageType(): 'redis' | 'memory' {
  return getRateLimiter().getStorageType();
}
