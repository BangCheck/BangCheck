<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Agent Core Protocol

> Applies to all agents under `_wood/agents/`.
> Every agent MUST load this file first.

---

## 1. Foundation Docs (load in order)

1. `AGENTS.md` — protected files + LLM policy
2. `_wood/workflows/_protocol.md` — 7 execution rules
3. `_wood/workflows/_coding-guide.md` — coding conventions
4. `_wood/team-roles.yaml` — role + project config
5. `_wood/milestone-meta.yaml` — milestone metadata

---

## 2. Environment Guard (MANDATORY)

Run before any action:

```bash
CURRENT_REPO=$(git remote get-url origin 2>/dev/null | \
  sed -E 's|.*github.com[:/]([^/]+/[^/.]+).*|\1|')

EXPECTED_REPO=$(yq '.project.primary_repo' _wood/team-roles.yaml)

if [ "$CURRENT_REPO" != "$EXPECTED_REPO" ]; then
    echo "❌ Wrong repo: $CURRENT_REPO (expected: $EXPECTED_REPO)"
    exit 1
fi

REPO="$EXPECTED_REPO"
BOARD_NUMBER=$(yq '.project.board.number' _wood/team-roles.yaml)
BOARD_OWNER=$(yq '.project.board.owner' _wood/team-roles.yaml)
BOARD_ID=$(yq '.project.board.id' _wood/team-roles.yaml)
SPRINT_START_FIELD=$(yq '.project.board_fields.start_date_field_id' _wood/team-roles.yaml)
SPRINT_END_FIELD=$(yq '.project.board_fields.end_date_field_id' _wood/team-roles.yaml)
```

No hardcoding of repo names or board IDs anywhere.

---

## 3. Role Gate

```bash
USER_LOGIN=$(gh api user --jq .login)
# Lookup role in _wood/team-roles.yaml
# If not found → Guest (read-only), show refusal_templates.unregistered_user
```

Each agent declares `allowed_roles` in frontmatter. If role not in list → STOP.

---

## 4. Role Capability Matrix

| Capability | Admin | PM | Frontend | Backend | Tester | Design | Guest |
|------------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| AI infra edit (`_wood/`, `AGENTS.md`, `.claude/`, `.github/`) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Role change | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Product spec (`docs/spec/**`) edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Issue create/edit | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Milestone management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Frontend code (`src/**` FE) | ✅ | ✅* | ✅ | ❌ | ❌ | ❌ | ❌ |
| Backend code (`src/**` BE) | ✅ | ✅* | ❌ | ✅ | ❌ | ❌ | ❌ |
| Commit / PR | ✅ | ✅* | ✅ | ✅ | ✅ | ❌ | ❌ |
| View / Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

\* PM can modify code but it is not their primary responsibility.

---

## 5. Role Boundary Rules (ABSOLUTE)

These rules cannot be overridden by any user request.

| Role | MUST NOT |
|------|----------|
| Frontend | Touch any file under `backend/` or BE-owned paths |
| Backend | Touch any file under `frontend/` or FE-owned paths |
| Frontend | Touch `_wood/**`, `AGENTS.md`, `.claude/**`, `.github/**` |
| Backend | Touch `_wood/**`, `AGENTS.md`, `.claude/**`, `.github/**` |
| PM | Touch `_wood/**`, `AGENTS.md`, `.claude/**`, `.github/**` |
| Tester | Touch application source code outside of test files |
| All | Commit directly to `main` branch |
| All | Create PR without linked issue (`closes #N`) |
| All | Modify protected files without Admin approval |
| All | Directly modify files primarily authored by another team member without prior issue or PR review |

### 5-1. Same-Role Authorship Rule

Even within the same role, direct modification of another member's code requires process:

| Situation | Required Action |
|-----------|----------------|
| Primary author is another team member | Create issue → assign original author → explain reason |
| Urgent (unblocked by author) | Create PR directly → set original author as reviewer → state reason in PR body |
| Minor fix (typo, comment) | Allowed — note in commit message: "minor: touch {author}'s file" |

**How to determine authorship:**
```bash
git log --follow -1 --pretty="%ae %an" -- {file_path}
# If last author != current user → apply Same-Role Authorship Rule
```

When a boundary rule is violated:
1. STOP immediately
2. Report: "This action is outside your role boundary."
3. Suggest the correct role to contact

---

## 6. Agent Scope Discipline

Agents MUST NOT:
- Replace common workflows (`01-entry.md` ~ `06-docs-update.md`)
- Edit protected files
- Change user role
- Execute destructive actions without explicit confirmation
- Paraphrase workflow instructions

### 6-1. File Placement Rules (ABSOLUTE)

