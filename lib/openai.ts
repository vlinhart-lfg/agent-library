import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
}

export interface ValidationResult {
  isValid: boolean;
  quality: 'high' | 'medium' | 'low';
  issues: string[];
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedCategory: string;
  confidence: number;
}

/**
 * Check content for policy violations using OpenAI Moderation API
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const moderation = await openai.moderations.create({
      input: content,
    });

    const result = moderation.results[0];
    const flaggedCategories = Object.entries(result.categories)
      .filter(([_, flagged]) => flagged)
      .map(([category]) => category);

    return {
      flagged: result.flagged,
      categories: flaggedCategories,
    };
  } catch (error: any) {
    console.error('Moderation API error:', error);
    throw new Error('Content moderation failed');
  }
}

/**
 * Validate and enhance scenario submission using GPT-4
 */
export async function validateScenario(data: {
  title: string;
  description: string;
  apps: string;
  category: string;
}): Promise<ValidationResult> {
  try {
    const prompt = `Analyze this Make.com scenario submission and provide validation and enhancement suggestions.

Title: ${data.title}
Description: ${data.description}
Apps: ${data.apps}
Category: ${data.category}

Evaluate:
1. Is this a legitimate automation scenario (not spam)?
2. Quality of description (clarity, completeness)
3. Suggest an improved title if needed
4. Suggest an enhanced description (more professional, clear value proposition)
5. Suggest the best category from: Marketing, Customer Service, Data Analysis, Content Management, Productivity, E-commerce, Development, Other
6. Overall confidence in this being a valid submission (0-1)

Respond with JSON only:
{
  "isValid": boolean,
  "quality": "high" | "medium" | "low",
  "issues": [string],
  "suggestedTitle": string,
  "suggestedDescription": string,
  "suggestedCategory": string,
  "confidence": number
}

If isValid is false, list specific issues. If valid, issues should be empty array.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at evaluating and enhancing automation scenario descriptions. You help make them clear, professional, and valuable to users. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from GPT-4');
    }

    const result = JSON.parse(responseText);

    return {
      isValid: result.isValid ?? true,
      quality: result.quality ?? 'medium',
      issues: result.issues ?? [],
      suggestedTitle: result.suggestedTitle || data.title,
      suggestedDescription: result.suggestedDescription || data.description,
      suggestedCategory: result.suggestedCategory || data.category,
      confidence: result.confidence ?? 0.8,
    };
  } catch (error: any) {
    console.error('GPT-4 validation error:', error);
    throw new Error('AI validation failed: ' + error.message);
  }
}

/**
 * Auto-categorize scenario based on description and apps
 */
export async function categorizeScenario(description: string, apps: string): Promise<string> {
  try {
    const prompt = `Based on this automation scenario, suggest the best category.

Description: ${description}
Apps used: ${apps}

Available categories:
- Marketing
- Customer Service
- Data Analysis
- Content Management
- Productivity
- E-commerce
- Development
- Other

Respond with just the category name, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You categorize automation scenarios. Respond with only the category name.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
      max_tokens: 20,
    });

    return completion.choices[0].message.content?.trim() || 'Other';
  } catch (error: any) {
    console.error('Categorization error:', error);
    return 'Other';
  }
}
