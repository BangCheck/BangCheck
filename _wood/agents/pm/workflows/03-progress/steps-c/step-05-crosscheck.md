---
name: step-05-crosscheck
description: "Checklist vs code cross-check"
nextStepFile: "./step-06-score.md"
---


# Step 05 — Cross-Check

READ THIS ENTIRE FILE before executing any action.


## YOUR TASK

Checklist vs code cross-check

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE AN AUDITOR — report findings accurately, never skip checks
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

⚠️ This is a heuristic analysis. Results are for reference only — always show the rationale to the user.

---

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + Branch data
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### 5-1. Checklist Item vs Diff Pattern Mapping

For each incomplete (`- [ ]`) item:

```
Extract item keywords → detect related patterns in diff
  "login form"        → 'LoginForm', 'login-form', 'login_form'
  "validation"        → 'validate', 'validation'
  "error handling"    → 'try', 'catch', 'error'
  "test"              → *.test.*, *.spec.*
```

Found → bonus points / Not found → penalty.

---

### 5-2. Result Summary

Per item:
```
{icon} {checklist item}: {found/not found} in code
```

- ✅ Found
- ⚠️ Partially found
- 🔴 Not found

---

## Completion

Save cross-check results → load `./step-06-score.md`.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Routed correctly to `./step-06-score.md`

### ❌ FAILURE
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
