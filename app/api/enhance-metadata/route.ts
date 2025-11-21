import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface EnhanceMetadataRequest {
    title: string;
    description: string;
    instructions?: string;
    apps: string;
}

interface EnhanceMetadataResponse {
    useCase: string;
    complexity: 'Beginner' | 'Intermediate' | 'Advanced';
    tags: string[];
}

export async function POST(req: NextRequest) {
    try {
        const { title, description, instructions, apps } = await req.json() as EnhanceMetadataRequest;

        if (!title || !description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            );
        }

        const prompt = `Analyze this Make.com automation scenario and provide metadata in JSON format.

Title: ${title}
Description: ${description}
Apps used: ${apps}
${instructions ? `Instructions: ${instructions}` : ''}

Please provide:
1. useCase: A concise one-sentence description of what problem this automation solves (max 100 characters)
2. complexity: One of "Beginner", "Intermediate", or "Advanced" based on the technical requirements
3. tags: An array of 3-5 relevant keywords/tags (lowercase, single words or short phrases)

Return ONLY valid JSON in this exact format:
{
  "useCase": "string",
  "complexity": "Beginner" | "Intermediate" | "Advanced",
  "tags": ["tag1", "tag2", "tag3"]
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that analyzes automation scenarios and provides structured metadata. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 300,
        });

        const responseText = completion.choices[0]?.message?.content?.trim();

        if (!responseText) {
            throw new Error('No response from OpenAI');
        }

        // Parse the JSON response
        const metadata: EnhanceMetadataResponse = JSON.parse(responseText);

        // Validate the response
        if (!metadata.useCase || !metadata.complexity || !Array.isArray(metadata.tags)) {
            throw new Error('Invalid metadata format from AI');
        }

        return NextResponse.json(metadata);
    } catch (error: any) {
        console.error('Error enhancing metadata:', error);

        // Return fallback metadata if AI fails
        return NextResponse.json({
            useCase: 'Automate workflows and save time',
            complexity: 'Intermediate',
            tags: ['automation', 'productivity', 'workflow']
        });
    }
}
