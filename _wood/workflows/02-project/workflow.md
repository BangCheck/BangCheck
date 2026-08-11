<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Workflow 02 — Project Management

> **Purpose:** Create and manage issues (page/task/bug/improvement), milestones, labels.
> **Protocol:** Follow [`../_protocol.md`](../_protocol.md) strictly.
> **Coding rules:** Defer to [`../_coding-guide.md`](../_coding-guide.md).

---

## 🛡️ Pre-flight Check

Re-run the pre-flight from `01-entry.md` if not already done in this session.

Required: `gh auth`, correct repo, user role identified.

---

## 📋 Step 1 — Scan Current Infrastructure

```bash
# Labels
gh label list --repo BangCheck/BangCheck --json name --limit 100 --jq '.[].name'

# Projects (GitHub milestones)
gh api repos/BangCheck/BangCheck/milestones \
  --jq '.[] | "\(.title)|\(.open_issues)|\(.closed_issues)|\(.state)"'

# Issue summary
gh issue list --repo BangCheck/BangCheck --state open --json number,title,labels --limit 50
gh issue list --repo BangCheck/BangCheck --state closed --json number --limit 1 --jq length
```

### Display (exact format)

```
SWYP Project Status — {yyyy-MM-dd}

## Infrastructure
| Item | Status |
|------|--------|
| Labels | {n} labels {show missing list if any} |
| Milestones | {list} |
| Project Board | {exists/none} |

## Issue Summary
| Type | Open | Closed |
|------|------|--------|
| Page | {n} | {n} |
| Task | {n} | {n} |
| Bug | {n} | {n} |
| Other | {n} | {n} |

## Milestone Progress
| Milestone | Open | Closed | Progress |
|-----------|------|--------|----------|
```

---

## 📋 Step 2 — Menu

Display **exact** menu:

```
What would you like to do?

── 📦 Sprint (= GitHub Milestone) ──
[1] Create new sprint       — Enter name/duration/goal and create
[2] Close sprint             — Close a completed sprint
[3] Sprint list/progress     — Overall status

── 📝 Issues ──
[4] Add page                 — Register new page (default checklist + task breakdown)
[5] Add task                 — Attach a task to existing page
[6] Report bug

── ⚙️ Issue Management ──
[7] Change issue status      — Change status label
[8] Edit/manage issue        — Edit/close/assign/sub-issue

── 🛠️ Infrastructure (one-time) ──
[S] Repo infrastructure setup — Create labels + project board (only missing items)

[B] Return to entry
```

### Input Mapping

| Input | Action |
|-------|--------|
| `1`, `new-sprint`, `create sprint` | → load `steps-c/step-05-sprint.md` (5-A) |
| `2`, `close-sprint` | → load `steps-c/step-05-sprint.md` (5-B) |
| `3`, `sprint-list`, `list`, `progress` | → load `steps-c/step-05-sprint.md` (5-C) |
| `4`, `page` | → load `steps-c/step-02-page.md` |
| `5`, `task` | → load `steps-c/step-03-task.md` |
| `6`, `bug` | → load `steps-c/step-04-bug.md` |
| `7`, `status` | → load `steps-c/step-06-status.md` |
| `8`, `manage`, `edit` | → load `steps-c/step-07-manage.md` |
| `S`, `setup`, `infrastructure`, `init` | → load `steps-c/step-01-infra.md` |
| `B` | Return to entry |

**PM shortcuts (direct entry from PM agent):**

| Shortcut | Direct entry |
|----------|-------------|
| `status` | → load `steps-c/step-06-status.md` |
| `add` | → load `steps-c/step-02-page.md` |
| `milestone` | → load `steps-c/step-05-sprint.md` (5-A) |
| `label` | → load `steps-c/step-07-manage.md` |
| `pr` | → load `steps-c/step-08-pr.md` |

---

## 📋 Step 7 — Report

After any case completes, display:

```
✅ Action completed

{summary of created/changed}:
- Created: #{n} {title}
- Updated: #{n} {before} → {after}

Next:
[A] Add another issue (Case 3)
[P] Add another page (Case 2)
[S] Refresh status (Step 1)
[E] Return to entry
```

---

## 🔄 Return to Entry

On `[E]` or `[B]` → reload `01-entry.md`.

---

## ✅ Success Criteria

- Selected case completed without error
- New items tracked in `{created_issues}` list
- Sub-issues correctly linked to parents
- Proper labels/milestone/assignee applied

## ❌ Failure Criteria (MUST NOT)

- Create duplicate issues without user confirmation
- Skip label validation (missing labels = skip creation)
- Create sub-issue without parent linkage
- Modify protected files in the process

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-29
