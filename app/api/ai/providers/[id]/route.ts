import { NextRequest, NextResponse } from 'next/server';
import { aiProviders } from '@/lib/db';

// GET a single AI provider
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const allProviders = await aiProviders.select();
    const provider = allProviders.find((p) => p.id === id);

    if (!provider) {
      return NextResponse.json({ error: 'AI provider not found' }, { status: 404 });
    }

    return NextResponse.json(provider);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch AI provider' },
      { status: 500 }
    );
  }
}

// PUT update an AI provider
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, apiKey, endpoint } = body;

    const updated = await aiProviders.update(
      { name, type, apiKey, endpoint },
      { id }
    );

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'AI provider not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update AI provider' },
      { status: 500 }
    );
  }
}

// DELETE an AI provider
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await aiProviders.delete({ id });

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'AI provider not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'AI provider deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete AI provider' },
      { status: 500 }
    );
  }
}
