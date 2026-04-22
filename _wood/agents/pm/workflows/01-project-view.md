<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow 01 — Project View (Hierarchical Tree View)

> **Agent:** PM
> **Purpose:** Get a full picture of milestone → page → task structure at a glance
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, PM]` (enforced by parent agent)
- At least 1 open milestone must exist (otherwise guide user to create a project)

---

## Step 1 — Collect tree data

### 1-1. Milestones (open + recently closed)

```bash
# REPO is set in _core.md § Environment Guard

# All open milestones
gh api "repos/$REPO/milestones?state=open&per_page=30" \
  --jq '.[] | {number, title, description, due_on, open_issues, closed_issues, state}'

# Recently closed milestones within last 30 days (optional)
gh api "repos/$REPO/milestones?state=closed&per_page=10&sort=updated&direction=desc"
```

### 1-2. Page issues (유형:페이지)

For each milestone:
```bash
gh issue list --repo $REPO \
  --milestone "{milestone_number}" \
  --label "유형:페이지" --state all \
  --json number,title,state,labels,assignees,updatedAt,body \
  --limit 50
```

### 1-3. Task issues (유형:작업)

```bash
gh issue list --repo $REPO \
  --milestone "{milestone_number}" \
  --label "유형:작업" --state all \
  --json number,title,state,labels,assignees,updatedAt,body \
  --limit 200
```

### 1-4. Parent-child relationships

Priority:
1. GitHub sub-issues API (if available)
   ```bash
   gh api "repos/$REPO/issues/{page_num}/sub_issues" --jq '.[].number'
   ```
2. Fallback: parse each task's body for `Parent: #N`

### 1-5. Bugs (유형:버그)

```bash
gh issue list --repo $REPO \
  --milestone "{milestone_number}" \
  --label "유형:버그" --state open \
  --json number,title,labels,assignees --limit 50
```

---

## Step 2 — Build tree structure

```
Milestone (open)
  ├── Page issues
  │     ├── Task issues (sub-issue or Parent: # link)
  │     └── ...
  ├── Independent tasks (no parent page)
  └── Bug issues
```

---

## Step 3 — Render tree view

### Milestone block

```markdown
### {icon} [{milestone_title}]({milestone_url}) — {completion_pct}% ({closed}/{total})
  📅 Due: {due_on or "TBD"}
  🎯 {goal or description_first_line or "(no goal)"}
  {kickoff_link_if_exists}

  📄 [#{page_num} {page_title}]({url}) — {page_icon} ({sub_done}/{sub_total})
     ├── [#{task_num} {task_title}]({url})  {status_icon}  Assignee: [{assignee_name}]({profile})
     │   [🌐]({url}) [💬 Comment]({comment_action})
     ├── [#{task_num} {task_title}]({url})  {status_icon}  Assignee: [{assignee_name}]({profile})
     └── [#{task_num} {task_title}]({url})  {status_icon}  Assignee: _unassigned_

  📄 [#{page_num} {page_title}]({url}) — ⚪ (no tasks)

  🔧 Independent tasks
     └── [#{n} {title}]({url})  {status_icon}  Assignee: [{name}]({profile})

  🐛 Bugs ({count})
     ├── [#{n} {title}]({url})  {priority_icon} Assignee: [{name}]({profile})
     └── ...
```

### Milestone icon rules

Icon is determined by reading `global_defaults` + `milestones.{n}.risk_overrides` from `milestone-meta.yaml`:

```python
# Pseudo-code
closed_pct = closed_issues / total_issues
expected_pct = days_elapsed / total_days  # if due_on exists

if closed_pct == 1.0 and milestone.state == "open":
    icon = "⚠️"  # close candidate
elif closed_pct / expected_pct >= on_track_threshold:
    icon = "🟢"
elif closed_pct / expected_pct >= caution_threshold:
    icon = "🟡"
else:
    icon = "🔴"
```

If due_on is null, skip ratio calculation and use completion rate only:
- ≥80% → 🟢
- ≥50% → 🟡
- <50% → ⚪

### Page status icon

