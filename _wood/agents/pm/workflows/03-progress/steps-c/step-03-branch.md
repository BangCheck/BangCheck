---
name: step-03-branch
description: "Branch search"
nextStepFile: "./step-04-analyze.md"
---


# Step 03 — Branch Search

READ THIS ENTIRE FILE before executing any action.

---

## 3-1. Search Branch by Issue Number

```bash
BRANCHES=$(git branch -a | grep -E "(feat|fix|refactor)/.*{N}(-|$)" | head -5)
```

---

## 3-2. Result Handling

| Case | Action |
|------|--------|
| 1 found | Auto-select |
| 2 or more | Display list and wait for selection |
| 0 found | `⚠️ No branch found — estimating progress from checklist only` then jump to step-06-score |

When 0 branches found:
```
⚠️ No branch linked to issue #{n}.
Estimating progress based on checklist only.

[Y] Continue  [N] Cancel
```

STOP and WAIT for user input.

---

## Completion

Save `{selected_branch}` → load `./step-04-analyze.md`.
