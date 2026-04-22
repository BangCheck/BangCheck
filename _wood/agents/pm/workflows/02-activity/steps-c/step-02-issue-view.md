---
name: step-02-issue-view
description: "Per-issue activity view"
nextStepFile: "./step-05-menu.md"
---


# Step 02 — Per-Issue Activity View

READ THIS ENTIRE FILE before executing any action.

---

## 2-1. Query Active Sprint Issues

```bash
gh issue list --repo $REPO \
  --milestone "$MILESTONE_NUM" --state open \
  --label "상태:진행중" \
  --json number,title,labels,assignees --limit 30
```

---

## 2-2. Aggregate Recent Activity Per Issue

For each issue:

```bash
# Latest comments (last 3)
gh issue view $ISSUE_NUM --repo $REPO --json comments \
  --jq '.comments[-3:] | .[] | {body, author: .author.login, createdAt}'

# Connected branch commits
git log --since="7 days ago" --format="%h|%ar|%s" --all \
  --grep="#$ISSUE_NUM" 2>/dev/null | head -3

# Connected PRs
gh pr list --repo $REPO --search "closes #$ISSUE_NUM" \
  --state all --json number,title,state
```

---

## 2-3. Render

```
## 📋 In-Progress Issue Activity

### [{status_icon} #{n} {title}]({url})
  Assignee: [{assignee}]({profile})   Status: {status_icon} {status}

  Recent:
  💬 "{comment_preview}" — {author} ({time_ago})
  💾 {commit_subject} ({time_ago})

  [🌐 Issue]({url})  [💬 Write Comment →3]
```

Blocking issues are highlighted at the top:
```
### 🔴 #{n} {title} — Blocked for {days} days
  ⚠️ No response — PM intervention needed
  [💬 Request Status Comment →3]
```

---

## Completion

After rendering is complete → load `./step-05-menu.md` and follow all instructions.
