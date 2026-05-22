import { NextRequest, NextResponse } from 'next/server';
import { boxes, NewBox } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET all boxes for a canvas
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const canvasBoxes = await boxes.selectByCanvas(id);

    return NextResponse.json(canvasBoxes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch boxes' },
      { status: 500 }
    );
  }
}

// POST create a new box
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: canvasId } = await params;
    const body = await request.json();
    const {
      content = '',
      x = 0,
      y = 0,
      width = 200,
      height = 150,
      color = '#fdecd7',
      linkedCanvasId,
    } = body;

    const newBox: NewBox = {
      id: uuidv4(),
      canvasId,
      content,
      x,
      y,
      width,
      height,
      color,
      linkedCanvasId,
    };

    const created = await boxes.insert([newBox]);

    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create box' },
      { status: 500 }
    );
  }
}
