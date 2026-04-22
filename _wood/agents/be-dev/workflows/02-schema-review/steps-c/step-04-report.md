---
name: step-04-report
description: "Report + team sharing + recommendation"
nextStepFile: "null"
---


# Step 04 — Report


## YOUR TASK

Report + team sharing + recommendation

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A REPORTER — present data as-is, never add unverified information
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

```
🔍 Schema Review — {branch}

## MANDATORY SEQUENCE

## Detected Changes
  Migration: {n}   Entity: {n}
  Added: {tables/columns}
  Removed: {tables/columns}

## Risk Assessment
  ✅ Safe: {n}   ⚠️ Caution: {n}   ❌ Fix needed: {n}

## Rollback
  Down migration: {exists / missing}

## Next Recommendation

{if breaking_api}
  A. Run API contract check → 01-api-contract
     Schema changes may affect API responses.
  B. Share 2-phase deployment plan with FE+PM
  C. Add schema notes to PR body

  Candid recommendation: A — if schema + API changed together, contract check is a must.
{elif fix_needed > 0}
  A. Address fix-needed items → steps-e/step-01
  B. Only add notes to PR body
  C. Return to dashboard

  Candid recommendation: A — missing FK or indexes should be caught now.
{else}
  ✅ Schema is safe.
  
  A. Update docs/be/erd.md
  B. Return to dashboard

  Candid recommendation: A — updating the ERD doc together helps the team understand the structure.
{/if}
```


> 🛑 **STOP** — Wait for user input before continuing.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Output rendered in the exact specified format
- User input received at every STOP gate before proceeding
- Routed correctly to `null`

### ❌ FAILURE
- Rendering with missing or partial data — wait for complete data first
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
