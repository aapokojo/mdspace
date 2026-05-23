'use client';

import { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '@/lib/store/useCanvasStore';
import {
  createCanvas,
  addBoxToCanvas,
  updateBoxOnCanvas,
  removeBoxFromCanvas,
  getCanvasState,
  fitCanvasToWindow,
} from '@/lib/fabric/setup';
import type { Box } from '@/lib/types';

export default function Canvas() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const canvasStore = useCanvasStore();
  const [fabricLoaded, setFabricLoaded] = useState(false);

  // Dynamically load fabric.js on the client
  useEffect(() => {
    if (typeof window !== 'undefined' && !fabricLoaded) {
      // Check if fabric is already loaded
      if ((window as any).fabric) {
        setFabricLoaded(true);
        return;
      }

      // Dynamically import fabric
      import('fabric').then((fabricModule) => {
        // fabricModule.fabric contains the actual fabric namespace with Canvas, Rect, etc.
        (window as any).fabric = fabricModule.fabric || fabricModule.default;
        setFabricLoaded(true);
      }).catch((e) => {
        console.error('Failed to load fabric.js:', e);
      });
    }
  }, [fabricLoaded]);

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasElementRef.current || !fabricLoaded || !window.fabric || !canvasContainerRef.current) return;

    const canvas = createCanvas(canvasElementRef.current);
    fabricCanvasRef.current = canvas;
    
    // Expose canvas for Playwright testing
    (window as any).testFabricCanvas = canvas;

    // Fit to container
    fitCanvasToWindow(canvas, canvasContainerRef.current);

    // Handle window resize
    const handleResize = () => {
      fitCanvasToWindow(canvas, canvasContainerRef.current);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [fabricLoaded]);

  // Update fabric canvas when current canvas changes
  useEffect(() => {
    if (!fabricCanvasRef.current || !fabricLoaded || !canvasElementRef.current) return;

    const canvas = fabricCanvasRef.current;
    const currentCanvas = canvasStore.getCurrentCanvas();
    const currentBoxes = canvasStore.getCurrentBoxes();

    if (!currentCanvas) return;

    // Save current viewport state before clearing
    const vpt = canvas.viewportTransform?.slice() || [1, 0, 0, 1, 0, 0];
    const currentZoom = canvas.getZoom();

    // Clear and rebuild canvas
    canvas.clear();

    // Add all boxes
    currentBoxes.forEach((box) => {
      addBoxToCanvas(
        canvas,
        box,
        (boxId) => {
          canvasStore.selectBox(boxId);
        },
        (boxId) => {
          // Double click - if box has linked canvas, navigate to it
          const box = canvasStore.getBox(boxId);
          if (box?.linkedCanvasId) {
            canvasStore.navigateToCanvas(box.linkedCanvasId);
          }
        },
        (boxId, newContent) => {
          // Text changed - update box in store
          const box = canvasStore.getBox(boxId);
          if (box) {
            canvasStore.updateBox({ ...box, content: newContent });
          }
        },
        (boxId, newX, newY) => {
          // Box moved - update store
          const box = canvasStore.getBox(boxId);
          if (box && (box.x !== newX || box.y !== newY)) {
            const deltaX = newX - box.x;
            const deltaY = newY - box.y;
            
            // Update the moved box
            canvasStore.updateBox({ ...box, x: newX, y: newY });
            
            // If this box has a linked canvas, move all boxes in that canvas too
            if (box.linkedCanvasId) {
              const nestedCanvas = canvasStore.canvases.find(c => c.id === box.linkedCanvasId);
              if (nestedCanvas) {
                const nestedBoxes = canvasStore.boxes[nestedCanvas.id] || [];
                nestedBoxes.forEach(nestedBox => {
                  canvasStore.updateBox({
                    ...nestedBox,
                    x: nestedBox.x + deltaX,
                    y: nestedBox.y + deltaY,
                  });
                });
              }
            }
          }
        }
      );
    });

    // Restore viewport state after rebuild
    canvas.setViewportTransform(vpt);
    canvas.setZoom(currentZoom);
    canvas.renderAll();
  }, [fabricLoaded, canvasStore.currentCanvasId, canvasStore.boxes]);

  // Center view on selected box (disabled for now - causes jumping)
  // useEffect(() => {
  //   if (!fabricCanvasRef.current || !canvasStore.selectedBoxId || !fabricLoaded || !canvasElementRef.current) return;
  //
  //   const canvas = fabricCanvasRef.current;
  //   const box = canvasStore.getBox(canvasStore.selectedBoxId);
  //   if (!box) return;
  //
  //   // Find the fabric object
  //   const obj = canvas.getObjects().find(
  //     (o: any) => o.type === 'box' && o.boxId === box.id
  //   );
  //
  //   if (obj) {
  //     // Center the view on the box
  //     const center = canvas.getCenter();
  //     const objCenter = obj.getCenterPoint();
  //
  //     canvas.setViewportTransform([
  //       canvas.getZoom(),
  //       0,
  //       0,
  //       canvas.getZoom(),
  //       center.left - objCenter.x * canvas.getZoom(),
  //       center.top - objCenter.y * canvas.getZoom(),
  //     ]);
  //     canvas.renderAll();
  //   }
  // }, [fabricLoaded, canvasStore.selectedBoxId]);

  if (!fabricLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="spinner"></div>
        <span className="ml-4 text-gray-600">Loading fabric.js...</span>
      </div>
    );
  }

  return (
    <div ref={canvasContainerRef} className="w-full h-full">
      <canvas
        ref={canvasElementRef}
        className="w-full h-full"
      />
    </div>
  );
}
