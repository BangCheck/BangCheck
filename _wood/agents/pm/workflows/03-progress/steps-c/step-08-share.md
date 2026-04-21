---
step: 8
title: "Share with assignee and menu"
nextStep: null
---

# Step 08 — Share and Menu

READ THIS ENTIRE FILE before executing any action.

---

## Menu Output

```
[S] Share as comment to assignee (preview required)
[A] Analyze another issue    → Step 1
[P] Page comprehensive analysis → Step 1 (option C)
[B] Return to PM dashboard

Number:
```

STOP and WAIT for user input.

---

## Input Handlers

| Input | Action |
|-------|--------|
| `S`, `share` | Load 02-activity step-03-comment (pre-fill with report summary) |
| `A`, `another` | Load `./step-01-select.md` |
| `P`, `page` | Load `./step-01-select.md` (select option C) |
| `B`, `back` | Return to PM dashboard |

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-20
