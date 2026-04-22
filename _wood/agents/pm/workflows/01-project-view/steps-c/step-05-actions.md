---
step: 5
title: "Next Action Menu"
nextStep: null
---

# Step 05 — Next Actions

READ THIS ENTIRE FILE before executing any action.

---

## 5-1. Display Action Menu

```
## Next Actions

[💬] Comment on an issue        → Team Activity Workflow
[📊] AI progress analysis       → Progress Analysis Workflow
[➕] Create new issue            → Issue Management Workflow
[🔒] Close milestone            → Issue Management Workflow (active only when all issues are closed)
[R]  Refresh                    → Return to Step 01
[B]  Return to PM Dashboard

Enter a number or keyword:
```

STOP and WAIT for user input.

---

## 5-2. Input Handlers

| Input | Action |
|-------|--------|
| `💬`, `comment` | Load `../../02-activity/workflow.md` |
| `📊`, `progress` | Load `../../03-progress/workflow.md` |
| `➕`, `issue`, `new` | Load `../../../../workflows/02-project.md` |
| `🔒`, `close`, `milestone` | Load `../../../../workflows/02-project.md` Case 5 |
| `R`, `refresh` | Load `../steps-c/step-01-load.md` (restart) |
| `B`, `back` | Return to PM Dashboard (agent.md menu) |

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-20
