import { NextRequest, NextResponse } from 'next/server';
import { aiProviders, NewAIProvider } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET all AI providers
export async function GET() {
  try {
    const providers = await aiProviders.select();
    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch AI providers' },
      { status: 500 }
    );
  }
}

// POST create a new AI provider
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, apiKey, endpoint } = body;

    const newProvider: NewAIProvider = {
      id: uuidv4(),
      name,
      type,
      apiKey,
      endpoint,
    };

    const created = await aiProviders.insert([newProvider]);

    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create AI provider' },
      { status: 500 }
    );
  }
}
