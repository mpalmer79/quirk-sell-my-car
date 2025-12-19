/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import {
  checkRateLimit,
  generateFingerprint,
  getClientIp,
  rateLimitStore,
  RATE_LIMIT_CONFIGS,
} from '@/lib/security/rateLimit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    rateLimitStore.clear();
  });

  describe('getClientIp', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.100');
    });

    it('extracts IP from cf-connecting-ip header (Cloudflare)', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'cf-connecting-ip': '203.0.113.50',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.50');
    });

    it('extracts IP from x-real-ip header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-real-ip': '10.20.30.40',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('10.20.30.40');
    });

    it('returns unknown when no IP headers present', () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const ip = getClientIp(request);
      expect(ip).toBe('unknown');
    });

    it('prioritizes cf-connecting-ip over x-forwarded-for', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'cf-connecting-ip': '203.0.113.50',
          'x-forwarded-for': '192.168.1.100',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('203.0.113.50');
    });
  });

  describe('generateFingerprint', () => {
    it('generates consistent fingerprint for same request', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Mozilla/5.0',
          'accept-language': 'en-US',
          'accept-encoding': 'gzip',
        },
      });

      const fp1 = generateFingerprint(request);
      const fp2 = generateFingerprint(request);

      expect(fp1).toBe(fp2);
    });

    it('generates different fingerprint for different IPs', () => {
      const request1 = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Mozilla/5.0',
        },
      });

      const request2 = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.200',
          'user-agent': 'Mozilla/5.0',
        },
      });

      const fp1 = generateFingerprint(request1);
      const fp2 = generateFingerprint(request2);

      expect(fp1).not.toBe(fp2);
    });

    it('generates different fingerprint for different user agents', () => {
      const request1 = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Mozilla/5.0 Chrome',
        },
      });

      const request2 = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Mozilla/5.0 Firefox',
        },
      });

      const fp1 = generateFingerprint(request1);
      const fp2 = generateFingerprint(request2);

      expect(fp1).not.toBe(fp2);
    });

    it('returns 16 character hash', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      });

      const fp = generateFingerprint(request);

      expect(fp.length).toBe(16);
    });
  });

  describe('checkRateLimit', () => {
    const createRequest = (ip: string) => {
      return new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': ip,
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'accept': 'application/json',
          'accept-language': 'en-US',
        },
      });
    };

    it('allows first request', () => {
      const request = createRequest('10.0.0.1');
      const result = checkRateLimit(request);

      expect(result.allowed).toBe(true);
      expect(result.blocked).toBe(false);
    });

    it('tracks remaining requests', () => {
      const request = createRequest('10.0.0.2');
      
      const result1 = checkRateLimit(request);
      const result2 = checkRateLimit(request);

      expect(result2.remaining).toBeLessThan(result1.remaining);
    });

    it('blocks after exceeding limit', () => {
      const ip = '10.0.0.3';
      
      // Make 30 requests (default limit)
      for (let i = 0; i < 30; i++) {
        const request = createRequest(ip);
        checkRateLimit(request);
      }

      // 31st should be blocked
      const request = createRequest(ip);
      const result = checkRateLimit(request);

      expect(result.allowed).toBe(false);
    });

    it('uses endpoint-specific config', () => {
      const ip = '10.0.0.4';
      
      // Chat endpoint has 10 request limit
      for (let i = 0; i < 10; i++) {
        const request = createRequest(ip);
        checkRateLimit(request, '/api/chat');
      }

      // 11th should be blocked
      const request = createRequest(ip);
      const result = checkRateLimit(request, '/api/chat');

      expect(result.allowed).toBe(false);
    });

    it('returns retry-after value when blocked', () => {
      const ip = '10.0.0.5';
      
      // Exhaust the limit
      for (let i = 0; i < 30; i++) {
        const request = createRequest(ip);
        checkRateLimit(request);
      }

      const request = createRequest(ip);
      const result = checkRateLimit(request);

      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('different IPs have separate limits', () => {
      const ip1 = '10.0.0.6';
      const ip2 = '10.0.0.7';
      
      // Exhaust limit for ip1
      for (let i = 0; i < 30; i++) {
        const request = createRequest(ip1);
        checkRateLimit(request);
      }

      // ip2 should still be allowed
      const request = createRequest(ip2);
      const result = checkRateLimit(request);

      expect(result.allowed).toBe(true);
    });

    it('returns reset time', () => {
      const request = createRequest('10.0.0.8');
      const result = checkRateLimit(request);

      expect(result.resetTime).toBeDefined();
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe('RATE_LIMIT_CONFIGS', () => {
    it('has config for chat endpoint', () => {
      expect(RATE_LIMIT_CONFIGS['/api/chat']).toBeDefined();
      expect(RATE_LIMIT_CONFIGS['/api/chat'].maxRequests).toBe(10);
    });

    it('has config for decode-vin endpoint', () => {
      expect(RATE_LIMIT_CONFIGS['/api/decode-vin']).toBeDefined();
      expect(RATE_LIMIT_CONFIGS['/api/decode-vin'].maxRequests).toBe(20);
    });

    it('has config for valuation endpoint', () => {
      expect(RATE_LIMIT_CONFIGS['/api/valuation']).toBeDefined();
      expect(RATE_LIMIT_CONFIGS['/api/valuation'].maxRequests).toBe(5);
    });

    it('has config for submit-lead endpoint', () => {
      expect(RATE_LIMIT_CONFIGS['/api/submit-lead']).toBeDefined();
      expect(RATE_LIMIT_CONFIGS['/api/submit-lead'].maxRequests).toBe(3);
    });

    it('has config for submit-offer endpoint', () => {
      expect(RATE_LIMIT_CONFIGS['/api/submit-offer']).toBeDefined();
      expect(RATE_LIMIT_CONFIGS['/api/submit-offer'].maxRequests).toBe(10);
    });

    it('has config for vehicle-image endpoint', () => {
      expect(RATE_LIMIT_CONFIGS['/api/vehicle-image']).toBeDefined();
      expect(RATE_LIMIT_CONFIGS['/api/vehicle-image'].maxRequests).toBe(30);
    });

    it('has config for offers endpoint', () => {
      expect(RATE_LIMIT_CONFIGS['/api/offers']).toBeDefined();
      expect(RATE_LIMIT_CONFIGS['/api/offers'].maxRequests).toBe(30);
    });

    it('all configs have required fields', () => {
      for (const [endpoint, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
        expect(config.windowMs).toBeDefined();
        expect(config.maxRequests).toBeDefined();
        expect(config.blockDurationMs).toBeDefined();
        expect(config.suspicionThreshold).toBeDefined();
      }
    });
  });
});
