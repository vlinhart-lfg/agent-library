import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getScenarioData } from '@/lib/make-api';

// Rate limiting map (in-memory)
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
const MAX_SCRAPES_PER_HOUR = parseInt(process.env.RATE_LIMIT_SCRAPES_PER_HOUR || '50');

const scrapeSchema = z.object({
  makeScenarioUrl: z.string().url(),
  enhance: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const userLimit = rateLimit.get(ip) || { count: 0, timestamp: now };

    if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
      userLimit.count = 0;
      userLimit.timestamp = now;
    }

    if (userLimit.count >= MAX_SCRAPES_PER_HOUR) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    userLimit.count++;
    rateLimit.set(ip, userLimit);

    // 2. Input Validation
    const body = await request.json();
    const validation = scrapeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    const { makeScenarioUrl } = validation.data;

    // 3. Fetch Data from Make.com API
    try {
      const data = await getScenarioData(makeScenarioUrl);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('Scraping failed:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch scenario data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
