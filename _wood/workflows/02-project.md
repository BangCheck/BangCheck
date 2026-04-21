<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Workflow 02 — Project Management

> **Purpose:** Create and manage issues (page/task/bug/improvement), milestones, labels.
> **Protocol:** Follow [`_protocol.md`](_protocol.md) strictly.
> **Coding rules:** Defer to [`_coding-guide.md`](_coding-guide.md).

---

## 🛡️ Pre-flight Check

Re-run the pre-flight from [`01-entry.md`](01-entry.md) if not already done in this session.

Required: `gh auth`, correct repo, user role identified.

---

## 📋 Step 1 — Scan Current Infrastructure

```bash
# Labels
gh label list --repo SWYP-Backend/project --json name --limit 100 --jq '.[].name'

# Projects (GitHub milestones)
gh api repos/SWYP-Backend/project/milestones \
  --jq '.[] | "\(.title)|\(.open_issues)|\(.closed_issues)|\(.state)"'

# Issue summary
gh issue list --repo SWYP-Backend/project --state open --json number,title,labels --limit 50
gh issue list --repo SWYP-Backend/project --state closed --json number --limit 1 --jq length
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
| `1`, `new-sprint`, `create sprint` | Case 5-A (create sprint) |
| `2`, `close-sprint` | Case 5-B |
| `3`, `sprint-list`, `list`, `progress` | Case 5-C |
| `4`, `page` | Case 2 |
| `5`, `task` | Case 3 (type=task) |
| `6`, `bug` | Case 4 (type=bug) |
| `7`, `status` | Case 6 |
| `8`, `manage`, `edit` | Case 7 |
| `S`, `setup`, `infrastructure`, `init` | Case 1 (infrastructure setup) |
| `B` | Return to entry |

**PM shortcuts (direct entry from PM agent):**

| Shortcut | Direct entry |
|----------|-------------|
| `status` | Case 6 — start directly from issue number input |
| `add` | Case 2 — start directly from spec reference prompt |
| `milestone` | Case 5-A — start directly from sprint name input |
| `label` | Case 7 — start directly from issue selection |
| `pr` | Case PR — start directly from open PR list |

---

## 📋 Case 1 — Repo Infrastructure Setup (one-time)

### 1-1. Check existing infrastructure

If labels/milestones already exist, ask:

```
{n} labels and {m} milestones already exist — mostly ready.

▶️ Recommended: [1] Return to previous menu (already sufficient)

Other options:
  [2] Create only missing items
  [3] Full re-initialization (keep existing + fill missing)
  [B] Cancel
```

- `1` → Return to Step 2 menu
- `2` → Analyze missing items and create only those labels/milestones
- `3` → Re-run full 1-2 steps (skip existing items)

### 1-2. Create Labels

Create ONLY missing labels. Defined set:

| Label | Color | Description |
|-------|-------|-------------|
| `유형:페이지` | `1D76DB` | Page |
| `유형:작업` | `0E8A16` | Task |
| `유형:버그` | `D73A4A` | Bug |
| `유형:개선` | `A2EEEF` | Improvement |
| `순위:최상` | `B60205` | P0 |
| `순위:높음` | `D93F0B` | P1 |
| `순위:중간` | `FBCA04` | P2 |
| `순위:하위` | `0E8A16` | P3 |
| `상태:백로그` | `EDEDED` | Backlog |
| `상태:할일` | `D4C5F9` | Todo |
| `상태:진행중` | `0075CA` | In progress |
| `상태:블로킹` | `E11D48` | Blocked |
| `상태:리뷰` | `F59E0B` | In review |
| `상태:완료` | `0E8A16` | Done |
| `모바일` | `FF6B6B` | Mobile |
| `백엔드` | `0052CC` | Backend |
| `디자인` | `F9D0C4` | Design |

Command (skip existing):
```bash
gh label create "{name}" --color "{color}" --description "{desc}" --repo SWYP-Backend/project 2>/dev/null || true
```

### 1-3. Create first milestone

Ask user:
```
Please enter the first milestone name (default: Sprint 1):
```

Create:
```bash
gh api repos/SWYP-Backend/project/milestones \
  -f title="{name}" -f state="open" \
  -f description="SWYP — {name}"
```

### 1-4. Create project board

Check existing:
```bash
gh project list --owner SWYP-Backend --format json
```

If none for SWYP:
```bash
gh project create --owner SWYP-Backend --title "SWYP Room Checklist"
```

Instruct user:
```
Project board has been created. Please add the following columns on GitHub web:
Backlog → Todo → In Progress → Review → Done
```

### 1-5. Report

Proceed to Step 7 (Report).

---

## 📋 Case 2 — Add Page (Story Issue)

### 2-1. Spec Reference

```
Would you like to reference the functional spec?

