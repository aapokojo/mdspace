'use client';

import { useState, useEffect } from 'react';
import { useCanvasStore } from '@/lib/store/useCanvasStore';
import { useAIStore } from '@/lib/store/useAIStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIPanel() {
  const canvasStore = useCanvasStore();
  const aiStore = useAIStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedBox = canvasStore.selectedBoxId
    ? canvasStore.getBox(canvasStore.selectedBoxId)
    : null;

  const currentProvider = aiStore.getCurrentProvider();

  // Generate text with AI
  const handleGenerate = async () => {
    if (!prompt || !selectedBox || !currentProvider) return;

    setIsGenerating(true);
    aiStore.addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      boxId: selectedBox.id,
    });

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boxId: selectedBox.id,
          prompt,
          providerId: currentProvider.id,
          context: selectedBox.content.slice(0, 1000),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        aiStore.addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          boxId: selectedBox.id,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      aiStore.addMessage({
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
        boxId: selectedBox.id,
      });
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  // Append AI response to box
  const handleAppendToBox = (messageId: string) => {
    const message = aiStore.messages.find((m) => m.id === messageId);
    if (!message || !selectedBox) return;

    const updatedBox = {
      ...selectedBox,
      content: selectedBox.content + '\n\n' + message.content,
    };
    canvasStore.updateBox(updatedBox);
  };

  // Clear messages
  const handleClearMessages = () => {
    aiStore.clearMessages();
  };

  if (!selectedBox) {
    return null;
  }

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <h3>AI Assistant</h3>
        
        {currentProvider && (
          <span className="ai-provider-badge">
            {currentProvider.name}
          </span>
        )}
        
        <button
          onClick={handleClearMessages}
          className="ai-clear-btn"
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '10px' }}
        >
          Clear
        </button>
      </div>

      <div className="ai-messages">
        {aiStore.messages.length === 0 ? (
          <p className="ai-empty-message">
            {currentProvider
              ? `Ask ${currentProvider.name} anything about your box`
              : 'Configure an AI provider first'}
          </p>
        ) : (
          aiStore.messages.map((message) => (
            <div
              key={message.id}
              className={`ai-message ${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? 'You' : 'AI'}
                </span>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => handleAppendToBox(message.id)}
                    className="append-btn"
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#667eea', 
                      cursor: 'pointer',
                      fontSize: '10px',
                      marginLeft: '8px'
                    }}
                  >
                    Append to Box
                  </button>
                )}
              </div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          ))
        )}

        {isGenerating && (
          <div className="ai-message assistant">
            <div className="message-header">
              <span className="message-role">AI</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="spinner" style={{ width: 14, height: 14 }}></div>
              <span style={{ fontSize: '11px', color: '#888' }}>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="ai-input">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={currentProvider
            ? `Ask ${currentProvider.name}...`
            : 'Configure an AI provider first'}
          disabled={!currentProvider || isGenerating}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isGenerating && currentProvider) {
              handleGenerate();
            }
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={!currentProvider || isGenerating || !prompt}
          className="btn btn-primary"
          style={{ padding: '8px 12px', fontSize: '11px' }}
        >
          {isGenerating ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
