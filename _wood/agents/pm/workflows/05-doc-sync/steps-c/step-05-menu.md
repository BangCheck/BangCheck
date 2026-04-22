---
name: step-05-menu
description: "Action Menu"
nextStepFile: "null"
---


# Step 05 — Action Menu

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Action Menu

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: Google Sheets MCP (시트22) + GitHub Issues API
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

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


> 🛑 **STOP** — Wait for user input before continuing.


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

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `null`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