[Y] Create based on functional spec (recommended)
[N] Manual input
```

If `Y` → read `docs/spec/functional-spec.xlsx` (or .md version if available), extract page list.

Display:
```
Pages found in functional spec:

| # | Page | Path | Issue exists? |
|---|------|------|---------------|
| 1 | Login | /login | ✗ |
| 2 | Home | /home | ✗ |
...

Select page numbers to create (comma-separated, or "all"):
```

### 2-2. Page Type Detection

For each selected page, ask:
```
Select this page's type:

[1] Form page (login, signup, settings)
[2] List page (search results, listings)
[3] Map page
[4] Detail page (profile, detail view)
[5] Dashboard page
[6] General page
```

### 2-3. Default Checklist

Based on type, load preset from `docs/spec/page-presets.md`.
Show to user for confirmation/edit:

```
Default checklist (included in body without separate issues):

- [ ] Page routing setup
- [ ] Responsive layout (360px~)
- [ ] Loading state UI
- [ ] Error state UI
- [ ] Accessibility basics (keyboard navigation, semantic tags)
{type-specific items}

Add/modify/delete? (Enter edits or press Enter to confirm):
```

### 2-4. Feature Issues List

Ask user:
```
List the features for this page (to be created as sub-issues):
(separate with Enter, empty line to finish)

Example: Login form UI / Naver social login / Google social login / Token management
```

### 2-5. Priority + Milestone + Assignee

```
Select priority:
[1] 순위:최상  [2] 순위:높음  [3] 순위:중간 (default)  [4] 순위:하위
```

```
Select milestone: {list open milestones or [skip]}
```

```
Assignee:
[1] Myself (@{user_login})
[2] Select team member
[3] Assign later
```

### 2-6. Duplicate Check

```bash
gh issue list --repo SWYP-Backend/project --state open --search "{title}" --json number,title --limit 5
```

If similar exists:
```
⚠️ Similar issues found:
  #{n} {title}

▶️ Recommended: [1] View existing issue (avoid duplicates)

Other options:
  [2] Create anyway (intentional)
  [3] Create with modified title (input): ___
  [B] Cancel
```

### 2-7. Create Page Issue

Load template from `docs/spec/templates/page-issue.template.md` (if exists).
Or use inline template:

```markdown
## {title}

{description}

---

### Default Checklist

{default_checklist}

### Feature Issues

{feature_issues_list}

### Bugs

(added during development)

### Done Criteria

- [ ] All default checklist items completed
- [ ] All feature issues closed
- [ ] Zero bugs (or deferred)
- [ ] Design review completed
- [ ] Responsive verified (mobile/tablet/desktop)
```

Create:
```bash
gh issue create --repo SWYP-Backend/project \
  --title "{title}" \
  --label "유형:페이지,{priority}" \
  --milestone "{milestone}" \
  --assignee "{assignee}" \
  --body "{rendered_template}"
```

### 2-8. Sub-issue Generation Prompt

```
Would you like to create individual task issues from the feature list?

[Y] Bulk create tasks (recommended)
[N] Later
[A] Add another page
[D] Done
```

If `Y` → proceed to Case 3 with `parent_number` and `task_list`.

---

## 📋 Case 3 — Add Task (Sub-issue)

### 3-1. Parent Selection

If invoked with `parent_number` (from Case 2), use it.
Otherwise:

```bash
gh issue list --repo SWYP-Backend/project --label "유형:페이지" --state open \
  --json number,title --limit 20
```

```
Select parent page:

| # | Title |
|---|-------|
| #{n} | {title} |
| [0] | Create standalone task without parent

Enter number:
```

### 3-2. Bulk Create (if task_list provided)

Show list for confirmation only:

```
Tasks to create:

| # | task | priority |
|---|------|---------|
| 1 | {task_1} | inherited |
| 2 | {task_2} | inherited |

Proceed to fill in details for each task one by one.
```

STOP and WAIT for user input (`Y` to proceed, `E` to edit list, `B` to cancel).

### 3-3. Per-task Detail Collection (MANDATORY)

For **each task** in the list, collect details before creating:

```
── Task {n}/{total}: {task_title} ──

Fill in the details below. Press Enter to skip optional fields.

[Required]
  What needs to be implemented?
  > ___

[Optional — leave blank to use placeholder]
  Implementation checklist items (comma-separated):
  > ___

  Edge cases to consider (comma-separated):
  > ___

  Test scenarios (comma-separated):
  > ___

  Done criteria (comma-separated, defaults applied if blank):
  > ___
