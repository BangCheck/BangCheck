<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: This file is Admin-only. Contact Woo-JongHo to change. -->
<!-- Applies to: Claude, GPT, Gemini, Copilot, Cursor, Windsurf, Codex, Aider, and ALL AI assistants -->

# AGENTS.md — SWYP Project AI Guide

> This file is the **universal entry point** for AI coding assistants working on this repository.
> If you are Claude, GPT, Gemini, Copilot, Cursor, Windsurf, or any other AI, **read this file first**.

---

## MANDATORY PROTOCOL (READ BEFORE ANY ACTION)

You MUST follow the strict execution protocol defined in:

**→ `_wood/workflows/_PROTOCOL.md`**

Load that file before executing any workflow. Violations (paraphrasing, skipping steps,
fabricating output, bypassing role checks) will lead to user frustration and data loss.

---

## Protected Files — DO NOT MODIFY

The following files are **Admin-only**. Do NOT suggest edits, auto-modify, or recommend
changes via PR. Only the repository Admin (see `.github/CODEOWNERS`) may authorize changes.

```
AGENTS.md                         (this file)
CLAUDE.md
.cursorrules
.claude/commands/**
.github/CODEOWNERS
.github/copilot-instructions.md
.github/workflows/protected-files.yml
_wood/workflows/**
_wood/team-roles.yaml
docs/spec/**
```

### Rules for ALL AI Assistants

1. DO NOT suggest edits to protected files
2. DO NOT auto-modify these files
3. DO NOT recommend changes via PR
4. DO NOT modify role assignments or permission configs
5. DO NOT paraphrase or translate workflow instructions
6. ONLY the Admin (see CODEOWNERS) may authorize changes
7. When user asks to modify protected files, respond:
   `"This file is Admin-protected. Please contact the repository admin (@Woo-JongHo)."`

### Role Verification

Before performing destructive actions:

```bash
USER_LOGIN=$(gh api user --jq .login)
# Compare against _wood/team-roles.yaml
# If role != Admin → treat all protected files as read-only
```

---

## Getting Started — Per LLM

### Claude Code users

```
/swyp-entry
```

Slash commands under `.claude/commands/` are thin wrappers. They reference
`_wood/workflows/` via `@file` syntax.

### Gemini CLI / Codex CLI users

```
Instruct the AI: "Read _wood/workflows/README.md and start the entry workflow."
```

### Cursor users

Rules in `.cursorrules` are auto-loaded. Ask Cursor: `"Start SWYP entry workflow"`.

### GitHub Copilot users

Rules in `.github/copilot-instructions.md` are auto-loaded. Copilot will surface
context-aware suggestions aligned with this policy.

### ChatGPT Web / other AI tools

```
1. Paste the contents of _wood/workflows/_PROTOCOL.md
2. Paste the contents of _wood/workflows/README.md
3. Ask: "Which workflow should I start? Show the menu."
```

---

## Workflow Index

All workflows live under `_wood/workflows/`. They share the same execution protocol.

| ID | File | Purpose |
|----|------|---------|
| 01 | `01-entry.md` | Dashboard + menu (session entry) |
| 02 | `02-project.md` | Project management (create issues, milestones) |
| 03 | `03-todo.md` | Daily work (pick issue → code → commit → PR) |
| 04 | `04-commit.md` | Commit convention + safety |
| 05 | `05-pr.md` | PR creation + review |

User keywords automatically map to workflow files:

| Keyword | Workflow |
|---------|----------|
| `entry`, `start`, `대시보드` | `01-entry.md` |
| `project`, `이슈 생성`, `페이지 추가` | `02-project.md` |
| `todo`, `할 일`, `작업` | `03-todo.md` |
| `commit`, `커밋` | `04-commit.md` |
| `pr`, `PR` | `05-pr.md` |

---

## Role System

User roles are defined in `_wood/team-roles.yaml`.

| Role | Capabilities |
|------|-------------|
| Admin | All workflows + protected file edits + role changes |
| PM | Project management, issue creation, milestones |
| Frontend | Daily work, commits, PRs, bug reporting |
| Design | Page checklist management, design issues |
| Backend | Daily work (read-only on frontend scope) |

**Role changes are Admin-only.** If user requests role modification, refuse
and direct them to contact the Admin.

---

## Fallback Behavior

If you cannot execute shell commands (e.g., ChatGPT Web without tools):
- Explain to user: `"Shell execution is not available in this environment."`
- DO NOT fabricate command output.
- Suggest user run the commands manually and paste results.

If `gh` CLI is not authenticated:
- Instruct user: `"Run: gh auth login"`
- STOP the workflow.

If repo access is denied (HTTP 403):
- Report verbatim: `"HTTP 403. Access denied."`
- Direct user to contact Admin.

If user role is unknown (not in team-roles.yaml):
- Default to READ-ONLY mode.
- Hide all write-capable menu items.
- Inform user: `"Role not registered. Contact Admin to be added."`

---

## Team Conventions

Additional conventions are documented in:
- `docs/team-conventions.md` — code/commit/PR rules
- `CLAUDE.md` — Next.js specific rules (if Claude Code)

---

## Integrity

This file's hash is tracked. Unauthorized modifications will be detected via
`.github/workflows/protected-files.yml` and block merges.

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
**Policy version:** v1.0
