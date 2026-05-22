// MCP Server stub - exposes mdspace data to AI models
// This is a placeholder implementation
// To use the actual MCP SDK, install: npm install @modelcontextprotocol/sdk

import { canvases, boxes } from '@/lib/db';

// Helper function to build hierarchy tree
function buildHierarchy(canvasesList: any[], boxesList: any[]) {
  const canvasMap = new Map(canvasesList.map((c: any) => [c.id, c]));

  function buildNode(canvasId: string): any {
    const canvas = canvasMap.get(canvasId);
    if (!canvas) return null;

    const canvasBoxes = boxesList.filter((b: any) => b.canvasId === canvasId);

    const children = canvasBoxes
      .filter((b: any) => b.linkedCanvasId)
      .map((b: any) => buildNode(b.linkedCanvasId))
      .filter(Boolean);

    return {
      canvas,
      boxes: canvasBoxes,
      children,
    };
  }

  const rootCanvases = canvasesList.filter((c: any) => !c.parentCanvasId);
  return rootCanvases.map((c: any) => buildNode(c.id)).filter(Boolean);
}

// Exported functions for MCP server (to be implemented with actual SDK)
export async function listCanvases() {
  const allCanvases = await canvases.select();
  return allCanvases;
}

export async function listBoxes(canvasId: string) {
  const canvasBoxes = await boxes.selectByCanvas(canvasId);
  return canvasBoxes;
}

export async function getBox(boxId: string) {
  const allBoxes = await boxes.select();
  return allBoxes.find((b: any) => b.id === boxId) || null;
}

export async function getHierarchy() {
  const allCanvases = await canvases.select();
  const allBoxes = await boxes.select();
  return buildHierarchy(allCanvases, allBoxes);
}

export async function searchBoxes(query: string) {
  const allBoxes = await boxes.select();
  return allBoxes.filter((box: any) =>
    box.content.toLowerCase().includes(query.toLowerCase())
  );
}

// Start MCP server (placeholder)
export async function startMCPServer() {
  console.log('MCP Server stub: mdspace data is accessible via the exported functions');
  console.log('To implement full MCP server, install @modelcontextprotocol/sdk');
  console.log('Available functions:');
  console.log('  - listCanvases()');
  console.log('  - listBoxes(canvasId)');
  console.log('  - getBox(boxId)');
  console.log('  - getHierarchy()');
  console.log('  - searchBoxes(query)');
}
