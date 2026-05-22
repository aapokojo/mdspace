// Simple in-memory + IndexedDB storage for the demo
// For production, consider using SQLite, PostgreSQL, or a cloud database

import { v4 as uuidv4 } from 'uuid';
import type { Canvas, Box, NewCanvas, NewBox, AIProvider, NewAIProvider } from './schema';

// In-memory storage (replaced with IndexedDB for persistence)
let canvasesStore: Canvas[] = [];
let boxesStore: Box[] = [];
let aiProvidersStore: AIProvider[] = [];

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('mdspaceDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('canvases')) {
        db.createObjectStore('canvases', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('boxes')) {
        const store = db.createObjectStore('boxes', { keyPath: 'id' });
        store.createIndex('canvasId', 'canvasId', { unique: false });
        store.createIndex('linkedCanvasId', 'linkedCanvasId', { unique: false });
      }
      if (!db.objectStoreNames.contains('aiProviders')) {
        db.createObjectStore('aiProviders', { keyPath: 'id' });
      }
    };
  });
}

// Load data from IndexedDB
async function loadFromDB() {
  try {
    const db = await openDB();

    const loadAll = <T>(storeName: string): Promise<T[]> => {
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      });
    };

    canvasesStore = await loadAll<Canvas>('canvases');
    boxesStore = await loadAll<Box>('boxes');
    aiProvidersStore = await loadAll<AIProvider>('aiProviders');
  } catch (e) {
    console.log('IndexedDB not available, using in-memory storage');
  }
}

// Save to IndexedDB
async function saveToDB() {
  try {
    const db = await openDB();

    const saveAll = <T>(storeName: string, data: T[]): Promise<void> => {
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        // Clear existing data
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          // Add all new data
          data.forEach((item) => store.add(item));
          resolve();
        };
        clearRequest.onerror = () => resolve();
      });
    };

    await Promise.all([
      saveAll<Canvas>('canvases', canvasesStore),
      saveAll<Box>('boxes', boxesStore),
      saveAll<AIProvider>('aiProviders', aiProvidersStore),
    ]);
  } catch (e) {
    console.log('Could not save to IndexedDB');
  }
}

// Initialize on first use
let isInitialized = false;
async function initialize() {
  if (isInitialized) return;
  await loadFromDB();
  isInitialized = true;
}

// Canvas operations
export const canvases = {
  insert: async (values: NewCanvas[]) => {
    await initialize();
    const newCanvases = values.map((v) => ({
      ...v,
      id: v.id || uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    canvasesStore.push(...newCanvases);
    await saveToDB();
    return newCanvases;
  },

  select: async () => {
    await initialize();
    return [...canvasesStore];
  },

  update: async (set: Partial<Canvas>, where: { id?: string }) => {
    await initialize();
    const index = canvasesStore.findIndex((c) => c.id === where.id);
    if (index !== -1) {
      canvasesStore[index] = {
        ...canvasesStore[index],
        ...set,
        updatedAt: new Date(),
      };
      await saveToDB();
      return [canvasesStore[index]];
    }
    return [];
  },

  delete: async (where: { id?: string }) => {
    await initialize();
    const index = canvasesStore.findIndex((c) => c.id === where.id);
    if (index !== -1) {
      const [deleted] = canvasesStore.splice(index, 1);
      await saveToDB();
      return [deleted];
    }
    return [];
  },
};

// Box operations
export const boxes = {
  insert: async (values: NewBox[]) => {
    await initialize();
    const newBoxes = values.map((v) => ({
      ...v,
      id: v.id || uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    boxesStore.push(...newBoxes);
    await saveToDB();
    return newBoxes;
  },

  select: async () => {
    await initialize();
    return [...boxesStore];
  },

  selectByCanvas: async (canvasId: string) => {
    await initialize();
    return boxesStore.filter((b) => b.canvasId === canvasId);
  },

  update: async (set: Partial<Box>, where: { id?: string; canvasId?: string }) => {
    await initialize();
    const index = boxesStore.findIndex(
      (b) => b.id === where.id && (!where.canvasId || b.canvasId === where.canvasId)
    );
    if (index !== -1) {
      boxesStore[index] = {
        ...boxesStore[index],
        ...set,
        updatedAt: new Date(),
      };
      await saveToDB();
      return [boxesStore[index]];
    }
    return [];
  },

  delete: async (where: { id?: string; canvasId?: string }) => {
    await initialize();
    const index = boxesStore.findIndex(
      (b) => b.id === where.id && (!where.canvasId || b.canvasId === where.canvasId)
    );
    if (index !== -1) {
      const [deleted] = boxesStore.splice(index, 1);
      await saveToDB();
      return [deleted];
    }
    return [];
  },
};

// AI Provider operations
export const aiProviders = {
  insert: async (values: NewAIProvider[]) => {
    await initialize();
    const newProviders = values.map((v) => ({
      ...v,
      id: v.id || uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    aiProvidersStore.push(...newProviders);
    await saveToDB();
    return newProviders;
  },

  select: async () => {
    await initialize();
    return [...aiProvidersStore];
  },

  update: async (set: Partial<AIProvider>, where: { id?: string }) => {
    await initialize();
    const index = aiProvidersStore.findIndex((p) => p.id === where.id);
    if (index !== -1) {
      aiProvidersStore[index] = {
        ...aiProvidersStore[index],
        ...set,
        updatedAt: new Date(),
      };
      await saveToDB();
      return [aiProvidersStore[index]];
    }
    return [];
  },

  delete: async (where: { id?: string }) => {
    await initialize();
    const index = aiProvidersStore.findIndex((p) => p.id === where.id);
    if (index !== -1) {
      const [deleted] = aiProvidersStore.splice(index, 1);
      await saveToDB();
      return [deleted];
    }
    return [];
  },
};

// Export types
export type { Canvas, Box, AIProvider, NewCanvas, NewBox, NewAIProvider };

// Database object for Drizzle-style usage
export const db = {
  insert: (table: any) => table.insert,
  select: (fields: any) => ({
    from: (table: any) => ({
      where: (condition: any) => table.select(condition),
      orderBy: (order: any) => table.select(),
      limit: (n: number) => table.select().slice(0, n),
    }),
  }),
  update: (table: any) => table.update,
  delete: (table: any) => table.delete,
};

// Initialize database
export function initializeDatabase() {
  // IndexedDB is initialized on first use
}

// Close database connection
export function closeDatabase() {
  // IndexedDB doesn't need explicit closing
}

// Helper to get database path
export function getDatabasePath() {
  return 'indexeddb';
}