```

STOP and WAIT for user input before moving to next task.

Apply defaults for skipped fields:
- Implementation checklist → `- [ ] (to be detailed)`
- Edge cases → `- [ ] (to be detailed)`
- Test scenarios → `- [ ] (to be detailed)`
- Done criteria → standard 3 items (feature works / no regression / code convention)

### 3-4. Preview Before Create (MANDATORY)

After collecting details for all tasks, show full preview:

```
📋 Issue preview — {task_title}

  Parent:    #{parent_number}
  Labels:    유형:작업 · {priority}
  Milestone: {milestone}
  Assignee:  {assignee}

  ## Implementation
  {description}

  ## Implementation Checklist
  {checklist}

  ## Edge Cases
  {edge_cases}

  ## Test Scenarios
  {test_scenarios}

  ## Done Criteria
  {done_criteria}

[Y] Create  [E] Edit  [N] Skip this task
```

STOP and WAIT. Repeat for each task.

### 3-5. Create Each Task

```bash
gh issue create --repo SWYP-Backend/project \
  --title "{task_title}" \
  --label "유형:작업,{priority_inherited}" \
  --milestone "{milestone_inherited}" \
  --assignee "{assignee}" \
  --body "{rendered}"
```

### 3-4. Link Sub-issue

```bash
# Preferred: GitHub sub-issues API
gh api repos/SWYP-Backend/project/issues/{parent}/sub_issues \
  -f sub_issue_id={child_issue_node_id}
```

Fallback (if API unavailable):
- Update parent body's "### Feature Issues" section with `- [ ] #{child} {title}`

### 3-5. Duplicate Check

Before each creation:
```bash
gh issue list --repo SWYP-Backend/project --state open --search "{title}"
```

Warn if similar exists.

---

## 📋 Case 4 — Add Bug

### 4-1. Collect Info (interactive)

```
[1] Title: "Describe the bug in one line:"
[2] Reproduction steps: "How to reproduce? (step by step, empty line to finish):"
[3] Expected result: "What is the correct behavior?"
[4] Actual result: "What actually happens?"
[5] Error log: "Paste error message if any (press Enter if none):"
```

### 4-2. Priority Recommendation

Auto-suggest based on keywords:

| Keyword | Recommended |
|---------|------------|
| crash, white screen, data loss | `순위:최상` |
| error, failure, broken | `순위:높음` |
| slow, inconvenient, intermittent | `순위:중간` |
| typo, minor, trivial | `순위:하위` |

Ask user to confirm or override.

### 4-3. Create

Template:
```markdown
## Reproduction Steps

1. {step_1}
2. {step_2}

## Expected Result

{expected}

## Actual Result

{actual}

## Environment
- Browser:
- OS:
- Screen size:

## Error Log

{error_log}
```

```bash
gh issue create --repo SWYP-Backend/project \
  --title "[bug] {title}" \
  --label "유형:버그,{priority}" \
  --body "{rendered}"
```

---

### 4-4. PM Escalation (Important)

After registering a bug, if PM needs to be aware:

```bash
# 1) If priority is critical, mention @PM
gh issue comment {new_bug_number} \
  --body "@{pm_github_login} Urgent review needed" \
  --repo SWYP-Backend/project

# 2) If my work is blocked by this bug, add blocking label to my issue
gh issue edit {my_working_issue} \
  --add-label "상태:블로킹" \
  --repo SWYP-Backend/project
```

PM's `04-daily-digest` automatically collects these signals.

---

## 📋 Case 5 — Sprint Management

3 sub-cases: **5-A Create / 5-B Close / 5-C List**.

Entry points:
- Menu [1] → 5-A
- Menu [2] → 5-B
- Menu [3] → 5-C

---

### 📋 Case 5-A — Create New Sprint (entry: Menu [1])

#### 5-A-1. Name Input

```
📦 Create New Sprint

Enter the name (e.g., "S3 Page Development - Sprint 2026-04-22"):
  → ___
```

Suggested name references:
- Refer to sprint column values in xlsx `docs/spec/functional-spec-v2.1.2.xlsx`
- e.g., "S1 Planning", "S3 Page Development - Sprint 2026-04-22"

#### 5-A-2. Duration Input

```
Start date (YYYY-MM-DD, press Enter for today):
  → ___

End date (YYYY-MM-DD, required):
  → ___
```

#### 5-A-3. Goal Input

```
Goal/description (optional, press Enter to skip):
  → ___

e.g., "Login + Landing page MVP"
```

#### 5-A-4. Auto-assign Issues from xlsx (optional)

```
Would you like to auto-create issues from screens belonging to this sprint (S3 Page Development) in the xlsx?

▶️ Recommended: [1] Create sprint + create screen issues and assign to this milestone

Other options:
  [2] Create sprint only (add issues manually later)
  [3] Move existing issues to this sprint
  [B] Cancel
```

**Option [1] flow**:
- Filter xlsx column P via openpyxl → extract "S3 Page Development" rows
- Create page issues per screen (delegate to Case 2 flow)
- Assign each issue to the new milestone

