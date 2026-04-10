# chargen — Claude Code Project Character Builder

RPG-style character builder plugin for Claude Code project initialization.

## Usage

Run `/chargen` in any project directory to launch the visual character builder.

## How It Works

1. `/chargen` triggers project analysis → recommended build generated
2. Local web server starts → browser opens skill tree UI
3. User customizes: skills (Diablo-style tree), agents (presets + custom), CLAUDE.md (templates)
4. Click "Apply Build" → configuration sent back to Claude
5. Claude applies: backup existing → install skills/agents → update CLAUDE.md → git commit

## Plugin Structure

- `commands/chargen.md` — Slash command definition
- `scripts/server.js` — Zero-dependency Node.js HTTP server
- `ui/` — React + Vite frontend (pre-built in `ui/dist/`)

## MVP Scope

- **Skill Tree**: Tier 1→2→3 node tree with domain categories
- **Agents**: Preset categories (dev/test/docs/security) + custom creation
- **CLAUDE.md**: Template presets + section-by-section customization

## Safety

- All changes backed up to `.claude/.chargen-backup/{timestamp}/`
- Existing settings preserved + added (never reset)
- Skills can be uninstalled from the UI
