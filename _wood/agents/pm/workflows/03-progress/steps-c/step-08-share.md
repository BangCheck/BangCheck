---
name: step-08-share
description: "Share with assignee and menu"
nextStepFile: "null"
---


# Step 08 — Share and Menu

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Share with assignee and menu

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A COMMUNICATOR — surface findings clearly, do not interpret beyond facts
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + Branch data
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

## Menu Output

```
[S] Share as comment to assignee (preview required)
[A] Analyze another issue    → Step 1
[P] Page comprehensive analysis → Step 1 (option C)
[B] Return to PM dashboard

Number:
```


> 🛑 **STOP** — Wait for user input before continuing.


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

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `null`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
