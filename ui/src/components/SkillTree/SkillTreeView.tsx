import { useState } from 'react';
import { useChargen, useChargenDispatch } from '../../context/ChargenContext';
import { SkillNode } from './SkillNode';
import { SkillDetail } from './SkillDetail';
import { ConnectionLines } from './ConnectionLines';
import type { SkillNode as SkillNodeType } from '../../types';

export function SkillTreeView() {
  const { domains, packs, limits } = useChargen();
  const dispatch = useChargenDispatch();
  const [activeDomain, setActiveDomain] = useState(domains[0]?.id ?? '');
  const [activeNode, setActiveNode] = useState<SkillNodeType | null>(null);

  const domain = domains.find((d) => d.id === activeDomain);
  const atLimit = limits.current >= limits.max;

  const allNodes = domain?.tiers.flatMap((t) => t.nodes) ?? [];

  const recommendedPacks = packs.filter((p) => p.recommended);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6">
        {/* Domain tabs */}
        <div className="flex gap-2 mb-4">
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => { setActiveDomain(d.id); setActiveNode(null); }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors
                ${activeDomain === d.id
                  ? 'bg-void-600 text-gold-400 border border-gold-500/30'
                  : 'bg-void-800 text-gray-400 border border-void-600 hover:border-gray-500'
                }
              `}
            >
              {d.icon} {d.name}
            </button>
          ))}
        </div>

        {/* Pack banners */}
        {recommendedPacks.map((pack) => (
          <div key={pack.id} className="mb-4 p-3 rounded-lg bg-gold-600/10 border border-gold-500/30 flex items-center justify-between">
            <div>
              <span className="text-gold-400 font-medium">{pack.name}</span>
              <span className="text-gray-400 text-sm ml-2">{pack.skillCount} skills</span>
            </div>
            <button
              onClick={() => dispatch({ type: 'INSTALL_PACK', packId: pack.id })}
              className="px-3 py-1 text-sm bg-gold-600 text-void-900 rounded font-medium hover:bg-gold-500"
            >
              Install Pack
            </button>
          </div>
        ))}

        {/* Skill tree grid */}
        {domain && (
          <div className="relative">
            <ConnectionLines nodes={allNodes} />
            <div className="flex gap-12">
              {domain.tiers.map((tier) => (
                <div key={tier.tier} className="flex flex-col gap-4">
                  <div className="text-xs text-gray-500 text-center font-medium uppercase tracking-wider mb-2">
                    Tier {tier.tier}
                  </div>
                  {tier.nodes.map((node) => (
                    <SkillNode
                      key={node.id}
                      node={node}
                      isActive={activeNode?.id === node.id}
                      onClick={() => setActiveNode(node)}
                      disabled={atLimit}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {atLimit && (
          <p className="mt-4 text-sm text-danger-400">
            Skill limit reached ({limits.max}/{limits.max}). Remove a skill to add more.
          </p>
        )}
      </div>

      {/* Detail panel */}
      {activeNode && <SkillDetail node={activeNode} atLimit={atLimit} />}
    </div>
  );
}
