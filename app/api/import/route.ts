import { NextRequest, NextResponse } from 'next/server';
import { canvases, boxes } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// POST import markdown files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    let importedCount = 0;

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const content = await file.text();
      const filename = file.name;

      // Parse the markdown content to extract metadata and content
      const lines = content.split('\n');
      let title = filename.replace('.md', '').replace(/_/g, ' ');
      let boxContent = content;
      let position = { x: 0, y: 0 };
      let size = { width: 200, height: 150 };

      // Try to extract metadata from the first few lines
      if (lines[0].startsWith('# ')) {
        title = lines[0].slice(2).trim();
      }

      // Look for metadata in the format **Key:** value
      for (let i = 1; i < Math.min(lines.length, 10); i++) {
        const line = lines[i];
        const positionMatch = line.match(/\*\*Position:\*\*\s+\(([\d.]+),\s*([\d.]+)\)/);
        const sizeMatch = line.match(/\*\*Size:\*\*\s+([\d.]+)\s*x\s*([\d.]+)/);

        if (positionMatch) {
          position = {
            x: parseFloat(positionMatch[1]),
            y: parseFloat(positionMatch[2]),
          };
        }

        if (sizeMatch) {
          size = {
            width: parseFloat(sizeMatch[1]),
            height: parseFloat(sizeMatch[2]),
          };
        }

        // Check for separator
        if (line.trim() === '---') {
          // Content starts after the separator
          const contentStart = lines.findIndex(
            (l, idx) => idx > i && l.trim() !== ''
          );
          if (contentStart > 0) {
            boxContent = lines.slice(contentStart).join('\n');
          }
          break;
        }
      }

      // Create a new canvas for each imported file
      const canvasId = uuidv4();

      await canvases.insert([{
        id: canvasId,
        name: title,
        zoom: 1,
        panX: 0,
        panY: 0,
      }]);

      // Create a box with the content
      await boxes.insert([{
        id: uuidv4(),
        canvasId,
        content: boxContent,
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        color: '#fdecd7',
      }]);

      importedCount++;
    }

    return NextResponse.json({
      message: `Imported ${importedCount} file(s)`,
      importedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to import files' },
      { status: 500 }
    );
  }
}
