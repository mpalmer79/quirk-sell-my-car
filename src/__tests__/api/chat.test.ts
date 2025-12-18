/**
 * @jest-environment node
 */

import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const createRequest = (body: object) => {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

describe('POST /api/chat', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('without API key (fallback mode)', () => {
    beforeEach(() => {
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('returns fallback for offer question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'How do I get an offer?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('VIN');
    });

    it('returns fallback for trade-in question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Tell me about trade-in' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('trade-in');
    });

    it('returns fallback for documents question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'What documents do I need?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('ID');
    });

    it('returns fallback for validity question', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'How long is my offer valid?' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('7 days');
    });

    it('returns default fallback for other questions', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Random question' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toContain('instant offer');
    });
  });

  describe('with API key', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
    });

    it('calls Anthropic API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'AI response' }],
        }),
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-key',
          }),
        })
      );
    });

    it('returns AI response on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'Here is my response' }],
        }),
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe('Here is my response');
    });

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      } as Response);

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.content).toContain('trouble connecting');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.content).toContain('trouble connecting');
    });

    it('passes message history', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: 'Response' }],
        }),
      } as Response);

      const messages = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' },
        { role: 'user', content: 'Help' },
      ];

      const request = createRequest({ messages });
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);

      expect(body.messages).toHaveLength(3);
    });
  });
});
