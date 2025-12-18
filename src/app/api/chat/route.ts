import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// RATE LIMITING (In-memory for demo; use Redis in production)
// ============================================================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
  // Get IP from various headers (works with proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'anonymous';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

// Clean up old entries periodically (in production, use Redis with TTL)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean every minute

// ============================================================
// LOGGING (In production, use structured logging service)
// ============================================================
interface ChatLogEntry {
  timestamp: string;
  sessionId: string;
  userMessage: string;
  responseType: 'ai' | 'fallback' | 'error';
  responseLength: number;
  latencyMs: number;
  ip: string;
}

function logChatInteraction(entry: ChatLogEntry): void {
  // In production: send to logging service (DataDog, CloudWatch, etc.)
  // For now: structured console log for demo purposes
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({
      type: 'CHAT_INTERACTION',
      ...entry,
    }));
  }
}

// ============================================================
// SYSTEM PROMPT - Production Safe (No operational promises)
// ============================================================
const SYSTEM_PROMPT = `You are a helpful assistant for Quirk Auto Dealers, a trusted automotive dealership network in Massachusetts and New Hampshire.

Your role is to help customers understand the vehicle selling/trade-in process and answer general questions.

IMPORTANT GUIDELINES:
1. You provide GENERAL INFORMATION only - not binding commitments
2. All offers shown online are PRELIMINARY ESTIMATES subject to in-person vehicle inspection
3. Do NOT make specific promises about:
   - Exact payment amounts or timelines
   - Specific document requirements (these vary by state/situation)
   - Loan payoff processes (each situation is unique)
4. For specific questions about offers, payments, or procedures, direct customers to speak with a Quirk representative

GENERAL INFORMATION YOU CAN SHARE:
- The online process provides a preliminary estimate based on vehicle details
- Final offers are determined after in-person inspection
- Customers can sell outright or apply value toward a new vehicle
- Multiple Quirk locations are available across MA and NH
- For questions: call (603) 263-4552 or visit quirkchevynh.com

Be friendly, helpful, and concise. When uncertain, encourage customers to contact a representative for accurate information.`;

// ============================================================
// FALLBACK RESPONSES (No API key mode)
// ============================================================
const FALLBACK_RESPONSES: Record<string, string> = {
  'offer': `Getting a preliminary estimate is easy! Enter your VIN on our homepage and follow the steps. The online estimate takes about 5 minutes.

Note: Online offers are preliminary estimates. Your final offer will be confirmed after an in-person vehicle inspection at any Quirk location.

Questions? Call (603) 263-4552`,

  'trade': `Our trade-in process:
1. Get your preliminary online estimate
2. Visit any Quirk location for vehicle inspection
3. Receive your final offer
4. Apply the value to your new vehicle purchase

Online estimates are subject to in-person verification. Contact us for specific details about your situation.`,

  'document': `Documentation requirements vary based on your specific situation (state, loan status, etc.).

Generally helpful to bring:
• Valid ID
• Vehicle title or loan information
• Vehicle keys

For your specific requirements, please contact a Quirk representative at (603) 263-4552.`,

  'valid': `Online estimates are typically provided for reference purposes. For information about offer validity and terms, please speak with a Quirk representative who can provide details specific to your situation.`,

  'how long': `The online estimate process takes about 5 minutes. In-person inspection times vary by location and vehicle.

For scheduling and timing questions, contact us at (603) 263-4552.`,

  'default': `I can help with general questions about selling or trading your vehicle at Quirk Auto Dealers.

For specific questions about offers, payments, or your particular situation, I recommend speaking with a Quirk representative at (603) 263-4552 - they can provide accurate information for your needs.

What would you like to know more about?`,
};

function getFallbackResponse(userMessage: string): string {
  const messageLower = userMessage.toLowerCase();
  
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (key !== 'default' && messageLower.includes(key)) {
      return response;
    }
  }
  
  return FALLBACK_RESPONSES.default;
}

// ============================================================
// MAIN API HANDLER
// ============================================================
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const sessionId = request.headers.get('x-session-id') || 'unknown';
  const rateLimitKey = getRateLimitKey(request);

  // Check rate limit
  const { allowed, remaining } = checkRateLimit(rateLimitKey);
  
  if (!allowed) {
    return NextResponse.json(
      { 
        content: "You've sent too many messages. Please wait a moment before trying again, or call us at (603) 263-4552 for immediate help.",
        error: 'RATE_LIMITED'
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
        }
      }
    );
  }

  try {
    const { messages } = await request.json();
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { content: 'Invalid request format', error: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Check for excessively long messages (abuse prevention)
    if (userMessage.length > 2000) {
      return NextResponse.json(
        { content: 'Message too long. Please keep messages under 2000 characters.', error: 'MESSAGE_TOO_LONG' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Fallback mode (no API key)
    if (!apiKey) {
      const response = getFallbackResponse(userMessage);
      
      logChatInteraction({
        timestamp: new Date().toISOString(),
        sessionId,
        userMessage: userMessage.substring(0, 100), // Truncate for logging
        responseType: 'fallback',
        responseLength: response.length,
        latencyMs: Date.now() - startTime,
        ip: rateLimitKey,
      });

      return NextResponse.json(
        { content: response },
        { headers: { 'X-RateLimit-Remaining': String(remaining) } }
      );
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content.substring(0, 2000), // Truncate long messages
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    const content = data.content[0]?.text || 'I apologize, but I encountered an issue. Please try again or call (603) 263-4552.';

    logChatInteraction({
      timestamp: new Date().toISOString(),
      sessionId,
      userMessage: userMessage.substring(0, 100),
      responseType: 'ai',
      responseLength: content.length,
      latencyMs: Date.now() - startTime,
      ip: rateLimitKey,
    });

    return NextResponse.json(
      { content },
      { headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    
    logChatInteraction({
      timestamp: new Date().toISOString(),
      sessionId,
      userMessage: 'ERROR',
      responseType: 'error',
      responseLength: 0,
      latencyMs: Date.now() - startTime,
      ip: rateLimitKey,
    });

    return NextResponse.json(
      { 
        content: "I'm having trouble connecting right now. Please call us at (603) 263-4552 for immediate assistance.",
        error: 'API_ERROR'
      },
      { status: 500 }
    );
  }
}
