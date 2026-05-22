import { NextResponse } from 'next/server';
import { canvases, boxes } from '@/lib/db';

// GET export all boxes as markdown content
export async function GET() {
  try {
    const allCanvases = await canvases.select();
    const allBoxes = await boxes.select();

    // Create markdown content for each box
    const markdownFiles: Record<string, string> = {};

    // Group boxes by canvas
    const boxesByCanvas = allBoxes.reduce((acc, box) => {
      if (!acc[box.canvasId]) acc[box.canvasId] = [];
      acc[box.canvasId].push(box);
      return acc;
    }, {} as Record<string, typeof allBoxes>);

    // Create a markdown file for each canvas
    for (const canvas of allCanvases) {
      const canvasBoxes = boxesByCanvas[canvas.id] || [];

      const content = [
        `# ${canvas.name}`,
        '',
        `Canvas ID: ${canvas.id}`,
        `Created: ${canvas.createdAt ? new Date(canvas.createdAt).toISOString() : 'Unknown'}`,
        `Updated: ${canvas.updatedAt ? new Date(canvas.updatedAt).toISOString() : 'Unknown'}`,
        '',
        '---',
        '',
        ...canvasBoxes.map((box, index) => {
          return [
            `## Box ${index + 1} ${box.content.split('\n')[0].slice(0, 50)}`,
            '',
            `**Position:** (${box.x}, ${box.y})`,
            `**Size:** ${box.width} x ${box.height}`,
            `**Box ID:** ${box.id}`,
            `**Created:** ${box.createdAt ? new Date(box.createdAt).toISOString() : 'Unknown'}`,
            `**Updated:** ${box.updatedAt ? new Date(box.updatedAt).toISOString() : 'Unknown'}`,
            '',
            box.content,
            '',
            '---',
            '',
          ].join('\n');
        }),
      ].join('\n');

      markdownFiles[`${canvas.name.replace(/\s+/g, '_')}.md`] = content;
    }

    // Also create individual files for each box
    for (const box of allBoxes) {
      const canvas = allCanvases.find((c) => c.id === box.canvasId);
      const canvasName = canvas ? canvas.name.replace(/\s+/g, '_') : 'Unknown';
      const filename = `${canvasName}_Box_${box.id.slice(0, 8)}.md`;
      
      const content = [
        `# ${box.content.split('\n')[0].slice(0, 50) || 'Untitled'}`,
        '',
        `**Box ID:** ${box.id}`,
        `**Canvas ID:** ${box.canvasId}`,
        `**Canvas:** ${canvas?.name || 'Unknown'}`,
        `**Position:** (${box.x}, ${box.y})`,
        `**Size:** ${box.width} x ${box.height}`,
        `**Created:** ${box.createdAt ? new Date(box.createdAt).toISOString() : 'Unknown'}`,
        `**Updated:** ${box.updatedAt ? new Date(box.updatedAt).toISOString() : 'Unknown'}`,
        '',
        '---',
        '',
        box.content,
      ].join('\n');

      markdownFiles[filename] = content;
    }

    return NextResponse.json({
      message: 'Export successful',
      files: markdownFiles,
      totalFiles: Object.keys(markdownFiles).length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export' },
      { status: 500 }
    );
  }
}
