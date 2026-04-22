---
name: step-06-score
description: "Weighted score calculation"
nextStepFile: "./step-07-render.md"
---


# Step 06 — Score Calculation

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Weighted score calculation

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + Branch data
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### 6-1. Load Weights

```bash
yq '.progress_estimation.weights' _wood/milestone-meta.yaml
```

---

### 6-2. Weighted Sum

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

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Output rendered in the exact specified format
- User explicitly confirmed before commit/push
- Routed correctly to `./step-07-render.md`

### ❌ FAILURE
- Rendering with missing or partial data — wait for complete data first
- Committing or pushing without explicit user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
