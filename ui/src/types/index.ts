// ── Skill Tree ──

export type SkillStatus = 'available' | 'installed' | 'recommended' | 'selected' | 'removing';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  domain: string;
  tier: 1 | 2 | 3;
  status: SkillStatus;
  pack?: string;
  dependencies: string[];
  unlocks: string[];
}

export interface Domain {
  id: string;
  name: string;
  icon: string;
  tiers: { tier: number; nodes: SkillNode[] }[];
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  skillCount: number;
  skills: string[];
  recommended: boolean;
}

// ── Agents ──

export type AgentStatus = 'available' | 'installed' | 'selected' | 'removing';
export type AgentModel = 'opus' | 'sonnet' | 'haiku';
export type AgentCategory = 'development' | 'testing' | 'documentation' | 'security' | 'workflow';

export interface AgentPreset {
  id: string;
  name: string;
  description: string;
  tools: string;
  model: AgentModel;
  color: string;
  category: AgentCategory;
  status: AgentStatus;
  isCustom?: boolean;
  body?: string;
}

// ── CLAUDE.md ──

export interface ClaudeMdSection {
  id: string;
  label: string;
  description: string;
  placeholder: string;
  value: string;
}

export interface ClaudeMdTemplate {
  id: string;
  name: string;
  values: Record<string, string>;
}

export type ClaudeMdMode = 'merge' | 'replace';

// ── Recommended Build (from Claude) ──

export interface RecommendedBuild {
  projectType: string;
  projectDescription: string;
  detectedStack: string[];
  recommendedSkills: { id: string; reason: string }[];
  recommendedAgents: string[];
  claudeMdSuggestions: {
    techStack: string;
    conventions: string;
    structure?: string;
    customRules?: string;
  };
  existingScan: {
    installedSkills: string[];
    installedAgents: string[];
    hasCLAUDEmd: boolean;
    skillCount: number;
    skillLimit: number;
  };
}

// ── State ──

export interface ChargenState {
  loading: boolean;
  activeTab: 'skills' | 'agents' | 'claudemd';
  build: RecommendedBuild | null;
  domains: Domain[];
  packs: Pack[];
  agents: AgentPreset[];
  claudeMdSections: ClaudeMdSection[];
  claudeMdMode: ClaudeMdMode;
  limits: { current: number; max: number };
}

export type ChargenAction =
  | { type: 'INIT'; build: RecommendedBuild; domains: Domain[]; packs: Pack[]; agents: AgentPreset[] }
  | { type: 'SET_TAB'; tab: ChargenState['activeTab'] }
  | { type: 'TOGGLE_SKILL'; skillId: string }
  | { type: 'INSTALL_PACK'; packId: string }
  | { type: 'TOGGLE_AGENT'; agentId: string }
  | { type: 'ADD_CUSTOM_AGENT'; agent: AgentPreset }
  | { type: 'SET_SECTION'; sectionId: string; value: string }
  | { type: 'APPLY_TEMPLATE'; templateId: string; values: Record<string, string> }
  | { type: 'SET_CLAUDEMD_MODE'; mode: ClaudeMdMode };

// ── Result (sent to Claude) ──

export interface ChargenResult {
  timestamp: string;
  skills: {
    install: string[];
    uninstall: string[];
    keep: string[];
  };
  agents: {
    install: { id: string; source: 'preset' | 'custom'; definition?: Partial<AgentPreset> }[];
    keep: string[];
  };
  claudeMd: {
    mode: ClaudeMdMode;
    sections: Record<string, string>;
  };
}
