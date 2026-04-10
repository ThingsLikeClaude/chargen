import type { AgentPreset } from '../../types';

const MODEL_BADGE: Record<string, { label: string; color: string }> = {
  opus: { label: 'Opus', color: 'bg-purple-600' },
  sonnet: { label: 'Sonnet', color: 'bg-blue-600' },
  haiku: { label: 'Haiku', color: 'bg-green-600' },
};

const STATUS_RING: Record<string, string> = {
  available: 'border-gray-600',
  installed: 'border-installed-500',
  selected: 'border-arcane-500 shadow-glow-arcane',
  removing: 'border-danger-500',
};

interface Props {
  agent: AgentPreset;
  onClick: () => void;
}

export function AgentCard({ agent, onClick }: Props) {
  const badge = MODEL_BADGE[agent.model] ?? MODEL_BADGE.sonnet!;

  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all duration-200 hover:bg-void-700/50
        ${STATUS_RING[agent.status] ?? STATUS_RING.available}
        ${agent.status === 'removing' ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
          style={{ backgroundColor: agent.color }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-100 truncate">{agent.name}</h4>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{agent.description}</p>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge.color} text-white flex-shrink-0`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{agent.category}</span>
        {agent.status === 'installed' && <span className="text-[10px] text-installed-400">installed</span>}
        {agent.status === 'selected' && <span className="text-[10px] text-arcane-400">+ adding</span>}
        {agent.status === 'removing' && <span className="text-[10px] text-danger-400">- removing</span>}
      </div>
    </button>
  );
}
