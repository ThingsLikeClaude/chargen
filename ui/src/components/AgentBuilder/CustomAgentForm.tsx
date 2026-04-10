import { useState } from 'react';
import { useChargenDispatch } from '../../context/ChargenContext';
import type { AgentModel, AgentCategory } from '../../types';

const TOOL_OPTIONS = ['Glob', 'Grep', 'Read', 'Write', 'Edit', 'Bash', 'WebSearch', 'WebFetch', 'TodoWrite'];
const MODEL_OPTIONS: AgentModel[] = ['opus', 'sonnet', 'haiku'];
const CATEGORY_OPTIONS: AgentCategory[] = ['development', 'testing', 'documentation', 'security', 'workflow'];

export function CustomAgentForm({ onClose }: { onClose: () => void }) {
  const dispatch = useChargenDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tools, setTools] = useState<string[]>(['Glob', 'Grep', 'Read']);
  const [model, setModel] = useState<AgentModel>('sonnet');
  const [category, setCategory] = useState<AgentCategory>('development');
  const [body, setBody] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    dispatch({
      type: 'ADD_CUSTOM_AGENT',
      agent: {
        id,
        name: name.trim(),
        description: description.trim(),
        tools: tools.join(', '),
        model,
        color: '#8b5cf6',
        category,
        status: 'selected',
        isCustom: true,
        body: body.trim() || undefined,
      },
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-void-600 bg-void-800/50 space-y-4">
      <h3 className="text-sm font-bold text-gold-400">Create Custom Agent</h3>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Name</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          className="w-full bg-void-700 border border-void-600 rounded px-3 py-2 text-sm text-gray-100
            focus:border-arcane-500 focus:outline-none"
          placeholder="my-agent"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Description</label>
        <input
          value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-void-700 border border-void-600 rounded px-3 py-2 text-sm text-gray-100
            focus:border-arcane-500 focus:outline-none"
          placeholder="What this agent does"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Model</label>
          <select
            value={model} onChange={(e) => setModel(e.target.value as AgentModel)}
            className="w-full bg-void-700 border border-void-600 rounded px-3 py-2 text-sm text-gray-100"
          >
            {MODEL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Category</label>
          <select
            value={category} onChange={(e) => setCategory(e.target.value as AgentCategory)}
            className="w-full bg-void-700 border border-void-600 rounded px-3 py-2 text-sm text-gray-100"
          >
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Tools</label>
        <div className="flex flex-wrap gap-1">
          {TOOL_OPTIONS.map((tool) => (
            <button
              key={tool} type="button"
              onClick={() => setTools((t) => t.includes(tool) ? t.filter((x) => x !== tool) : [...t, tool])}
              className={`px-2 py-1 text-xs rounded border transition-colors
                ${tools.includes(tool)
                  ? 'border-arcane-500 bg-arcane-500/20 text-arcane-400'
                  : 'border-void-600 text-gray-500 hover:border-gray-400'
                }
              `}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">System Prompt (optional)</label>
        <textarea
          value={body} onChange={(e) => setBody(e.target.value)}
          className="w-full bg-void-700 border border-void-600 rounded px-3 py-2 text-sm text-gray-100
            focus:border-arcane-500 focus:outline-none h-20 resize-none"
          placeholder="You are a specialized agent that..."
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-2 bg-arcane-600 hover:bg-arcane-500 rounded text-sm font-medium">
          Create Agent
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 bg-void-600 hover:bg-void-500 rounded text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
