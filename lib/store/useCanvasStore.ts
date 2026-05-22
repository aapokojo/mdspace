import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Box, Canvas, CanvasNode } from '@/lib/types';

interface CanvasState {
  // Current canvas being viewed
  currentCanvasId: string | null;
  
  // All canvases
  canvases: Canvas[];
  
  // All boxes, indexed by canvasId
  boxes: Record<string, Box[]>;
  
  // Selected box
  selectedBoxId: string | null;
  
  // Hierarchy tree
  hierarchy: CanvasNode[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentCanvas: (canvasId: string) => void;
  setCanvases: (canvases: Canvas[]) => void;
  setBoxes: (canvasId: string, boxes: Box[]) => void;
  addBox: (box: Box) => void;
  updateBox: (box: Box) => void;
  removeBox: (boxId: string) => void;
  selectBox: (boxId: string | null) => void;
  setHierarchy: (hierarchy: CanvasNode[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Navigation
  navigateToCanvas: (canvasId: string) => void;
  navigateToParent: () => void;
  openBoxAsCanvas: (boxId: string, newCanvas: Canvas) => void;
  
  // Get current canvas
  getCurrentCanvas: () => Canvas | null;
  
  // Get current boxes
  getCurrentBoxes: () => Box[];
  
  // Get box by ID
  getBox: (boxId: string) => Box | null;
  
  // Get parent canvas chain
  getBreadcrumb: () => Canvas[];
}

export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentCanvasId: null,
        canvases: [],
        boxes: {},
        selectedBoxId: null,
        hierarchy: [],
        isLoading: false,
        error: null,

        // Actions
        setCurrentCanvas: (canvasId) => {
          set({ currentCanvasId: canvasId });
        },

        setCanvases: (canvases) => {
          set({ canvases });
        },

        setBoxes: (canvasId, boxes) => {
          set((state) => ({
            boxes: { ...state.boxes, [canvasId]: boxes },
          }));
        },

        addBox: (box) => {
          set((state) => ({
            boxes: {
              ...state.boxes,
              [box.canvasId]: [...(state.boxes[box.canvasId] || []), box],
            },
          }));
        },

        updateBox: (updatedBox) => {
          set((state) => {
            const canvasBoxes = state.boxes[updatedBox.canvasId] || [];
            const newBoxes = canvasBoxes.map((b) =>
              b.id === updatedBox.id ? updatedBox : b
            );
            return {
              boxes: { ...state.boxes, [updatedBox.canvasId]: newBoxes },
            };
          });
        },

        removeBox: (boxId) => {
          set((state) => {
            const { currentCanvasId } = state;
            if (!currentCanvasId) return state;

            const newBoxes = (state.boxes[currentCanvasId] || []).filter(
              (b) => b.id !== boxId
            );
            return {
              boxes: { ...state.boxes, [currentCanvasId]: newBoxes },
              selectedBoxId: state.selectedBoxId === boxId ? null : state.selectedBoxId,
            };
          });
        },

        selectBox: (boxId) => {
          set({ selectedBoxId: boxId });
        },

        setHierarchy: (hierarchy) => {
          set({ hierarchy });
        },

        setLoading: (isLoading) => {
          set({ isLoading });
        },

        setError: (error) => {
          set({ error });
        },

        // Navigation
        navigateToCanvas: (canvasId) => {
          set({ currentCanvasId: canvasId, selectedBoxId: null });
        },

        navigateToParent: () => {
          const { currentCanvasId, canvases } = get();
          if (!currentCanvasId) return;

          const currentCanvas = canvases.find((c) => c.id === currentCanvasId);
          if (!currentCanvas?.parentCanvasId) return;

          set({ currentCanvasId: currentCanvas.parentCanvasId, selectedBoxId: null });
        },

        openBoxAsCanvas: (boxId, newCanvas) => {
          const { currentCanvasId } = get();
          if (!currentCanvasId) return;

          // Add the new canvas
          set((state) => ({
            canvases: [...state.canvases, newCanvas],
          }));

          // Update the box to link to the new canvas
          set((state) => {
            const canvasBoxes = state.boxes[currentCanvasId] || [];
            const newBoxes = canvasBoxes.map((b) =>
              b.id === boxId ? { ...b, linkedCanvasId: newCanvas.id } : b
            );
            return {
              boxes: { ...state.boxes, [currentCanvasId]: newBoxes },
              currentCanvasId: newCanvas.id,
              selectedBoxId: null,
            };
          });
        },

        // Getters
        getCurrentCanvas: () => {
          const { currentCanvasId, canvases } = get();
          return canvases.find((c) => c.id === currentCanvasId) || null;
        },

        getCurrentBoxes: () => {
          const { currentCanvasId, boxes } = get();
          return currentCanvasId ? boxes[currentCanvasId] || [] : [];
        },

        getBox: (boxId) => {
          const { boxes } = get();
          for (const canvasBoxes of Object.values(boxes)) {
            const found = canvasBoxes.find((b) => b.id === boxId);
            if (found) return found;
          }
          return null;
        },

        getBreadcrumb: () => {
          const { currentCanvasId, canvases } = get();
          if (!currentCanvasId) return [];

          const breadcrumb: Canvas[] = [];
          let currentId: string | undefined = currentCanvasId;

          while (currentId) {
            const canvas = canvases.find((c) => c.id === currentId);
            if (!canvas) break;
            breadcrumb.unshift(canvas);
            currentId = canvas.parentCanvasId;
          }

          return breadcrumb;
        },
      }),
      {
        name: 'canvas-store',
        partialize: (state) => ({
          // Only persist these fields
          currentCanvasId: state.currentCanvasId,
          canvases: state.canvases,
          boxes: state.boxes,
        }),
      }
    ),
    { name: 'CanvasStore' }
  )
);
