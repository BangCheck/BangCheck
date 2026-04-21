---
step: 4
title: "Filter / Zoom"
nextStep: "./step-05-actions.md"
---

# Step 04 — Filter / Zoom

READ THIS ENTIRE FILE before executing any action.

---

## 4-1. Display Filter Menu

```
## Filter / Zoom

[M] View specific milestone only   → Enter number
[P] Zoom into specific page        → Enter number
[U] Team member view
[T] Type view (page/task/bug)
[C] Hide closed issues
[R] Refresh
[N] Next →
[B] Return to PM Dashboard

Enter a number or keyword:
```

STOP and WAIT for user input.

---

## 4-2. Input Handlers

### [M] Milestone Zoom

User enters a milestone number → Re-render only that milestone in Step 3-1 format (expand all tasks).

### [P] Page Zoom

User enters a page number:

```bash
gh issue view {page_num} --repo $REPO --json number,title,body,state,labels,assignees
gh api "repos/$REPO/issues/{page_num}/sub_issues"
# Look up recent commits + PRs for each task
gh pr list --repo $REPO --state all --search "#{task_num}" --json number,title,state,mergedAt
```

Output:
```
## 📄 [#{page_num} {page_title}]({url}) Details

Body summary: {body first 200 chars}

### Feature Tasks ({done}/{total})
  - ✅ [#{n} {title}]({url}) — {assignee}
    💾 {commit_count} commits  🔗 [PR #{n}]({url}) {pr_state}
  - 🟢 [#{n} {title}]({url}) — {assignee}
    💾 {commit_count} commits  (No PR)
  - 🔴 [#{n} {title}]({url}) — {assignee}  🚫 Blocked

### Bugs ({count})
  ...
```

### [U] Team Member View

```bash
cat _wood/team-roles.yaml  # Team member list
```

Regroup current assigned issues by team member:

```
## 👥 Current Work by Team Member

### [{name}]({profile}) — {role}
  {task_icon} [#{n} {title}]({url})

### [{name}]({profile}) — {role}
  (No assignments ⚪)
```

### [T] Type View

Re-render page / task / bug each in separate blocks.

### [C] Hide Closed

Exclude closed issues and re-run Step 3.

### [R] Refresh

Return to Step 01 and re-collect data.

### [N] Next

load `./step-05-actions.md` and follow all instructions.

### [B] Return

Return to PM Dashboard (agent.md menu).

---

After filter selection, display the result → show the 4-1 menu again (loop). Exit only on `[N]` or `[B]` input.
