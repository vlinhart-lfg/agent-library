import { NextResponse } from 'next/server';
import { scrapeScenario } from '@/lib/apify';

// Rate limiting for scraping (lower limit than submissions)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const SCRAPE_RATE_LIMIT = parseInt(process.env.RATE_LIMIT_SCRAPES_PER_HOUR || '5');
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }

  if (record.count >= SCRAPE_RATE_LIMIT) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000 / 60);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many scrape requests. Please try again in ${rateLimit.retryAfter} minutes.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': (rateLimit.retryAfter! * 60).toString(),
          },
        }
      );
    }

    // Check if Apify is configured
    if (!process.env.APIFY_API_TOKEN) {
      return NextResponse.json(
        {
          error: 'Scraping service not configured. Please enter details manually.',
        },
        { status: 503 }
      );
    }

    // Parse request body
    const { makeScenarioUrl } = await request.json();

    if (!makeScenarioUrl) {
      return NextResponse.json(
        {
          error: 'Make.com scenario URL is required',
        },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!makeScenarioUrl.includes('make.com/public/shared-scenario')) {
      return NextResponse.json(
        {
          error: 'Invalid Make.com scenario URL. Must be a shared scenario URL.',
        },
        { status: 400 }
      );
    }

    // Scrape the scenario page
    const scrapedData = await scrapeScenario(makeScenarioUrl);

    // Return scraped data
    return NextResponse.json({
      success: true,
      data: scrapedData,
      message: 'Scenario data extracted successfully',
    });
  } catch (error: any) {
    console.error('Scrape error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to extract scenario data. Please enter details manually.',
      },
      { status: 500 }
    );
  }
}
