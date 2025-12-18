/**
 * @jest-environment node
 */

import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('POST /api/chat', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const createRequest = (body: object) => {
    return new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  describe('without API key (fallback mode)', () => {
    beforeEach(() => {
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('should return fallback response for offer-related question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'How do I get an offer?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('Getting an offer is easy');
      expect(data.content).toContain('VIN');
    });

    it('should return fallback response for trade-in question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Tell me about trade-in' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('trade-in process');
    });

    it('should return fallback response for documents question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'What documents do I need?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('Valid government-issued ID');
      expect(data.content).toContain('Vehicle title');
    });

    it('should return fallback response for offer validity question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'How long is my offer valid?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('7 days');
    });

    it('should return default fallback for unrecognized questions', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'What color is the sky?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('instant offer');
      expect(data.content).toContain('(603) 263-4552');
    });

    it('should handle empty messages array', async () => {
      const request = createRequest({
        messages: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBeDefined();
    });
  });

  describe('with API key', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
    });

    it('should call Anthropic API with correct parameters', async () => {
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

    it('should use claude-sonnet-4-20250514 model', async () => {
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

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);

      expect(body.model).toBe('claude-sonnet-4-20250514');
    });

    it('should include system prompt', async () => {
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

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);

      expect(body.system).toContain('Quirk Auto Dealers');
      expect(body.system).toContain('sell or trade');
    });

    it('should return AI response on success', async () => {
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

    it('should handle API error response', async () => {
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
      expect(data.content).toContain('(603) 263-4552');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello!' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.content).toContain('trouble connecting');
    });

    it('should handle missing text in response', async () => {
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

    it('should pass message history to API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'Response' }],
        }),
      } as Response);

      const messages = [
        { role: 'user', content: 'Hello!' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'Help me sell my car' },
      ];

      const request = createRequest({ messages });

      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);

      expect(body.messages).toEqual(messages);
    });

    it('should set max_tokens to 500', async () => {
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

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);

      expect(body.max_tokens).toBe(500);
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.content).toContain('trouble connecting');
    });
  });
});
