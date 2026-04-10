import { useEffect } from 'react';
import { useChargen, useChargenDispatch } from './context/ChargenContext';
import { fetchJson } from './api/client';
import { SkillTreeView } from './components/SkillTree/SkillTreeView';
import { AgentBuilder } from './components/AgentBuilder/AgentBuilder';
import { ClaudeMdEditor } from './components/ClaudeMdEditor/ClaudeMdEditor';
import { StatusBar } from './components/StatusBar';
import type { RecommendedBuild, Domain, Pack, AgentPreset } from './types';

const TABS = [
  { id: 'skills' as const, label: '⚔️ Skill Tree' },
  { id: 'agents' as const, label: '🛡️ Agents' },
  { id: 'claudemd' as const, label: '📜 CLAUDE.md' },
];

export function App() {
  const state = useChargen();
  const dispatch = useChargenDispatch();

  useEffect(() => {
    async function load() {
      const [build, skillsData, agentsData] = await Promise.all([
        fetchJson<RecommendedBuild>('/api/build'),
        fetchJson<{ domains: Domain[]; packs: Pack[] }>('/api/skills'),
        fetchJson<{ presets: AgentPreset[] }>('/api/agent-presets'),
      ]);
      dispatch({
        type: 'INIT',
        build,
        domains: skillsData.domains,
        packs: skillsData.packs ?? [],
        agents: agentsData.presets.map((a) => ({
          ...a,
          status: build.existingScan.installedAgents.includes(a.id) ? 'installed' as const
            : build.recommendedAgents.includes(a.id) ? 'selected' as const
            : 'available' as const,
        })),
      });
    }
    load();
  }, [dispatch]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚔️</div>
          <p className="text-gray-400">Loading character builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-void-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gold-400">⚔️ chargen</h1>
            {state.build && (
              <p className="text-sm text-gray-400 mt-1">
                {state.build.projectType} — {state.build.detectedStack.join(', ')}
              </p>
            )}
          </div>
          <div className="text-sm text-gray-400">
            <span className="text-gold-400 font-mono">{state.limits.current}</span>
            <span className="text-gray-600"> / </span>
            <span className="font-mono">{state.limits.max}</span>
            <span className="ml-1">skills</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-void-600 flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${state.activeTab === tab.id ? 'tab-btn-active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {state.activeTab === 'skills' && <SkillTreeView />}
        {state.activeTab === 'agents' && <AgentBuilder />}
        {state.activeTab === 'claudemd' && <ClaudeMdEditor />}
      </main>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
