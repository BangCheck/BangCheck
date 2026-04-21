---
step: 3
title: "Fact check table output"
nextStep: "./step-04-story.md"
---

# Step 03 — Fact Check

READ THIS ENTIRE FILE before executing any action.

---

## 3-1. Fact Check Output

All collected information at a glance:

```
## Fact Check — #{issue_number} {issue_title}

### Issue
| Field | Details |
|-------|---------|
| Milestone | {milestone} |
| Parent Issue | #{parent_number} (if applicable) |
| Completion Criteria | {done_criteria summary} |

### Code Status
| Field | Status |
|-------|--------|
| Implementation exists | {yes / no / partial} |
| Present | {list} |
| Missing (needs implementation) | {list} |
| Needs modification | {list} |
| Related branch | {branch or "none"} |
| Test files | {yes / no} |

### Related Files
| File | Role |
|------|------|
| {path} | {component/function description} |
| ... | ... |
```

---

## 3-2. Options + Candid Recommendation

Auto-generated based on code status:

```
## Next Action

A. Create new branch and start fresh implementation
   → No implementation / no branch case

B. Modify existing code
   → Partial implementation exists / existing branch case

C. Organize Epic/Story first, then implement
   → Large scope or spans multiple files case

Candid recommendation: {A/B/C} — {reason based on code status}

Which one?
```

STOP and WAIT for user selection.

---

## Completion

After selection confirmed → load `./step-04-story.md`.
