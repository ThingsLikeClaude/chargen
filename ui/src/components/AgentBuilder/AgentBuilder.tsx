import { useState } from 'react';
import { useChargen, useChargenDispatch } from '../../context/ChargenContext';
import { AgentCard } from './AgentCard';
import { CustomAgentForm } from './CustomAgentForm';

const CATEGORY_LABELS: Record<string, string> = {
  development: '🔧 Development',
  testing: '🧪 Testing',
  documentation: '📝 Documentation',
  security: '🔒 Security',
  workflow: '⚙️ Workflow',
};

export function AgentBuilder() {
  const { agents } = useChargen();
  const dispatch = useChargenDispatch();
  const [showCustomForm, setShowCustomForm] = useState(false);

  const categories = [...new Set(agents.map((a) => a.category))];

  const selectedCount = agents.filter((a) => a.status === 'selected' || a.status === 'installed').length;
  const removingCount = agents.filter((a) => a.status === 'removing').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-100">Agent Builder</h2>
          <p className="text-sm text-gray-400 mt-1">
            {selectedCount} agents active
            {removingCount > 0 && <span className="text-danger-400"> ({removingCount} removing)</span>}
          </p>
        </div>
        <button
          onClick={() => setShowCustomForm(true)}
          className="px-4 py-2 bg-arcane-600 hover:bg-arcane-500 rounded-lg text-sm font-medium"
        >
          + Custom Agent
        </button>
      </div>

      {showCustomForm && (
        <div className="mb-6">
          <CustomAgentForm onClose={() => setShowCustomForm(false)} />
        </div>
      )}

      {categories.map((cat) => {
        const catAgents = agents.filter((a) => a.category === cat);
        if (catAgents.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              {CATEGORY_LABELS[cat] ?? cat}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={() => dispatch({ type: 'TOGGLE_AGENT', agentId: agent.id })}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
