import { useState } from 'react';
import { useChargen } from '../context/ChargenContext';
import { postJson } from '../api/client';
import type { ChargenResult } from '../types';

export function StatusBar() {
  const state = useChargen();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Count changes
  const installing: string[] = [];
  const removing: string[] = [];
  const keeping: string[] = [];

  for (const d of state.domains) {
    for (const t of d.tiers) {
      for (const n of t.nodes) {
        if (n.status === 'selected') installing.push(n.id);
        else if (n.status === 'removing') removing.push(n.id);
        else if (n.status === 'installed') keeping.push(n.id);
      }
    }
  }

  const agentsInstalling = state.agents.filter((a) => a.status === 'selected');
  const agentsRemoving = state.agents.filter((a) => a.status === 'removing');
  const agentsKeeping = state.agents.filter((a) => a.status === 'installed');

  const hasChanges = installing.length > 0 || removing.length > 0
    || agentsInstalling.length > 0 || agentsRemoving.length > 0
    || state.claudeMdSections.some((s) => s.value.trim());

  async function handleConfirm() {
    setSubmitting(true);
    const result: ChargenResult = {
      timestamp: new Date().toISOString(),
      skills: {
        install: installing,
        uninstall: removing,
        keep: keeping,
      },
      agents: {
        install: agentsInstalling.map((a) => ({
          id: a.id,
          source: a.isCustom ? 'custom' as const : 'preset' as const,
          ...(a.isCustom ? { definition: { name: a.name, description: a.description, tools: a.tools, model: a.model, body: a.body } } : {}),
        })),
        keep: agentsKeeping.map((a) => a.id),
      },
      claudeMd: {
        mode: state.claudeMdMode,
        sections: Object.fromEntries(
          state.claudeMdSections.filter((s) => s.value.trim()).map((s) => [s.id, s.value])
        ),
      },
    };

    try {
      await postJson('/api/confirm', result);
      setDone(true);
    } catch (err) {
      console.error('Confirm failed:', err);
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <footer className="border-t border-void-600 px-6 py-4 bg-void-800 text-center">
        <p className="text-installed-400 font-medium">
          ✓ Configuration sent to Claude. You can close this tab.
        </p>
      </footer>
    );
  }

  return (
    <footer className="border-t border-void-600 px-6 py-3 bg-void-800 flex items-center justify-between">
      <div className="text-xs text-gray-400 space-x-4">
        {installing.length > 0 && <span className="text-arcane-400">+{installing.length} skills</span>}
        {removing.length > 0 && <span className="text-danger-400">-{removing.length} skills</span>}
        {agentsInstalling.length > 0 && <span className="text-arcane-400">+{agentsInstalling.length} agents</span>}
        {agentsRemoving.length > 0 && <span className="text-danger-400">-{agentsRemoving.length} agents</span>}
        {!hasChanges && <span>No changes yet</span>}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!hasChanges || submitting}
        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
          ${hasChanges && !submitting
            ? 'bg-gold-500 text-void-900 hover:bg-gold-400 shadow-glow'
            : 'bg-void-600 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {submitting ? 'Sending...' : '⚔️ Apply Build'}
      </button>
    </footer>
  );
}
