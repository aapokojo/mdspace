import { NextRequest, NextResponse } from 'next/server';
import { canvases, NewCanvas } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET all canvases
export async function GET() {
  try {
    const allCanvases = await canvases.select();
    return NextResponse.json(allCanvases);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch canvases' },
      { status: 500 }
    );
  }
}

// POST create a new canvas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parentBoxId, parentCanvasId } = body;

    const newCanvas: NewCanvas = {
      id: uuidv4(),
      name: name || `Canvas ${Date.now()}`,
      parentBoxId,
      parentCanvasId,
      zoom: 1,
      panX: 0,
      panY: 0,
    };

    const created = await canvases.insert([newCanvas]);

    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create canvas' },
      { status: 500 }
    );
  }
}
