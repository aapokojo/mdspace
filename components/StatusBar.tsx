'use client';

import { useCanvasStore } from '@/lib/store/useCanvasStore';
import { useAIStore } from '@/lib/store/useAIStore';

export default function StatusBar() {
  const canvasStore = useCanvasStore();
  const aiStore = useAIStore();

  const currentCanvas = canvasStore.getCurrentCanvas();
  const currentBoxes = canvasStore.getCurrentBoxes();
  const currentProvider = aiStore.getCurrentProvider();

  const mcpConnected = currentProvider !== null;
  const statusClass = mcpConnected ? 'connected' : 'disconnected';

  return (
    <div className="status-bar">
      <span>
        {currentCanvas?.name || 'No canvas'} | {currentBoxes.length} boxes
      </span>
      
      <div className={`connection-status ${statusClass}`}>
        MCP: {mcpConnected ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
}
