// Type definitions for the database
// Note: These must match the types in lib/types.ts

// Canvas type for database
export interface CanvasRow {
  id: string;
  name: string;
  parentBoxId?: string;
  parentCanvasId?: string;
  zoom?: number;
  panX?: number;
  panY?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BoxRow {
  id: string;
  canvasId: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  linkedCanvasId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIProviderRow {
  id: string;
  name: string;
  type: 'claude' | 'gemini' | 'openai' | 'local';
  apiKey?: string;
  endpoint?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Insert types (without auto-generated fields)
export interface NewCanvas {
  id?: string;
  name: string;
  parentBoxId?: string;
  parentCanvasId?: string;
  zoom?: number;
  panX?: number;
  panY?: number;
}

export interface NewBox {
  id?: string;
  canvasId: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  linkedCanvasId?: string;
}

export interface NewAIProvider {
  id?: string;
  name: string;
  type: 'claude' | 'gemini' | 'openai' | 'local';
  apiKey?: string;
  endpoint?: string;
}

// Export types for TypeScript
export type Canvas = CanvasRow;
export type Box = BoxRow;
export type AIProvider = AIProviderRow;
