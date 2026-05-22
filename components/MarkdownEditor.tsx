'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="flex-1 flex flex-col border-t">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'edit'
              ? 'bg-white border-b-2 border-primary-500 text-primary-600'
              : 'bg-gray-50 text-gray-500'
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'preview'
              ? 'bg-white border-b-2 border-primary-500 text-primary-600'
              : 'bg-gray-50 text-gray-500'
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'edit' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="markdown-editor w-full h-full outline-none"
            placeholder="Write markdown here..."
            spellCheck={false}
          />
        ) : (
          <div className="markdown-preview p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || 'Nothing to preview'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
