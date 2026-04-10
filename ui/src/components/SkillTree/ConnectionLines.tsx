import type { SkillNode } from '../../types';

interface Props {
  nodes: SkillNode[];
}

// Renders SVG lines between dependent nodes within a domain.
// Nodes are laid out in a grid: x = tier column, y = index within tier.
export function ConnectionLines({ nodes }: Props) {
  const lines: { x1: number; y1: number; x2: number; y2: number; active: boolean }[] = [];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const node of nodes) {
    for (const depId of node.dependencies) {
      const dep = nodeMap.get(depId);
      if (!dep) continue;

      const tierNodes = (tier: number) => nodes.filter((n) => n.tier === tier);
      const idxOf = (n: SkillNode) => tierNodes(n.tier).indexOf(n);

      const COL_W = 100;
      const ROW_H = 80;
      const OFFSET_X = 40;
      const OFFSET_Y = 40;

      const x1 = (dep.tier - 1) * COL_W + OFFSET_X;
      const y1 = idxOf(dep) * ROW_H + OFFSET_Y;
      const x2 = (node.tier - 1) * COL_W + OFFSET_X;
      const y2 = idxOf(node) * ROW_H + OFFSET_Y;

      const active = dep.status === 'installed' || dep.status === 'selected';

      lines.push({ x1, y1, x2, y2, active });
    }
  }

  if (lines.length === 0) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={l.active ? '#8b5cf6' : '#374151'}
          strokeWidth={l.active ? 2 : 1}
          strokeDasharray={l.active ? undefined : '4 4'}
          opacity={l.active ? 0.8 : 0.4}
        />
      ))}
    </svg>
  );
}
