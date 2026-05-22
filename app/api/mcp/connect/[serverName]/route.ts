import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/lib/mcp/client';

// DELETE disconnect from an MCP server
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serverName: string }> }
) {
  try {
    const { serverName } = await params;
    await mcpClient.disconnectFromModel(serverName);

    return NextResponse.json({
      message: `Disconnected from ${serverName}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
