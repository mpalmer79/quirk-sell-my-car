import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  logRateLimitHit,
  logChatInteraction,
  logSecurityViolation,
  validateInput,
  chatRequestSchema,
  sanitizeString,
  quickBotCheck,
  logBotDetection,
  detectBot,
  getClientIp,
} from '@/lib/security';

// =============================================================================
// SYSTEM PROMPT
// =============================================================================

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

Be friendly, helpful, and concise.`;

// =============================================================================
// FALLBACK RESPONSES
// =============================================================================

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
  
  if (messageLower.includes('valid')) {
    return FALLBACK_RESPONSES['valid'];
  }
  
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (key !== 'default' && key !== 'valid' && messageLower.includes(key)) {
      return response;
    }
  }
  
  return FALLBACK_RESPONSES.default;
}

// =============================================================================
// MAIN API HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const sessionId = request.headers.get('x-session-id') || 'unknown';

  // ===== Rate Limiting =====
  const rateLimitResult = checkRateLimit(request, '/api/chat');
  
  if (!rateLimitResult.allowed) {
    logRateLimitHit(request, '/api/chat', rateLimitResult.blocked);
    
    return NextResponse.json(
      { 
        content: "You've sent too many messages. Please wait a moment before trying again, or call us at (603) 263-4552 for immediate help.",
        error: 'RATE_LIMITED'
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000)),
          'Retry-After': String(rateLimitResult.retryAfter || 60),
        }
      }
    );
  }

  // ===== Bot Detection =====
  const botResult = detectBot(request);
  if (botResult.isBot && botResult.confidence >= 70) {
    logBotDetection(request, botResult.confidence, botResult.reasons);
    
    return NextResponse.json(
      { 
        content: "I'm sorry, I couldn't process your request. Please try again or call (603) 263-4552.",
        error: 'REQUEST_BLOCKED'
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    // ===== Input Validation =====
    const validation = validateInput(chatRequestSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { content: 'Invalid request format', error: 'INVALID_REQUEST', details: validation.errors },
        { status: 400 }
      );
    }
    
    const { messages } = validation.data;
    const userMessage = sanitizeString(messages[messages.length - 1]?.content || '', {
      maxLength: 2000,
      allowNewlines: true,
    });

    // Check for suspicious content
    if (containsSuspiciousPatterns(userMessage)) {
      logSecurityViolation(request, 'Suspicious chat message content', {
        messagePreview: userMessage.substring(0, 100),
      });
      
      return NextResponse.json(
        { content: 'Your message could not be processed. Please rephrase and try again.', error: 'INVALID_CONTENT' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // ===== Fallback Mode (no API key) =====
    if (!apiKey) {
      const response = getFallbackResponse(userMessage);
      
      logChatInteraction(request, userMessage.length, 'fallback', Date.now() - startTime);

      return NextResponse.json(
        { content: response },
        { 
          headers: { 
            'X-RateLimit-Remaining': String(rateLimitResult.remaining) 
          } 
        }
      );
    }

    // ===== Call Anthropic API =====
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
        messages: messages.slice(-10).map((m) => ({
          role: m.role,
          content: sanitizeString(m.content, { maxLength: 2000 }),
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

    logChatInteraction(request, userMessage.length, 'ai', Date.now() - startTime);

    return NextResponse.json(
      { content },
      { 
        headers: { 
          'X-RateLimit-Remaining': String(rateLimitResult.remaining) 
        } 
      }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    
    logChatInteraction(request, 0, 'error', Date.now() - startTime);

    return NextResponse.json(
      { 
        content: "I'm having trouble connecting right now. Please call us at (603) 263-4552 for immediate assistance.",
        error: 'API_ERROR'
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:/gi,
    /vbscript:/gi,
    /{{.*}}/g,
    /\$\{.*\}/g,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];
  
  return suspiciousPatterns.some((pattern) => pattern.test(input));
}
