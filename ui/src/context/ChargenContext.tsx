import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { ChargenState, ChargenAction, SkillNode, Domain } from '../types';

const CLAUDEMD_SECTIONS = [
  { id: 'techStack', label: 'Tech Stack', description: 'Project technologies and versions', placeholder: 'Next.js 14, React 18, TypeScript 5.3', value: '' },
  { id: 'conventions', label: 'Conventions', description: 'Code style and architecture rules', placeholder: '- Server Components by default\n- Immutable patterns', value: '' },
  { id: 'structure', label: 'Project Structure', description: 'Key directories and their purposes', placeholder: 'src/app/ — Pages\nsrc/components/ — UI', value: '' },
  { id: 'customRules', label: 'Custom Rules', description: 'Project-specific directives', placeholder: 'Always use TypeScript strict mode', value: '' },
];

const initialState: ChargenState = {
  loading: true,
  activeTab: 'skills',
  build: null,
  domains: [],
  packs: [],
  agents: [],
  claudeMdSections: CLAUDEMD_SECTIONS,
  claudeMdMode: 'merge',
  limits: { current: 0, max: 25 },
};

function countActive(domains: Domain[]): number {
  let count = 0;
  for (const d of domains) {
    for (const t of d.tiers) {
      for (const n of t.nodes) {
        if (n.status === 'installed' || n.status === 'selected') count++;
      }
    }
  }
  return count;
}

function toggleSkillInDomains(domains: Domain[], skillId: string): Domain[] {
  return domains.map((d) => ({
    ...d,
    tiers: d.tiers.map((t) => ({
      ...t,
      nodes: t.nodes.map((n): SkillNode => {
        if (n.id !== skillId) return n;
        switch (n.status) {
          case 'available':
          case 'recommended':
            return { ...n, status: 'selected' };
          case 'selected':
            return { ...n, status: 'available' };
          case 'installed':
            return { ...n, status: 'removing' };
          case 'removing':
            return { ...n, status: 'installed' };
          default:
            return n;
        }
      }),
    })),
  }));
}

function installPackInDomains(domains: Domain[], packSkills: string[]): Domain[] {
  return domains.map((d) => ({
    ...d,
    tiers: d.tiers.map((t) => ({
      ...t,
      nodes: t.nodes.map((n): SkillNode => {
        if (!packSkills.includes(n.id)) return n;
        if (n.status === 'available' || n.status === 'recommended') {
          return { ...n, status: 'selected' };
        }
        return n;
      }),
    })),
  }));
}

function reducer(state: ChargenState, action: ChargenAction): ChargenState {
  switch (action.type) {
    case 'INIT': {
      const suggestions = action.build.claudeMdSuggestions;
      return {
        ...state,
        loading: false,
        build: action.build,
        domains: action.domains,
        packs: action.packs,
        agents: action.agents,
        claudeMdSections: state.claudeMdSections.map((s) => ({
          ...s,
          value: (suggestions as Record<string, string | undefined>)[s.id] ?? s.value,
        })),
        limits: { current: countActive(action.domains), max: action.build.existingScan.skillLimit },
      };
    }
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'TOGGLE_SKILL': {
      const next = toggleSkillInDomains(state.domains, action.skillId);
      return { ...state, domains: next, limits: { ...state.limits, current: countActive(next) } };
    }
    case 'INSTALL_PACK': {
      const pack = state.packs.find((p) => p.id === action.packId);
      if (!pack) return state;
      const next = installPackInDomains(state.domains, pack.skills);
      return { ...state, domains: next, limits: { ...state.limits, current: countActive(next) } };
    }
    case 'TOGGLE_AGENT':
      return {
        ...state,
        agents: state.agents.map((a) => {
          if (a.id !== action.agentId) return a;
          switch (a.status) {
            case 'available': return { ...a, status: 'selected' as const };
            case 'selected': return { ...a, status: 'available' as const };
            case 'installed': return { ...a, status: 'removing' as const };
            case 'removing': return { ...a, status: 'installed' as const };
            default: return a;
          }
        }),
      };
    case 'ADD_CUSTOM_AGENT':
      return { ...state, agents: [...state.agents, action.agent] };
    case 'SET_SECTION':
      return {
        ...state,
        claudeMdSections: state.claudeMdSections.map((s) =>
          s.id === action.sectionId ? { ...s, value: action.value } : s
        ),
      };
    case 'APPLY_TEMPLATE':
      return {
        ...state,
        claudeMdSections: state.claudeMdSections.map((s) => ({
          ...s,
          value: action.values[s.id] ?? s.value,
        })),
      };
    case 'SET_CLAUDEMD_MODE':
      return { ...state, claudeMdMode: action.mode };
    default:
      return state;
  }
}

const ChargenCtx = createContext<ChargenState>(initialState);
const DispatchCtx = createContext<Dispatch<ChargenAction>>(() => {});

export function ChargenProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <ChargenCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>
        {children}
      </DispatchCtx.Provider>
    </ChargenCtx.Provider>
  );
}

export function useChargen() { return useContext(ChargenCtx); }
export function useChargenDispatch() { return useContext(DispatchCtx); }
