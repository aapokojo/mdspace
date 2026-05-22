import { NextRequest, NextResponse } from 'next/server';
import { canvases, boxes } from '@/lib/db';

// GET a single canvas with its boxes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const allCanvases = await canvases.select();
    const canvas = allCanvases.find((c) => c.id === id);

    if (!canvas) {
      return NextResponse.json({ error: 'Canvas not found' }, { status: 404 });
    }

    const canvasBoxes = await boxes.selectByCanvas(id);

    return NextResponse.json({
      canvas,
      boxes: canvasBoxes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch canvas' },
      { status: 500 }
    );
  }
}

// PUT update a canvas
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, zoom, panX, panY } = body;

    const updated = await canvases.update(
      { name, zoom, panX, panY },
      { id }
    );

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Canvas not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update canvas' },
      { status: 500 }
    );
  }
}

// DELETE a canvas and its boxes
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete all boxes in this canvas first
    const allBoxes = await boxes.select();
    const boxesToDelete = allBoxes.filter((b) => b.canvasId === id);
    for (const box of boxesToDelete) {
      await boxes.delete({ id: box.id });
    }

    // Delete the canvas
    const deleted = await canvases.delete({ id });

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Canvas not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Canvas deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete canvas' },
      { status: 500 }
    );
  }
}
