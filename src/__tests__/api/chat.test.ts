/**
 * @jest-environment node
 */

import { POST, rateLimitMap } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

// Mock fetch for node environment
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Counter for unique IPs
let ipCounter = 0;

function getUniqueIp(): string {
  ipCounter++;
  return `10.0.${Math.floor(ipCounter / 255)}.${ipCounter % 255}`;
}

describe('POST /api/chat', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    process.env = { ...originalEnv };
    // CRITICAL: Clear rate limiter before each test
    rateLimitMap.clear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const createRequest = (body: object, customIp?: string) => {
    const ip = customIp || getUniqueIp();
    return new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify(body),
    });
  };

  describe('without API key (fallback mode)', () => {
    beforeEach(() => {
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('returns fallback response for offer-related question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'How do I get an offer?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('preliminary estimate');
    });

    it('returns fallback response for trade-in question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Tell me about trade-in' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('trade-in');
    });

    it('returns fallback response for documents question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'What documents do I need?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('Valid ID');
    });

    it('returns fallback response for validity question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'How long is my offer valid?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('Quirk representative');
    });

    it('returns default fallback for unrecognized questions', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'What color is the sky?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('(603) 263-4552');
    });

    it('returns 400 for empty messages array', async () => {
      const request = createRequest({
        messages: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('INVALID_REQUEST');
    });

    it('returns 400 for missing messages', async () => {
      const request = createRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('INVALID_REQUEST');
    });

    it('returns 400 for message too long', async () => {
      const longMessage = 'a'.repeat(2500);
      const request = createRequest({
        messages: [{ role: 'user', content: longMessage }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('MESSAGE_TOO_LONG');
    });
  });

  describe('with API key', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
    });

    it('calls Anthropic API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'AI response here' }],
        }),
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
            'anthropic-version': '2023-06-01',
          }),
        })
      );
    });

    it('uses claude-sonnet-4-20250514 model', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'AI response' }],
        }),
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall).toBeDefined();
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.model).toBe('claude-sonnet-4-20250514');
    });

    it('includes system prompt with Quirk info', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'AI response' }],
        }),
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall).toBeDefined();
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.system).toContain('Quirk Auto Dealers');
    });

    it('returns AI response on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'I can help you sell your car!' }],
        }),
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'I want to sell my car' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe('I can help you sell your car!');
    });

    it('handles API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.content).toContain('trouble connecting');
      expect(data.error).toBe('API_ERROR');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.content).toContain('trouble connecting');
    });

    it('handles missing text in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{}], // No text field
        }),
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('encountered an issue');
    });

    it('truncates long conversation history to last 10 messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'Response' }],
        }),
      } as Response);

      const messages = Array.from({ length: 15 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i + 1}`,
      }));

      const request = createRequest({ messages });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall).toBeDefined();
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.messages.length).toBe(10);
    });

    it('sets max_tokens to 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'Response' }],
        }),
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall).toBeDefined();
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.max_tokens).toBe(500);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('handles malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-forwarded-for': getUniqueIp(),
        },
        body: 'not valid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.content).toContain('trouble connecting');
    });
  });

  describe('rate limiting', () => {
    beforeEach(() => {
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('returns 429 when rate limit exceeded', async () => {
      const testIp = '192.168.99.99';
      
      // Make 10 requests (the limit)
      for (let i = 0; i < 10; i++) {
        const req = new NextRequest('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-forwarded-for': testIp,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: `Message ${i}` }],
          }),
        });
        await POST(req);
      }

      // 11th request should be rate limited
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'One more' }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('RATE_LIMITED');
    });
  });
});