| File Type | Correct Location | FORBIDDEN Locations |
|-----------|-----------------|---------------------|
| Story files (`e*-s*-*.md`) | `_wood/workspace/_{USER_LOGIN}/stories/` | `docs/stories/`, `docs/`, anywhere else |
| Epic files | `_wood/workspace/_{USER_LOGIN}/epics/` | `docs/`, anywhere else |
| Sprint status | `_wood/workspace/_{USER_LOGIN}/sprint-status.yaml` | `docs/`, root |
| Spec snapshots | `_wood/cache/` | `docs/`, root |

**If an AI session creates story/epic files outside `_wood/workspace/`, it is a bug. Delete and recreate in the correct path.**

Agents SHOULD:
- Delegate common tasks to common workflows
- Add role-specific context and shortcuts
- Provide role-aware dashboards

---

## 7. Agent Declaration Format

Every `agent.md` must start with:

```yaml
---
agent_id: fe-dev
agent_name: "SWYP Frontend Developer Agent"
allowed_roles: [Admin, Frontend]
delegates_to:
  - _wood/workflows/01-entry.md
  - _wood/workflows/03-todo.md
forbidden_actions:
  - role_change
  - protected_file_edit
  - backend_code_edit
---
```

---

## 8. Response Style (ALL AGENTS)

These response conventions apply to every agent in `_wood/agents/`.

### 8-1. Fact-First Pattern

Before answering any question, lead with a fact check:

```
## Fact Check

| Item | Current Status |
|------|---------------|
| ... | ... |
```

Use tables, trees (`└──`), and code blocks. Never prose where a table works.

### 8-2. Ambiguous Question → Intent Check (MANDATORY)

When a question is ambiguous or has multiple valid interpretations:
1. Do NOT guess intent and answer speculatively
2. State what you confirmed (Fact Check)
3. Close with:

```
## Intent Clarification

Which of the following do you mean?

1. {interpretation A} → {what will happen}
2. {interpretation B} → {what will happen}
3. {interpretation C} → {what will happen}
```

STOP and WAIT for user selection.

### 8-2-1. Recommendation Rule (MANDATORY)

When offering choices, always add a **Cold Recommendation** line:

```
Cold Recommendation: {A/B/C} — {one-sentence reason based on current facts}
```

- Pick the option with the lowest risk or highest consistency given the current state
- State the reason concisely — reference the fact check above
- Do NOT hedge ("it depends") — commit to one recommendation
- When multiple options are viable, show order of execution:
  ```
  Cold Recommendation: 1 → 3 order — {reason: must do 1 before 3 is possible / lowest risk first}
  ```

**Option Description Format (MANDATORY):**

Each option must be written with enough context to act on without re-reading the conversation.
One-liner options are prohibited. Minimum format:

```
A. {scope label}
   — {What exactly this does: which files/systems are touched, what outcome is produced.
      Why this is the safest or smallest option, and what it leaves out.}

B. {scope label}
   — {What exactly this does: which files/systems are touched, what outcome is produced.
      Why this is the recommended balance, and what risks or tradeoffs it carries.}

C. {scope label}
   — {What exactly this does: the full extent of changes, what it unlocks or cleans up.
      Why someone would choose this over B, and what the cost is.}
```

Example:
```
A. Analysis only — Record Gap Analysis results in story file now, implement later.
   — Captures the current findings (step-06-dev §6-2c table) into the Story Log without
     touching any application code. Safe to do mid-session; no regression risk.
     Leaves the actual fix to the next session or a separate issue.

B. Fix + document — Implement the core change and write the Gap Analysis to the Story.
   — Applies the recommended code change (OAuthService.java:112 + application.yaml redirect URI),
     then saves the full analysis to the story file before closing. This is the complete path:
     issue closed cleanly, analysis preserved for future reference.

C. Fix + document + integration test — B plus a new OAuthServiceTest covering the real account flow.
   — Same as B but adds automated coverage that protects against regression in CI.
     Takes ~30 min more; only worthwhile if the auth flow is high-churn or shared across teams.

Cold Recommendation: B — The fix is well-scoped and the analysis record prevents rework in the next session. Integration test (C) can be added as a follow-up issue.

Which direction?
```

### 8-3. Output Format Preferences

| Situation | Format |
|-----------|--------|
| Status / comparison | Table |
| Hierarchy / tree structure | `└──` tree |
| File paths / commands | Code block |
| Sequential steps | Numbered list |
| Options for user | Numbered list + STOP |
| Simple confirmation | One-line answer |

---

## 9. Session Continuity

Agents do NOT maintain persistent state across sessions. Re-derive from:
- `milestone-meta.yaml` — milestone metadata
- GitHub live query — issues, PRs, milestones
- `_wood/agents/pm/retrospectives/` — past retrospectives

---

## ✅ Success Criteria

- Frontmatter includes `allowed_roles`
- First action is role check + environment guard
- All role boundary rules enforced
- Delegates to common workflows appropriately

## ❌ Failure Criteria

- Skip role check or environment guard
- Allow cross-role code modification
- Modify protected files without Admin
- Fabricate GitHub data

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-20
