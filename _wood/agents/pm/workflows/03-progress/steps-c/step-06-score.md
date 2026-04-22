---
step: 6
title: "Weighted score calculation"
nextStep: "./step-07-render.md"
---

# Step 06 — Score Calculation

READ THIS ENTIRE FILE before executing any action.

---

## 6-1. Load Weights

```bash
yq '.progress_estimation.weights' _wood/milestone-meta.yaml
```

---

## 6-2. Weighted Sum

```python
score = (checklist_ratio         * weights.checklist_completion)
      + (commit_activity_score   * weights.commit_activity)
      + (test_presence_score     * weights.test_presence)
      + (todo_absence_score      * weights.todo_marker_absence)
      + (pr_state_score          * weights.pr_state)

# todo_absence_score = 1 - min(todo_count / 10, 1)
# commit_activity_score = 0 if stale else 1

score = max(0, min(score, 1)) * 100  # 0~100%
```

---

## Completion

Save `{final_score}` → load `./step-07-render.md`.
