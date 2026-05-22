import { NextRequest, NextResponse } from 'next/server';
import { boxes } from '@/lib/db';

// GET a single box
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; boxId: string }> }
) {
  try {
    const { id: canvasId, boxId } = await params;

    const allBoxes = await boxes.select();
    const box = allBoxes.find((b) => b.canvasId === canvasId && b.id === boxId);

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    return NextResponse.json(box);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch box' }, { status: 500 });
  }
}

// PUT update a box
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; boxId: string }> }
) {
  try {
    const { id: canvasId, boxId } = await params;
    const body = await request.json();
    const {
      content,
      x,
      y,
      width,
      height,
      color,
      linkedCanvasId,
    } = body;

    const updated = await boxes.update(
      {
        content,
        x,
        y,
        width,
        height,
        color,
        linkedCanvasId,
      },
      { id: boxId, canvasId }
    );

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update box' }, { status: 500 });
  }
}

// DELETE a box
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; boxId: string }> }
) {
  try {
    const { id: canvasId, boxId } = await params;

    const deleted = await boxes.delete({ id: boxId, canvasId });

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Box deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete box' }, { status: 500 });
  }
}
