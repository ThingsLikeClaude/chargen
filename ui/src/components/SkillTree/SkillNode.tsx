import type { SkillNode as SkillNodeType } from '../../types';

const STATUS_STYLES: Record<string, string> = {
  available: 'border-gray-600 bg-void-700 hover:border-gray-400',
  recommended: 'border-gold-500 bg-void-700 shadow-glow hover:border-gold-400',
  installed: 'border-installed-500 bg-installed-500/10 shadow-glow-installed',
  selected: 'border-arcane-500 bg-arcane-500/10 shadow-glow-arcane',
  removing: 'border-danger-500 bg-danger-500/10 line-through',
};

const STATUS_BADGE: Record<string, string> = {
  installed: '✓',
  recommended: '★',
  selected: '+',
  removing: '×',
};

interface Props {
  node: SkillNodeType;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

export function SkillNode({ node, isActive, onClick, disabled }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${STATUS_STYLES[node.status] ?? STATUS_STYLES.available}
          ${isActive ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-void-900' : ''}
          ${disabled && node.status === 'available' ? 'opacity-40 cursor-not-allowed' : ''}
        `}
        title={node.description}
      >
        <span className="text-xs font-bold text-center leading-tight px-1">
          {node.name.length > 10 ? node.name.slice(0, 8) + '…' : node.name}
        </span>
        {STATUS_BADGE[node.status] && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-void-800 border border-current
            flex items-center justify-center text-[10px] font-bold">
            {STATUS_BADGE[node.status]}
          </span>
        )}
      </button>
      <span className="text-[10px] text-gray-500 text-center max-w-[72px] truncate">
        {node.name}
      </span>
    </div>
  );
}
