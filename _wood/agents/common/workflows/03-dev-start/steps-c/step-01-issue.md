---
name: step-01-issue
description: "Issue load + API contract parsing + checklist status"
nextStepFile: "./step-02-read.md"
---


# Step 01 — Issue + Related File Collection

READ THIS ENTIRE FILE before executing any action.

---

## 1-1. Issue Check

If `{issue_number}` already exists, use it directly. Otherwise:

```bash
gh issue list --repo $REPO \
  --assignee "$USER_LOGIN" --label "상태:진행중" --state open \
  --json number,title,labels,milestone --limit 10
```

Request issue number selection:

```
Enter the issue number to work on: #___
```

STOP and WAIT.

---

## 1-2. Load Issue Details

```bash
gh issue view {issue_number} --repo $REPO \
  --json number,title,body,labels,assignees,milestone,comments
```

Extract the following:
- Title, body (implementation details, completion criteria)
- Parent issue number (parse `Parent: #` from body)
- Milestone

---

## 1-3. Issue Body Parsing — Tracking Keys + API Contract + Checklist

Parse the following sections from the issue body:

### Tracking Information

```
Parse the "### Tracking Information" table from body:
  spec_screen, wbs_id, parent, role, linked_issues
```

If missing: `{tracking: "none"}` — warning only, can proceed

### API Contract (BE issues only)

```
Parse the "### API Contract" table from body:
  endpoint, request_schema, response_schema, auth_required

If missing and BE label is present:
  ⚠️ API contract is not yet defined.
  
  [A] Draft API contract now
  [S] Later (finalize during coding)
```

### Checklist Status

```bash
# Extract checklist from body
total=$(echo "$BODY" | grep -cE '^\s*- \[(x| )\]')
done=$(echo "$BODY" | grep -cE '^\s*- \[x\]')
undone_items=$(echo "$BODY" | grep -E '^\s*- \[ \]' | sed 's/^\s*- \[ \] //')
```

Display:

```
## Issue Status — #{number} {title}

Tracking: {spec_screen} / WBS {wbs_id} / Parent #{parent}
Role: {role}
{if api_contract}
API:  {method} {path}
{/if}
FE Link: #{linked_fe_issue}

Checklist: {done}/{total} ({pct}%)
  ✅ {completed_item_1}
  ✅ {completed_item_2}
  ☐ {undone_item_1}        ← current work target
  ☐ {undone_item_2}
```

---

## 1-4. Related File Discovery

Infer related files from issue title + body keywords + API endpoint:

```bash
# Keyword extraction (e.g., "social login" → "social", "login", "auth")
# + keywords from API endpoint path (e.g., "/auth/oauth" → "auth", "oauth")

# Role-based discovery
if ROLE contains "Frontend":
  find frontend/src -type f \( -name "*.tsx" -o -name "*.ts" \) | \
    xargs grep -l "{keyword}" 2>/dev/null | head -10
elif ROLE contains "Backend":
  find backend/src -type f \( -name "*.java" -o -name "*.ts" \) | \
    xargs grep -l "{keyword}" 2>/dev/null | head -10

# Recently changed related files
git log --oneline --name-only -10 | grep -i "{keyword}" | head -5
```

Save collected file list as `{related_files}`.

---

## 1-5. Existing Story Check

Check if a Story file already exists for this issue:

```bash
# Search in personal workspace
ls _wood/workspace/_${USER_LOGIN}/stories/e*-s*-*.md 2>/dev/null | grep "{issue_number}" || echo "none"
```

If found:
```
📄 Existing Story found:
  {story_file} — Status: {status}

Continue with this?
[Y] Continue based on existing Story → Skip to Step 06 (development)
[N] Fresh analysis → Start from Step 02 (code reading)
```

---

## Completion

Issue info + API contract + checklist + related files + Story check → load `./step-02-read.md`.
