/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import {
  detectBot,
  quickBotCheck,
  generateFormToken,
  validateFormToken,
  getHoneypotFieldProps,
  HONEYPOT_CONFIG,
} from '@/lib/security/botProtection';

describe('Bot Protection', () => {
  describe('detectBot', () => {
    const createRequest = (options: {
      userAgent?: string;
      headers?: Record<string, string>;
    } = {}) => {
      const headers: Record<string, string> = {
        'user-agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        ...options.headers,
      };

      return new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers,
      });
    };

    it('detects missing user agent as suspicious', () => {
      const request = createRequest({ userAgent: '' });
      const result = detectBot(request);

      expect(result.confidence).toBeGreaterThanOrEqual(40);
      expect(result.reasons).toContain('Missing user agent');
    });

    it('detects short user agent as suspicious', () => {
      const request = createRequest({ userAgent: 'curl/7.64.1' });
      const result = detectBot(request);

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reasons).toContain('Unusually short user agent');
    });

    it('detects known bot user agents', () => {
      const botAgents = [
        'python-requests/2.28.0',
        'curl/7.64.1',
        'Scrapy/2.8.0',
        'Go-http-client/1.1',
        'axios/1.4.0',
      ];

      for (const agent of botAgents) {
        const request = createRequest({ userAgent: agent });
        const result = detectBot(request);

        expect(result.confidence).toBeGreaterThan(30);
      }
    });

    it('allows legitimate browser user agents', () => {
      const request = createRequest({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const result = detectBot(request);

      expect(result.isBot).toBe(false);
      expect(result.confidence).toBeLessThan(50);
    });

    it('detects missing Accept header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'accept-language': 'en-US',
        },
      });
      const result = detectBot(request);

      expect(result.reasons).toContain('Missing Accept header');
    });

    it('detects missing Accept-Language header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'accept': 'text/html',
        },
      });
      const result = detectBot(request);

      expect(result.reasons).toContain('Missing Accept-Language header');
    });

    it('detects honeypot field filled', () => {
      const request = createRequest();
      const result = detectBot(request, {
        honeypot: 'spam-content',
      });

      expect(result.isBot).toBe(true);
      expect(result.confidence).toBe(100);
      expect(result.reasons).toContain('Honeypot field filled');
    });

    it('passes when honeypot is empty', () => {
      const request = createRequest();
      const result = detectBot(request, {
        honeypot: '',
      });

      expect(result.reasons).not.toContain('Honeypot field filled');
    });

    it('detects insufficient mouse movements', () => {
      const request = createRequest();
      const result = detectBot(request, {
        mouseMovements: 1,
      });

      expect(result.reasons).toContain('Insufficient mouse movements');
    });

    it('detects insufficient keystrokes', () => {
      const request = createRequest();
      const result = detectBot(request, {
        keystrokes: 2,
      });

      expect(result.reasons).toContain('Insufficient keystrokes');
    });

    it('detects time on page too short', () => {
      const request = createRequest();
      const result = detectBot(request, {
        timeOnPage: 1000, // 1 second
      });

      expect(result.reasons).toContain('Time on page too short');
    });

    it('passes behavioral checks with normal values', () => {
      const request = createRequest();
      const result = detectBot(request, {
        honeypot: '',
        mouseMovements: 50,
        keystrokes: 20,
        timeOnPage: 30000, // 30 seconds
      });

      expect(result.reasons).not.toContain('Insufficient mouse movements');
      expect(result.reasons).not.toContain('Insufficient keystrokes');
      expect(result.reasons).not.toContain('Time on page too short');
    });

    it('detects POST without referer as suspicious', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'accept': 'text/html',
          'accept-language': 'en-US',
        },
      });
      const result = detectBot(request);

      expect(result.reasons).toContain('POST request without referer');
    });
  });

  describe('quickBotCheck', () => {
    it('returns true for obvious bots', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'user-agent': 'python-requests/2.28.0',
        },
      });

      expect(quickBotCheck(request)).toBe(true);
    });

    it('returns false for normal browsers', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'accept': 'text/html',
          'accept-language': 'en-US',
          'accept-encoding': 'gzip',
        },
      });

      expect(quickBotCheck(request)).toBe(false);
    });
  });

  describe('Form Token', () => {
    describe('generateFormToken', () => {
      it('generates a non-empty token', () => {
        const token = generateFormToken();

        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(10);
      });

      it('generates unique tokens', () => {
        const tokens = new Set();
        for (let i = 0; i < 100; i++) {
          tokens.add(generateFormToken());
        }

        expect(tokens.size).toBe(100);
      });

      it('generates base64 encoded tokens', () => {
        const token = generateFormToken();
        
        // Should be valid base64
        expect(() => Buffer.from(token, 'base64')).not.toThrow();
      });
    });

    describe('validateFormToken', () => {
      it('validates a fresh token after minimum time', async () => {
        const token = generateFormToken();
        
        // Wait for minimum time (3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3100));
        
        const result = validateFormToken(token);

        expect(result.valid).toBe(true);
        expect(result.age).toBeGreaterThanOrEqual(3000);
      });

      it('rejects token submitted too quickly', () => {
        const token = generateFormToken();
        const result = validateFormToken(token);

        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Form submitted too quickly');
      });

      it('rejects invalid token format', () => {
        const result = validateFormToken('invalid-token');

        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Invalid token format');
      });

      it('rejects tampered token', () => {
        const token = generateFormToken();
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        parts[2] = 'tampered-hash';
        const tamperedToken = Buffer.from(parts.join(':')).toString('base64');

        const result = validateFormToken(tamperedToken);

        expect(result.valid).toBe(false);
        expect(result.reason).toBe('Invalid token signature');
      });

      it('rejects empty token', () => {
        const result = validateFormToken('');

        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Honeypot Field Props', () => {
    it('returns correct field name', () => {
      const props = getHoneypotFieldProps();

      expect(props.name).toBe(HONEYPOT_CONFIG.fieldName);
    });

    it('returns props that hide the field', () => {
      const props = getHoneypotFieldProps();

      expect(props.tabIndex).toBe(-1);
      expect(props['aria-hidden']).toBe(true);
      expect(props.style.position).toBe('absolute');
      expect(props.style.opacity).toBe(0);
      expect(props.style.pointerEvents).toBe('none');
    });

    it('disables autocomplete', () => {
      const props = getHoneypotFieldProps();

      expect(props.autoComplete).toBe('off');
    });
  });

  describe('HONEYPOT_CONFIG', () => {
    it('has reasonable timing values', () => {
      expect(HONEYPOT_CONFIG.minSubmitTime).toBeGreaterThanOrEqual(1000);
      expect(HONEYPOT_CONFIG.maxSubmitTime).toBeGreaterThan(HONEYPOT_CONFIG.minSubmitTime);
    });

    it('has a field name defined', () => {
      expect(HONEYPOT_CONFIG.fieldName).toBeTruthy();
    });
  });
});
