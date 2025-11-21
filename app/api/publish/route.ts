import { NextResponse } from 'next/server';
import { publishScenario } from '@/lib/github';
import { sanitizeScenarioData } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Sanitize inputs
    const sanitized = sanitizeScenarioData(body);

    // Use AI-suggested enhancements if provided
    const finalData = {
      makeScenarioUrl: sanitized.makeScenarioUrl,
      title: body.suggestedTitle || sanitized.title,
      description: body.suggestedDescription || sanitized.description,
      apps: sanitized.apps,
      category: body.suggestedCategory || body.category,
      iframeUrl: sanitized.iframeUrl,
      buttonUrl: sanitized.buttonUrl,
      useCase: body.useCase,
      complexity: body.complexity,
      tags: body.tags,
      instructions: body.instructions,
      createdDate: body.createdDate,
    };

    // Publish to GitHub
    const result = await publishScenario(finalData);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to publish scenario',
        },
        { status: 500 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      scenarioId: result.scenarioId,
      slug: result.slug,
      url: `/${result.slug}`,
      message: 'Scenario published successfully! It will appear on the site within 3 minutes.',
    });
  } catch (error: any) {
    console.error('Publish error:', error);

    // Handle duplicate scenarios
    if (error.message.includes('already been submitted')) {
      return NextResponse.json(
        {
          error: 'This scenario has already been submitted',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to publish scenario. Please try again.',
      },
      { status: 500 }
    );
  }
}
