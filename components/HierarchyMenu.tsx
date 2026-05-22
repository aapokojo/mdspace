'use client';

import { useCanvasStore } from '@/lib/store/useCanvasStore';
import type { CanvasNode, Canvas } from '@/lib/types';

interface HierarchyMenuProps {
  isOpen: boolean;
}

// Hierarchy node component
function HierarchyNode({
  node,
  depth = 0,
}: {
  node: CanvasNode;
  depth?: number;
}) {
  const canvasStore = useCanvasStore();
  const currentCanvasId = canvasStore.currentCanvasId;

  const isActive = currentCanvasId === node.canvas.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    canvasStore.navigateToCanvas(node.canvas.id);
  };

  return (
    <div className={`hierarchy-item ${isActive ? 'active' : ''}`}>
      <div onClick={handleClick}>
        <span className="canvas-name">{node.canvas.name}</span>
        {node.boxes.length > 0 && (
          <span className="box-count">{node.boxes.length} boxes</span>
        )}
      </div>

      {node.children.length > 0 && (
        <div className="hierarchy-item children">
          {node.children.map((child) => (
            <HierarchyNode key={child.canvas.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Build hierarchy tree from flat data
function buildHierarchyTree(
  canvases: Canvas[],
  boxes: Record<string, any[]>
): CanvasNode[] {
  const canvasMap = new Map(canvases.map((c) => [c.id, c]));

  function buildNode(canvasId: string): CanvasNode | null {
    const canvas = canvasMap.get(canvasId);
    if (!canvas) return null;

    const canvasBoxes = boxes[canvasId] || [];

    // Find boxes that link to other canvases
    const childCanvasIds = canvasBoxes
      .filter((b) => b.linkedCanvasId)
      .map((b) => b.linkedCanvasId)
      .filter((id): id is string => !!id);

    const children = childCanvasIds
      .map((id) => buildNode(id))
      .filter(Boolean) as CanvasNode[];

    return {
      canvas,
      boxes: canvasBoxes,
      children,
    };
  }

  // Find root canvases (those without parentCanvasId)
  const rootCanvases = canvases.filter((c) => !c.parentCanvasId);

  return rootCanvases.map((c) => buildNode(c.id)).filter(Boolean) as CanvasNode[];
}

export default function HierarchyMenu({ isOpen }: HierarchyMenuProps) {
  const canvasStore = useCanvasStore();
  const hierarchy = buildHierarchyTree(canvasStore.canvases, canvasStore.boxes);

  // Navigate to parent
  const handleGoUp = () => {
    canvasStore.navigateToParent();
  };

  // Close menu when clicking outside
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} onClick={handleClose}>
      <div className="hierarchy-title">
        Hierarchy
        {canvasStore.getBreadcrumb().length > 1 && (
          <button
            onClick={handleGoUp}
            className="menu-toggle-button"
            style={{ float: 'right' }}
          >
            ↑
          </button>
        )}
      </div>

      <div className="hierarchy-items">
        {hierarchy.length > 0 ? (
          hierarchy.map((node) => (
            <HierarchyNode key={node.canvas.id} node={node} />
          ))
        ) : (
          <p className="hierarchy-empty">No canvases yet</p>
        )}
      </div>

      <div className="sidebar-footer" style={{ padding: '8px 12px', borderTop: '1px solid #444', fontSize: '10px' }}>
        Current: {canvasStore.getCurrentCanvas()?.name || 'None'}
      </div>
    </aside>
  );
}
