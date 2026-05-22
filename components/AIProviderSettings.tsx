'use client';

import { useState, useEffect } from 'react';
import { useAIStore } from '@/lib/store/useAIStore';
import { v4 as uuidv4 } from 'uuid';
import type { AIProvider } from '@/lib/types';

export default function AIProviderSettings({
  onClose,
}: {
  onClose: () => void;
}) {
  const aiStore = useAIStore();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [newProvider, setNewProvider] = useState<Partial<AIProvider>>({
    name: '',
    type: 'claude',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load providers
  useEffect(() => {
    // For now, use the store's providers
    // In production, you'd fetch from the API
    setProviders(aiStore.providers);
  }, []);

  // Save providers to store
  useEffect(() => {
    aiStore.setProviders(providers);
  }, [providers]);

  const handleAdd = () => {
    if (!newProvider.name) return;

    const provider: AIProvider = {
      id: uuidv4(),
      name: newProvider.name!,
      type: newProvider.type!,
      apiKey: newProvider.apiKey,
      endpoint: newProvider.endpoint,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProviders([...providers, provider]);
    setNewProvider({ name: '', type: 'claude' });
  };

  const handleUpdate = () => {
    if (!editingId) return;

    setProviders(
      providers.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: newProvider.name || p.name,
              type: newProvider.type || p.type,
              apiKey: newProvider.apiKey !== undefined ? newProvider.apiKey : p.apiKey,
              endpoint: newProvider.endpoint !== undefined ? newProvider.endpoint : p.endpoint,
              updatedAt: new Date(),
            }
          : p
      )
    );
    setEditingId(null);
    setNewProvider({ name: '', type: 'claude' });
  };

  const handleDelete = (id: string) => {
    setProviders(providers.filter((p) => p.id !== id));
  };

  const handleEdit = (provider: AIProvider) => {
    setEditingId(provider.id);
    setNewProvider({
      name: provider.name,
      type: provider.type,
      apiKey: provider.apiKey,
      endpoint: provider.endpoint,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewProvider({ name: '', type: 'claude' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">AI Provider Settings</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-auto">
          {/* Provider Form */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-4">
              {editingId ? 'Edit Provider' : 'Add New Provider'}
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newProvider.name || ''}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, name: e.target.value })
                  }
                  placeholder="My Claude Instance"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newProvider.type || 'claude'}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="claude">Claude</option>
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="local">Local (Ollama, etc.)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key (optional for some providers)
                </label>
                <input
                  type="password"
                  value={newProvider.apiKey || ''}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, apiKey: e.target.value })
                  }
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint (optional)
                </label>
                <input
                  type="text"
                  value={newProvider.endpoint || ''}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, endpoint: e.target.value })
                  }
                  placeholder="https://api.anthropic.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex gap-2">
                {editingId ? (
                  <>
                    <button onClick={handleUpdate} className="btn btn-primary">
                      Update
                    </button>
                    <button onClick={handleCancel} className="btn btn-secondary">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={handleAdd} className="btn btn-primary">
                    Add Provider
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Provider List */}
          <div className="border rounded-lg p-4 flex-1 overflow-auto">
            <h4 className="font-medium mb-4">Configured Providers</h4>

            {providers.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No providers configured yet
              </p>
            ) : (
              <div className="space-y-3">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-gray-500">
                        Type: {provider.type}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(provider)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(provider.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
