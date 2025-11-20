import { NextResponse } from 'next/server';
import { moderateContent, validateScenario } from '@/lib/openai';
import { sanitizeScenarioData } from '@/lib/sanitize';

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((record.resetAt - now) / 1000 / 60); // minutes
    return { allowed: false, retryAfter };
  }

  // Increment count
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
          error: `Too many submissions. Please try again in ${rateLimit.retryAfter} minutes.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': (rateLimit.retryAfter! * 60).toString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Sanitize inputs
    const sanitized = sanitizeScenarioData(body);

    // Step 1: Content moderation (OpenAI Moderation API - free)
    const combinedContent = `${sanitized.title}\n\n${sanitized.description}`;
    const moderation = await moderateContent(combinedContent);

    if (moderation.flagged) {
      return NextResponse.json(
        {
          error: `Content violates community guidelines (${moderation.categories.join(', ')})`,
          isValid: false,
        },
        { status: 400 }
      );
    }

    // Step 2: AI quality validation (GPT-4)
    const validation = await validateScenario({
      title: sanitized.title,
      description: sanitized.description,
      apps: sanitized.apps,
      category: body.category,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: `Validation failed: ${validation.issues.join(', ')}`,
          isValid: false,
          issues: validation.issues,
        },
        { status: 400 }
      );
    }

    // Return validation results with AI enhancements
    return NextResponse.json({
      isValid: true,
      quality: validation.quality,
      suggestedTitle: validation.suggestedTitle,
      suggestedDescription: validation.suggestedDescription,
      suggestedCategory: validation.suggestedCategory,
      confidence: validation.confidence,
      issues: [],
    });
  } catch (error: any) {
    console.error('Validation error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Validation failed. Please try again.',
        isValid: false,
      },
      { status: 500 }
    );
  }
}