#### 5-A-5. Confirm + Create

```
Confirmation:
  Name:           {input}
  Start:          {input}
  End:            {input}
  Goal:           {input or "(none)"}
  Initial issues: {n} to be assigned

▶️ Recommended: [1] Create
  [2] Edit (start over)
  [B] Cancel
```

Execute:
```bash
# Create milestone
gh api repos/SWYP-Backend/project/milestones \
  -f title="{name}" \
  -f state="open" \
  -f due_on="{end_date}T23:59:59Z" \
  -f description="{goal}"

# (If option [1]) Auto-create issues → delegate to Case 2
```

After creation:
```
✅ Sprint "{name}" created successfully
   GitHub: [link]
   Duration: {start} ~ {end} ({days} days)
   Initial issues: {n} assigned

Next recommended: [4] Add page or notify team members
```

---

### 📋 Case 5-B — Close Sprint (entry: Menu [2])

Show open milestone list → select.

If open issues remain:
```
"{name}" has {n} open issues remaining.

▶️ Recommended: [1] Move to next sprint (safe)

Other options:
  [2] Close anyway (issues become unassigned from milestone)
  [3] Cancel
```

```bash
gh api repos/SWYP-Backend/project/milestones/{number} -X PATCH -f state="closed"
```

---

### 📋 Case 5-C — Sprint List/Progress (entry: Menu [3])

```bash
gh api repos/SWYP-Backend/project/milestones?state=all \
  --jq '.[] | {number, title, state, open_issues, closed_issues, due_on}'
```

Render:
```
📦 Sprint List

| Status | Name | open/closed | Progress | Due |
|--------|------|------------|----------|-----|
| 🟢 | [Sprint 2 — MVP]({url}) | 3/5 | 62% | 2026-05-03 (D-7) |
| ⚠️ | [Page Feature Composition]({url}) | 0/7 | 100% | — | ← close candidate
| ✅ | [Sprint 1]({url}) | 0/1 | 100% | closed |
```

Close candidates show **"[⚠️ Close]"** action link.

```bash
gh api repos/SWYP-Backend/project/milestones/{number} -X PATCH -f state="closed"
```

---

## 📋 Case 6 — Issue Status Change

```
Enter issue number: #{n}
```

Show current state, ask for new:
```
#{n} {title} — Current: {status}

[1] Backlog    [2] Todo    [3] In Progress
[4] Blocked    [5] Review  [6] Done
```

```bash
gh issue edit {n} \
  --remove-label "{current_status}" \
  --add-label "{new_status}" \
  --repo SWYP-Backend/project
```

Special handling:
- `[4] Blocked` → ask reason → add as issue comment
- `[6] Done` → check for open sub-issues, warn if any

---

## 📋 Case 7 — Issue Management

### 7-1. Select Issue

```
Enter issue number: #{n}
```

Show issue summary:
```
#{n} {title}
  Status: {state} | Labels: {labels} | Assignee: {assignees}
  Milestone: {milestone}
```

### 7-2. Management Menu

```
[1] Edit issue           — Modify title/body/labels
[2] Change assignee
[3] Move to milestone
[4] Close issue
[5] Sub-issue management — Add/remove
[6] Page checklist update
[B] Back
```

### 7-3. Actions

- **Edit title**: `gh issue edit {n} --title "{new}"`
- **Edit body**: fetch current, apply user's edit description, write back
- **Edit labels**: add/remove specific
- **Assign**: `gh issue edit {n} --add-assignee "{login}"`
- **Move milestone**: `gh issue edit {n} --milestone "{name}"`
- **Close**: `gh issue close {n} --reason completed|not-planned`
- **Sub-issue add/remove**: via sub-issues API or body checklist edit
- **Page checklist update**: edit "### Default Checklist" section

Before close: warn if sub-issues still open.

---

## 📋 Case PR — PR Reviewer Assignment

### PR-1. Find PRs Without Reviewers

```bash
gh pr list --repo SWYP-Backend/project --state open \
  --json number,title,author,reviewRequests \
  --jq '.[] | select(.reviewRequests | length == 0)'
```

```
PRs without reviewers:

| PR | Title | Author |
|----|-------|--------|
| #{n} | {title} | {author} |
```

If none:
```
✅ All PRs have reviewers assigned.
```

### PR-2. Assign Reviewer

```
Enter PR number to assign reviewer: #___

Team member list:
{lookup from team-roles.yaml}

Reviewer GitHub login:
```

```bash
gh pr edit {pr_number} --add-reviewer "{login}" --repo SWYP-Backend/project
```

```
✅ Reviewer @{login} assigned to PR #{n}
   [View PR]({url})
```

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

On `[E]` or `[B]` → reload [`01-entry.md`](01-entry.md).

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
**Last reviewed:** 2026-04-16
