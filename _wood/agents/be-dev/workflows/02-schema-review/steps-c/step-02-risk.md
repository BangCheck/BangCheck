---
name: step-02-risk
description: "Check 5 risk areas"
nextStepFile: "./step-03-rollback.md"
---


# Step 02 — Risk Checklist


## YOUR TASK

Check 5 risk areas

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

**Actually read** the code and check each item.

## MANDATORY SEQUENCE

### 2-1. Migration Safety

| Check | Item | Result |
|-------|------|--------|
| {✅/❌} | Is it reversible? (down migration exists) | {analysis} |
| {✅/❌} | No production data loss? | {analysis} |
| {✅/❌} | DROP COLUMN → 2-phase deployment? (deprecate → remove) | {analysis} |
| {✅/❌} | Default provided when adding NOT NULL column? | {analysis} |

### 2-2. Query Performance

| Check | Item | Result |
|-------|------|--------|
| {✅/❌} | Index on WHERE clause columns? | {analysis} |
| {✅/❌} | N+1 query risk? | {analysis} |
| {✅/❌} | Cursor-based instead of OFFSET? | {analysis} |

### 2-3. Data Integrity

| Check | Item | Result |
|-------|------|--------|
| {✅/❌} | Foreign key constraints set | {analysis} |
| {✅/❌} | ON DELETE/UPDATE policy specified | {analysis} |
| {✅/❌} | Unique constraints (e.g. email) | {analysis} |

### 2-4. Security

| Check | Item | Result |
|-------|------|--------|
| {✅/❌} | Password hashing column | {analysis} |
| {✅/❌} | PII column encryption/masking | {analysis} |
| {✅/❌} | Audit log (created_by, updated_by) | {analysis} |

### 2-5. API Impact

| Check | Item | Result |
|-------|------|--------|
| {✅/❌} | DTO update needed? | {analysis} |
| {✅/❌} | Breaking change? | → Delegate to 01-api-contract |

---

```
## Risk Summary

  ✅ Safe: {n}
  ⚠️ Caution: {n}
  ❌ Fix needed: {n}

{if fix_needed > 0}
  A. Address fix-needed items first → steps-e/step-01
  B. Check rollback plan first → step-03
  C. Record report only

  Candid recommendation: B — deploying without a rollback plan is risky.
{/if}
```


> 🛑 **STOP** — Wait for user input before continuing.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-03-rollback.md`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
