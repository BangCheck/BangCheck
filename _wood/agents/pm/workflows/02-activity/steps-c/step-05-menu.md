---
name: step-05-menu
description: "Action menu"
nextStepFile: "null"
---


# Step 05 — Action Menu

READ THIS ENTIRE FILE before executing any action.

---

## Menu Output

```
[1] Refresh full activity feed     → Step 1
[2] Per-issue activity view        → Step 2
[3] Write a comment on an issue    → Step 3
[4] Check pending reply comments   → Step 4
[B] Return to PM dashboard

Enter a number:
```


> 🛑 **STOP** — Wait for user input before continuing.


---

## Input Handlers

| Input | Action |
|-------|--------|
| `1`, `refresh` | Load `./step-01-fetch.md` |
| `2`, `issue` | Load `./step-02-issue-view.md` |
| `3`, `comment` | Load `./step-03-comment.md` |
| `4`, `followup` | Load `./step-04-followup.md` |
| `B`, `back` | Return to PM dashboard (agent.md menu) |

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-20

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `null`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
