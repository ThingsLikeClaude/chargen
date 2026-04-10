import type { SkillNode } from '../../types';
import { useChargenDispatch } from '../../context/ChargenContext';

interface Props {
  node: SkillNode;
  atLimit: boolean;
}

export function SkillDetail({ node, atLimit }: Props) {
  const dispatch = useChargenDispatch();
  const canToggle = !atLimit || node.status !== 'available';

  const actionLabel: Record<string, string> = {
    available: 'Allocate',
    recommended: 'Allocate (Recommended)',
    installed: 'Mark for Removal',
    selected: 'Deallocate',
    removing: 'Keep Installed',
  };

  const actionColor: Record<string, string> = {
    available: 'bg-arcane-600 hover:bg-arcane-500',
    recommended: 'bg-gold-600 hover:bg-gold-500',
    installed: 'bg-danger-500/20 hover:bg-danger-500/40 text-danger-400',
    selected: 'bg-void-600 hover:bg-void-500',
    removing: 'bg-installed-500/20 hover:bg-installed-500/40 text-installed-400',
  };

  return (
    <div className="p-4 border-l border-void-600 w-72 bg-void-800/50">
      <h3 className="text-lg font-bold text-gold-400">{node.name}</h3>
      <p className="text-sm text-gray-400 mt-2">{node.description}</p>

      <div className="mt-3 space-y-1 text-xs text-gray-500">
        <p>Domain: <span className="text-gray-300">{node.domain}</span></p>
        <p>Tier: <span className="text-gray-300">{node.tier}</span></p>
        {node.pack && <p>Pack: <span className="text-gray-300">{node.pack}</span></p>}
        {node.dependencies.length > 0 && (
          <p>Requires: <span className="text-gray-300">{node.dependencies.join(', ')}</span></p>
        )}
        {node.unlocks.length > 0 && (
          <p>Unlocks: <span className="text-arcane-400">{node.unlocks.join(', ')}</span></p>
        )}
      </div>

      <button
        className={`mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
          ${canToggle ? (actionColor[node.status] ?? '') : 'bg-void-700 text-gray-600 cursor-not-allowed'}
        `}
        disabled={!canToggle}
        onClick={() => dispatch({ type: 'TOGGLE_SKILL', skillId: node.id })}
      >
        {canToggle ? actionLabel[node.status] : 'Skill Limit Reached'}
      </button>
    </div>
  );
}
