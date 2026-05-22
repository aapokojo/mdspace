import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AIProvider, AIChatMessage, MCPResource } from '@/lib/types';

interface AIState {
  // AI providers
  providers: AIProvider[];
  
  // Current provider
  currentProviderId: string | null;
  
  // Chat messages for the current box
  messages: AIChatMessage[];
  
  // Current box being chatted with
  currentBoxId: string | null;
  
  // MCP resources from connected AI
  mcpResources: MCPResource[];
  
  // Connection status
  isConnected: boolean;
  isGenerating: boolean;
  
  // Actions
  setProviders: (providers: AIProvider[]) => void;
  addProvider: (provider: AIProvider) => void;
  updateProvider: (provider: AIProvider) => void;
  removeProvider: (id: string) => void;
  setCurrentProvider: (id: string | null) => void;
  
  setMessages: (messages: AIChatMessage[]) => void;
  addMessage: (message: AIChatMessage) => void;
  clearMessages: () => void;
  setCurrentBoxId: (id: string | null) => void;
  
  setMcpResources: (resources: MCPResource[]) => void;
  addMcpResource: (resource: MCPResource) => void;
  removeMcpResource: (uri: string) => void;
  
  setConnected: (isConnected: boolean) => void;
  setGenerating: (isGenerating: boolean) => void;
  
  // Getters
  getCurrentProvider: () => AIProvider | null;
  getProviderById: (id: string) => AIProvider | null;
}

export const useAIStore = create<AIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        providers: [],
        currentProviderId: null,
        messages: [],
        currentBoxId: null,
        mcpResources: [],
        isConnected: false,
        isGenerating: false,

        // Actions
        setProviders: (providers) => {
          set({ providers });
        },

        addProvider: (provider) => {
          set((state) => ({
            providers: [...state.providers, provider],
          }));
        },

        updateProvider: (updatedProvider) => {
          set((state) => ({
            providers: state.providers.map((p) =>
              p.id === updatedProvider.id ? updatedProvider : p
            ),
          }));
        },

        removeProvider: (id) => {
          set((state) => ({
            providers: state.providers.filter((p) => p.id !== id),
            currentProviderId: state.currentProviderId === id ? null : state.currentProviderId,
          }));
        },

        setCurrentProvider: (id) => {
          set({ currentProviderId: id });
        },

        setMessages: (messages) => {
          set({ messages });
        },

        addMessage: (message) => {
          set((state) => ({
            messages: [...state.messages, message],
          }));
        },

        clearMessages: () => {
          set({ messages: [] });
        },

        setCurrentBoxId: (id) => {
          set({ currentBoxId: id });
        },

        setMcpResources: (resources) => {
          set({ mcpResources: resources });
        },

        addMcpResource: (resource) => {
          set((state) => ({
            mcpResources: [...state.mcpResources, resource],
          }));
        },

        removeMcpResource: (uri) => {
          set((state) => ({
            mcpResources: state.mcpResources.filter((r) => r.uri !== uri),
          }));
        },

        setConnected: (isConnected) => {
          set({ isConnected });
        },

        setGenerating: (isGenerating) => {
          set({ isGenerating });
        },

        // Getters
        getCurrentProvider: () => {
          const { currentProviderId, providers } = get();
          return providers.find((p) => p.id === currentProviderId) || null;
        },

        getProviderById: (id) => {
          const { providers } = get();
          return providers.find((p) => p.id === id) || null;
        },
      }),
      {
        name: 'ai-store',
        partialize: (state) => ({
          providers: state.providers,
          currentProviderId: state.currentProviderId,
        }),
      }
    ),
    { name: 'AIStore' }
  )
);
