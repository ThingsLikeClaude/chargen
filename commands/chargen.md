---
description: "RPG character builder for project initialization — visual skill tree, agents, and CLAUDE.md"
argument-hint: "[project description or empty for auto-detect]"
---

You are the Chargen orchestrator. You help the user configure their Claude Code project
through a visual RPG-style character builder UI.

## Step 1: Analyze Project

Scan the current project directory:
1. Read package.json, pyproject.toml, Cargo.toml, go.mod (detect tech stack)
2. Scan existing .claude/skills/ directory (count installed skills)
3. Scan existing .claude/agents/ directory
4. Read existing CLAUDE.md (if present)

## Step 2: Generate Build Data

Create a temp directory and write these JSON files:

### recommended-build.json
Based on detected stack, generate recommendations:
- Recommended skills (with reasons)
- Recommended agents
- CLAUDE.md suggestions (tech stack, conventions)
- Existing scan results (installed skills/agents count)

### skills.json
Convert available skills into UI-friendly format:
- Group by domain (UI, Review, Verify, Security, Workflow)
- Assign tiers (1=foundation, 2=specialization, 3=mastery)
- Mark installed skills, recommended skills
- Include dependency relationships

### agent-presets.json
Load agent presets with categories: development, testing, documentation, security, workflow.

### scan.json
Existing project scan results (installed skills, agents, CLAUDE.md presence).

## Step 3: Start Server + Open Browser

```bash
CHARGEN_DATA_DIR="$TEMP_DIR" node "${CLAUDE_PLUGIN_ROOT}/scripts/server.js" &
```

Parse the JSON stdout to get the port number.
Open browser: use platform-appropriate command (start/open/xdg-open).

Tell the user: "캐릭터 빌더가 브라우저에서 열렸습니다. 빌드를 커스터마이징한 후 'Apply Build'를 클릭하세요."

## Step 4: Wait for Confirmation

```bash
curl -s "http://localhost:${PORT}/api/wait"
```

This blocks up to 10 minutes. When it returns, parse the result JSON.

## Step 5: Apply Configuration

### 5a. Backup
```bash
BACKUP_DIR=".claude/.chargen-backup/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r .claude/skills/ .claude/agents/ CLAUDE.md "$BACKUP_DIR/" 2>/dev/null || true
```

### 5b. Install/Uninstall Skills
For each skill in result.skills.install:
- Copy skill files to .claude/skills/{id}/

For each skill in result.skills.uninstall:
- Remove .claude/skills/{id}/

### 5c. Install Agents
For preset agents: write .md file with proper frontmatter to .claude/agents/
For custom agents: write user-defined .md file to .claude/agents/

### 5d. Update CLAUDE.md
If mode is "merge": append new sections to existing CLAUDE.md
If mode is "replace": write entirely new CLAUDE.md

### 5e. Finalize
```bash
git add .claude/ CLAUDE.md
git commit -m "chargen: project initialization"
```

Show summary of all changes made.
