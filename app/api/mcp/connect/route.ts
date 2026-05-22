import { NextRequest, NextResponse } from 'next/server';
import { mcpClient, MCP_SERVER_CONFIGS } from '@/lib/mcp/client';

// POST connect to an MCP server
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverName, command, args } = body;

    // Use predefined config or custom
    const config = MCP_SERVER_CONFIGS[serverName as keyof typeof MCP_SERVER_CONFIGS] ||
      { command, args: args || [] };

    const connection = await mcpClient.connectToModel(
      serverName,
      config.command,
      config.args
    );

    return NextResponse.json({
      message: `Connected to ${serverName}`,
      tools: [],
      resources: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to connect to MCP server' },
      { status: 500 }
    );
  }
}

// GET list active connections
export async function GET() {
  try {
    const connections = mcpClient.getConnections();
    const details = connections.map((serverName) => ({
      serverName,
      tools: [],
      resources: [],
    }));

    return NextResponse.json(details);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get connections' },
      { status: 500 }
    );
  }
}
