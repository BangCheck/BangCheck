---
name: step-05-menu
description: "Action Menu"
nextStepFile: "null"
---


# Step 05 — Action Menu

READ THIS ENTIRE FILE before executing any action.

---

## Menu Output

```
## Document Sync Menu

── Create ──
[1] Re-read specification       → steps-c/step-01
[2] Re-run issue comparison     → steps-c/step-02
[3] Create additional missing issues → steps-c/step-03
[4] Re-update Google Docs       → steps-c/step-04

── Edit ──
[E] Edit existing issue         → Enhance tracking info, add API contract, change assignee

── Validate ──
[V] Validate spec ↔ issue chain → Detect orphan issues, FE↔BE links, missing APIs

[B] Return to PM dashboard

Number:
```

STOP and WAIT for user input.

---

## Input Handlers

| Input | Action |
|-------|--------|
| `1`, `spec`, `drive` | Load `./step-01-read-drive.md` |
| `2`, `compare`, `diff` | Load `./step-02-diff.md` |
| `3`, `issue`, `create` | Load `./step-03-create-issues.md` |
| `4`, `docs`, `update` | Load `./step-04-update-docs.md` |
| `E`, `edit` | Load `../steps-e/step-01-edit-issue.md` |
| `V`, `validate` | Load `../steps-v/step-01-validate-chain.md` |
| `B`, `return` | Return to PM dashboard |

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-20
