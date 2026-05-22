import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp/client';

// POST read a resource from a connected MCP server
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverName, uri } = body;

    if (!serverName || !uri) {
      return NextResponse.json(
        { error: 'serverName and uri are required' },
        { status: 400 }
      );
    }

    const { content, mimeType } = await mcpClient.readResource(serverName, uri);

    return NextResponse.json({
      content,
      mimeType,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to read resource' },
      { status: 500 }
    );
  }
}
