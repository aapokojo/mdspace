import { NextRequest, NextResponse } from 'next/server';
import { boxes, aiProviders } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { AIGenerationRequest } from '@/lib/types';

// POST generate text with AI for a box
export async function POST(request: NextRequest) {
  try {
    const body: AIGenerationRequest = await request.json();
    const { boxId, prompt, providerId, context } = body;

    // Get the provider
    const allProviders = await aiProviders.select();
    const provider = allProviders.find((p) => p.id === providerId);

    if (!provider) {
      return NextResponse.json(
        { error: 'AI provider not found' },
        { status: 404 }
      );
    }

    // Verify box exists
    const allBoxes = await boxes.select();
    const box = allBoxes.find((b) => b.id === boxId);

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    // For demo purposes, return a mock response
    // In production, you would call the actual AI API here
    const mockResponse = `Based on your prompt "${prompt}", here's a generated response.` +
      (context ? `\n\nContext from box: ${context.slice(0, 200)}...` : '');

    return NextResponse.json({
      id: uuidv4(),
      content: mockResponse,
      boxId,
      providerId,
      prompt,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate text' },
      { status: 500 }
    );
  }
}