```python
if page.state == "closed":
    icon = "✅"
elif all sub-issues closed:
    icon = "✅ (close candidate)"
elif any task has 상태:진행중:
    icon = "🟢"
elif all tasks 할일/백로그:
    icon = "⚪"
```

### Task status icon (from 상태:* label)

| Label | Icon |
|------|-------|
| 상태:진행중 | 🟢 |
| 상태:리뷰 | 🟣 |
| 상태:블로킹 | 🔴 |
| 상태:할일 | 🟡 |
| 상태:백로그 | ⚪ |
| 상태:완료 | ✅ |
| closed (no label) | ✅ |

---

## Step 4 — Summary section

After all milestone blocks:

```markdown
---

## 📈 Overall Summary

| Type  | open | closed |
|-------|------|--------|
| Pages | {n}  | {n}    |
| Tasks | {n}  | {n}    |
| Bugs  | {n}  | {n}    |
| Improvements | {n} | {n} |

## ⚠️ Attention Items

🚫 Blocking ({count})
  - [#{n} {title}]({url}) — [{assignee}]({profile}), {days} days

⏰ Stale PR ({count})
  - [PR #{n} {title}]({url}) — waiting for review {hours}h

➕ Unassigned issues ({count})
  - [#{n} {title}]({url})

⚪ Idle members ({count})
  - [{name}]({profile}) — no activity in last {days} days

(If 0 attention items: ✅ All items in good standing)
```

---

## Step 5 — Filter / Zoom options

```markdown
## Filter / Zoom

[M] View specific milestone only    → enter number
[P] Zoom into specific page         → enter number
[U] Member view                     → grouped by team-roles.yaml
[T] Type view (page/task/bug)
[C] Collapse (hide closed issues)
[R] Refresh
[B] Return to PM Dashboard
```

### Zoom on a milestone

User enters `M` then milestone number → show that milestone in full detail (all tasks expanded).

### Zoom on a page

`P` then page number → show all tasks for that page **+ latest commit/PR per task**.

```markdown
## 📄 [#4 Login Page]({url}) Detail

Body summary:
  {body first 200 chars}

### Base Checklist ({checked}/{total})
  - [x] Routing
  - [x] Responsive
  - [ ] Loading state
  - [ ] Error state

### Feature Tasks ({done}/{total})
  - ✅ [#5 Login Form UI]({url}) — Lee Min-woo
    💾 4 commits, last {time_ago}
    🔗 [PR #13]({url}) merged
  - 🟢 [#6 Naver Social Login]({url}) — Lee Ji-ye
    💾 2 commits, last {time_ago}
    (no PR)
  - 🔴 [#7 Google Social Login]({url}) — Lee Jin-yong
    상태:블로킹 — waiting for API key
    [💬 Check reason]

### Bugs (0)
  (none)
```

### User view (by member)

`U` → regroup by member:

```markdown
## 👥 Current Tasks by Member

### 👑 [Woo Jong-ho]({profile}) — Admin/FE
  🟢 [#5 Login Form UI]({url})
  
### 🔧 [Han Jang-eui]({profile}) — FE
  🟡 [#9 Landing Page]({url})

### ⚙️ [Lee Min-woo]({profile}) — BE
  🟢 [#21 auth API]({url})

### ⚙️ [Lee Ji-ye]({profile}) — BE
  (no assignments ⚪)
```

---

## Step 6 — Actions

```markdown
## Next Actions

[💬] Comment on a specific issue → 02-activity.md Step 3
[📊] AI progress analysis for a specific issue → 03-progress.md
[➕] Create new issue → 02-project.md
[M] Close milestone (only when all issues are closed) → 02-project.md Case 5
[B] Return to PM Dashboard
```

---

## ✅ Success Criteria

- Tree structure matches actual GitHub data
- All issue/PR/member references are clickable links
- Milestone icons follow milestone-meta.yaml rules
- Filter/zoom works correctly

## ❌ Failure Criteria

- Hierarchy confusion (task appearing above page, etc.)
- Fabricated data
- Ignoring label rules (wrong 상태:* icon mapping)
- Showing a closed milestone as open

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
