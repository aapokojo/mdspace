'use client';

import { useEffect, useState, useRef } from 'react';
import { useCanvasStore } from '@/lib/store/useCanvasStore';
import CanvasComponent from '@/components/Canvas';
import HierarchyMenu from '@/components/HierarchyMenu';
import Toolbar from '@/components/Toolbar';
import AIPanel from '@/components/AIPanel';
import StatusBar from '@/components/StatusBar';
import { v4 as uuidv4 } from 'uuid';
import type { Canvas, Box } from '@/lib/types';

export default function HomePage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHierarchyOpen, setIsHierarchyOpen] = useState(false);
  const canvasStore = useCanvasStore();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Expose store for Playwright testing
  useEffect(() => {
    (window as any).testCanvasStore = canvasStore;
  }, [canvasStore]);

  // Initialize with a root canvas if none exists
  // Add delay to ensure persist has hydrated from localStorage
  useEffect(() => {
    const initialize = async () => {
      // Wait for persist to finish hydrating from localStorage
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check if we have any canvases after hydration
      if (canvasStore.canvases.length === 0) {
        // Create a root canvas
        const rootCanvas: Canvas = {
          id: uuidv4(),
          name: 'Root Canvas',
          createdAt: new Date(),
          updatedAt: new Date(),
          zoom: 1,
          panX: 0,
          panY: 0,
        };

        canvasStore.setCanvases([rootCanvas]);
        canvasStore.setCurrentCanvas(rootCanvas.id);

        // Add a welcome box
        const welcomeBox: Box = {
          id: uuidv4(),
          canvasId: rootCanvas.id,
          content: `Welcome to mdspace!

This is an infinite canvas where you can create boxes.

Double-click a box to open it as a nested canvas.
Click the ◼ button to see the hierarchy.
Press G to toggle grid.`,
          x: 100,
          y: 100,
          width: 200,
          height: 120,
          color: '#fff',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        canvasStore.addBox(welcomeBox);
      } else if (!canvasStore.currentCanvasId) {
        // Use the first canvas as default
        canvasStore.setCurrentCanvas(canvasStore.canvases[0].id);
      }

      setIsInitialized(true);
    };

    initialize();
  }, []);

  // Toggle hierarchy menu
  const toggleHierarchy = () => {
    setIsHierarchyOpen(!isHierarchyOpen);
  };

  if (!isInitialized) {
    return (
      <div className="canvas-loading-overlay">
        <div className="canvas-loading-content">
          <div className="loading-spinner"></div>
          <p>Loading ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header with menu toggle and controls */}
      <Toolbar onMenuToggle={toggleHierarchy} />
      
      {/* Hierarchy Menu - positioned by CSS */}
      <HierarchyMenu isOpen={isHierarchyOpen} />
      
      {/* Canvas Area - fixed position */}
      <div ref={canvasRef} className="canvas-container">
        <CanvasComponent />
      </div>
      
      {/* AI Panel */}
      <AIPanel />
      
      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
