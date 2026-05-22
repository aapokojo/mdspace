// Core domain types for mdspace

export interface BoxPosition {
  x: number;
  y: number;
}

export interface BoxSize {
  width: number;
  height: number;
}

export interface Box {
  id: string;
  canvasId: string;
  content: string; // Markdown content
  x: number; // Position X (flat for DB compatibility)
  y: number; // Position Y (flat for DB compatibility)
  width: number; // Width (flat for DB compatibility)
  height: number; // Height (flat for DB compatibility)
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  // If this box is a portal to another canvas
  linkedCanvasId?: string;
}

// Helper types for internal use
export type BoxWithPosition = Box & {
  position: BoxPosition;
  size: BoxSize;
};

export interface Canvas {
  id: string;
  name: string;
  parentBoxId?: string; // The box that opens this canvas (for nested canvases)
  parentCanvasId?: string; // Parent canvas for hierarchy
  createdAt: Date;
  updatedAt: Date;
  zoom?: number;
  panX?: number;
  panY?: number;
}

// Hierarchy tree structure for the menu
export interface CanvasNode {
  canvas: Canvas;
  boxes: Box[];
  children: CanvasNode[]; // Nested canvases (from boxes with linkedCanvasId)
}

// For the fabric.js canvas state
export interface FabricBoxObject {
  id: string;
  type: 'box';
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  boxId: string; // Reference to the Box in database
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
}

// AI integration types
export interface AIProvider {
  id: string;
  name: string;
  type: 'claude' | 'gemini' | 'openai' | 'local';
  apiKey?: string;
  endpoint?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  boxId?: string;
}

export interface AIGenerationRequest {
  boxId: string;
  prompt: string;
  providerId: string;
  context?: string; // Additional context from canvas
}

export interface AIGenerationResponse {
  id: string;
  content: string;
  boxId: string;
  createdAt: Date;
}

// MCP integration types
export interface MCPResource {
  uri: string;
  name: string;
  mimeType: string;
  content: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
