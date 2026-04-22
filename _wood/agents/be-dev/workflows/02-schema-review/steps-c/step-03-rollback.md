---
name: step-03-rollback
description: "Confirm rollback plan"
nextStepFile: "./step-04-report.md"
---


# Step 03 — Rollback Plan


## YOUR TASK

Confirm rollback plan

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE AN EDITOR — modify only what user confirms, never auto-apply
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

```
## Rollback Plan

Up migration: {file}
Down migration: {file or "❌ missing — needs to be added"}

{if down_missing}
  ⚠️ Down migration is missing.
  Manual recovery procedures will be needed if production fails.

  A. Create down migration
  B. Document manual recovery procedure only
  C. Later (accept risk)

  Candid recommendation: A — without rollback in a production incident, you face service outage.
{/if}

## MANDATORY SEQUENCE

### Data backfill

{if new_not_null_column}
  Logic to populate existing data for the new NOT NULL column is needed:
  
  ```sql
  UPDATE {table} SET {column} = {default} WHERE {column} IS NULL;
  ```
  
  Did you include this query in the migration? [Y/N]
{/if}
```


> 🛑 **STOP** — Wait for user input before continuing.


→ step-04 report.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Output rendered in the exact specified format
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-04-report.md`

### ❌ FAILURE
- Rendering with missing or partial data — wait for complete data first
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
