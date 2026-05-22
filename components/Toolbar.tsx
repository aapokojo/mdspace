'use client';

import { useCanvasStore } from '@/lib/store/useCanvasStore';

interface ToolbarProps {
  onMenuToggle?: () => void;
}

export default function Toolbar({ onMenuToggle }: ToolbarProps) {
  const canvasStore = useCanvasStore();

  const handleNewBox = () => {
    // Create a new box at center
    const canvas = canvasStore.getCurrentCanvas();
    if (!canvas) return;

    const newBox = {
      id: crypto.randomUUID(),
      canvasId: canvas.id,
      content: 'New Box',
      x: 200,
      y: 200,
      width: 160,
      height: 80,
      color: '#fff',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    canvasStore.addBox(newBox);
    canvasStore.selectBox(newBox.id);
  };

  return (
    <div className="toolbar">
      <span id="breadcrumbs">
        <div className="menu-container">
          <button 
            className="menu-toggle-button" 
            title="Show canvas hierarchy"
            onClick={onMenuToggle}
          >
            ◼
          </button>
          <HierarchyBreadcrumbs />
        </div>
      </span>
      
      <div className="toolbar-controls">
        <button 
          className="control"
          onClick={handleNewBox}
        >
          Add a <b>B</b>ox<span className="shortcut">◼</span>
        </button>
      </div>
      
      <div className="header-right">
        <span className="app-title">mdspace</span>
      </div>
    </div>
  );
}

function HierarchyBreadcrumbs() {
  const canvasStore = useCanvasStore();
  const breadcrumb = canvasStore.getBreadcrumb();

  if (breadcrumb.length === 0) {
    return <span className="breadcrumb-active">No canvases</span>;
  }

  return (
    <div className="breadcrumb-path">
      {breadcrumb.map((canvas, index) => (
        <span key={canvas.id} className="breadcrumb-link">
          {canvas.name}
          {index < breadcrumb.length - 1 && <span className="breadcrumb-separator"> / </span>}
        </span>
      ))}
    </div>
  );
}
