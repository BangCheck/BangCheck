---
name: step-01-detect
description: "Detect API-related file changes"
nextStepFile: "./step-02-classify.md"
---


# Step 01 — Detect API Changes


## YOUR TASK

Detect API-related file changes

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE AN AUDITOR — report findings accurately, never skip checks
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

```bash
# Detect API-related file changes
API_FILES=$(git diff --name-only main..HEAD | grep -E '(Controller|Route|endpoint|api|handler|DTO|dto)')

# Spring Boot patterns
SPRING_FILES=$(git diff --name-only main..HEAD | grep -E '(Controller\.java|Service\.java|Repository\.java)')

# OpenAPI/Swagger
SPEC_FILES=$(git diff main..HEAD --name-only -- '**/*.yaml' '**/*.yml' '**/openapi*' '**/swagger*')

TOTAL=$(echo "$API_FILES $SPRING_FILES $SPEC_FILES" | tr ' ' '\n' | sort -u | wc -l)
```

## MANDATORY SEQUENCE

### Detection Results

```
## API Change Detection — {branch}

| File Type | Count | Impact |
|-----------|-------|--------|
| Controller / Route | {n} | endpoint added/modified/deleted |
| DTO / Model | {n} | request/response structure changed |
| Schema (DB) | {n} | indirect impact |
| OpenAPI spec | {n} | official contract changed |

Total {TOTAL} API-related files changed

{if TOTAL == 0}
  ✅ No API-related changes. Check complete.
  [B] Return to dashboard
{else}
  → Proceed to classification
{/if}
```

If TOTAL == 0, STOP. Otherwise → step-02.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-02-classify.md`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
