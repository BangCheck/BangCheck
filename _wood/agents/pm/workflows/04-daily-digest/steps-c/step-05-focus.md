---
name: step-05-focus
description: "Today's Focus"
nextStepFile: "./step-06-summary.md"
---


# Step 05 — Today's Focus

READ THIS ENTIRE FILE before executing any action.

---

### 5-1. Issues In Review

```bash
gh issue list --repo $REPO --state open \
  --label "상태:리뷰" --json number,title,assignees
```

---

### 5-2. Approaching Deadline Issues (within D-3)

Issues where the active milestone's `due_on` is within today + 3 days.

---

### 5-3. Merge-Ready PRs (APPROVED)

```bash
gh pr list --repo $REPO --state open \
  --json number,title,reviews \
  | jq '.[] | select(.reviews | map(.state) | contains(["APPROVED"]))'
```

---

### 5-4. Render

```
🎯 Today's Focus

In review:       [#{n} {title}]({url}) — [{assignee}]({profile})
Merge ready:     [PR #{n} {title}]({url}) — APPROVED
Deadline soon:   [#{n} {title}]({url}) — D-{days}

(If none: ✅ No urgent items today)
```

---

## Completion

Save focus data → load `./step-06-summary.md`.
