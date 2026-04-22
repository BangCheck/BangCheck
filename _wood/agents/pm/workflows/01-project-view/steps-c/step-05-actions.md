---
name: step-05-actions
description: "Next Action Menu"
nextStepFile: "null"
---


# Step 05 — Next Actions

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Next Action Menu

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + Milestones API + Project Board
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### 5-1. Display Action Menu

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


> 🛑 **STOP** — Wait for user input before continuing.


---

### 5-2. Input Handlers

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

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `null`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
