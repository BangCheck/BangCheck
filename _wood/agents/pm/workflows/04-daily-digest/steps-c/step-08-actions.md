---
name: step-08-actions
description: "Quick Action Menu"
nextStepFile: "null"
---


# Step 08 — Quick Actions

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Quick Action Menu

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + recent activity
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

## Menu Output

```
[1] Post comment asking reason on blocking issue
[2] Post nudge comment on stale PR reviewer
[3] Go to full project view →
[R] Refresh (reset time window)
[B] Return to PM dashboard

Number:
```


> 🛑 **STOP** — Wait for user input before continuing.


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

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `null`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
