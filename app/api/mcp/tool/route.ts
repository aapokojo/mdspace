import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp/client';

// POST call a tool on a connected MCP server
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverName, toolName, parameters } = body;

    if (!serverName || !toolName) {
      return NextResponse.json(
        { error: 'serverName and toolName are required' },
        { status: 400 }
      );
    }

    const result = await mcpClient.callTool(serverName, toolName, parameters || {});

    return NextResponse.json({
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to call tool' },
      { status: 500 }
    );
  }
}
