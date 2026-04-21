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

Example:
```
Choose

A. Complete AC7·8 now — formally close mt02-s05, but also touches Process3 Eulji logic
B. Separate AC7·8 — finish mt02-s06/s07 first, then batch all three vendors' Eulji configs together
C. Push AC7·8 to MT-4 scope

Cold Recommendation: B — ParkingPark and ParkingFriends also need the same configs update. Batching 3 vendors is better for consistency.

Which one?
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
