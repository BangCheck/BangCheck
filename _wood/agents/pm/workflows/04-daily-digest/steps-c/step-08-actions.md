---
name: step-08-actions
description: "Quick Action Menu"
nextStepFile: "null"
---


# Step 08 — Quick Actions

READ THIS ENTIRE FILE before executing any action.

---

## Menu Output

```
[1] Post comment asking reason on blocking issue
[2] Post nudge comment on stale PR reviewer
[3] Go to full project view →
[R] Refresh (reset time window)
[B] Return to PM dashboard

Number:
```

STOP and WAIT for user input.

---

## Input Handlers

| Input | Action |
|-------|--------|
| `1`, `blocking` | Load `02-activity/steps-c/step-03-comment.md` (pre-fill blocking issue) |
| `2`, `PR`, `stale` | Load `02-activity/steps-c/step-03-comment.md` (pre-fill stale PR reviewer) |
| `3`, `status`, `view` | Load `01-project-view/workflow.md` |
| `R`, `refresh` | Load `./step-01-timewindow.md` |
| `B`, `back` | Return to PM dashboard |

Comment actions must follow the preview → confirm flow in `step-03-comment.md`.

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-20
