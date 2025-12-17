
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a helpful assistant for Quirk Auto Dealers, a trusted automotive dealership network in Massachusetts and New Hampshire with 17+ locations. Your role is to help customers sell or trade in their vehicles.

Key information about the sell/trade process:
1. Customers can get an instant offer by entering their VIN
2. The process takes about 5 minutes online
3. Offers are valid for 7 days
4. Required documents: valid ID, vehicle title (or loan payoff info), odometer statement
5. Payment is issued same-day via check or direct deposit
6. Trade-in credit can be applied to any vehicle purchase at Quirk dealerships

Be friendly, concise, and helpful. If customers have questions about specific vehicles or inventory, direct them to visit quirkchevynh.com or call (603) 555-2000.

Don't make up specific prices or valuations - explain that offers are calculated based on the vehicle's condition, mileage, market demand, and features.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return a helpful fallback response when no API key
      const fallbackResponses: Record<string, string> = {
        'how do i get an offer': `Getting an offer is easy! Just enter your VIN on our homepage and follow the simple steps:
1. Enter your VIN (found on your dashboard or door jamb)
2. Confirm your vehicle details
3. Answer a few questions about condition and features
4. Get your instant cash offer!

The whole process takes about 5 minutes.`,
        'trade-in': `Our trade-in process is simple:
1. Get your instant offer online
2. Bring your vehicle to any Quirk location
3. We'll verify the condition
4. Apply the credit to your new vehicle purchase

Your offer is valid for 7 days, giving you time to shop for your new car!`,
        'documents': `To complete your sale or trade-in, you'll need:
• Valid government-issued ID
• Vehicle title (or loan payoff information)
• Odometer disclosure statement
• Any extra keys/remotes

If you have a loan on the vehicle, we can handle the payoff directly.`,
        'valid': `Your offer is valid for 7 days from the date it's generated. After that, you can easily get a new offer by going through our quick online process again.`,
        default: `I'd be happy to help! Here's what I can tell you about selling your car at Quirk:

• Get an instant offer in about 5 minutes
• Offers are valid for 7 days
• Same-day payment via check or direct deposit
• Trade-in credit available at any Quirk location

For specific questions, you can also call us at (603) 555-2000 - we're here to help!`,
      };

      const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let response = fallbackResponses.default;

      for (const [key, value] of Object.entries(fallbackResponses)) {
        if (key !== 'default' && userMessage.includes(key)) {
          response = value;
          break;
        }
      }

      return NextResponse.json({ content: response });
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
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();
    const content = data.content[0]?.text || 'I apologize, but I encountered an issue. Please try again.';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { content: "I'm having trouble connecting. Please call us at (603) 555-2000 for immediate help." },
      { status: 500 }
    );
  }
}
