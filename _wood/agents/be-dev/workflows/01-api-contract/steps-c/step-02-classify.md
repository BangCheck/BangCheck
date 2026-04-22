---
name: step-02-classify
description: "Classify changes"
nextStepFile: "./step-03-analyze.md"
---


# Step 02 — Classify Changes


## YOUR TASK

Classify changes

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE AN API ANALYST — present contract as-is, flag breaking changes
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

Classify each changed file into 3 levels:

## MANDATORY SEQUENCE

### 🟢 Additive (backward compatible)

- New endpoint added
- Optional field added to response
- New enum value added (existing values preserved)

→ **No** FE impact. Information sharing only.

### 🟡 Deprecation (advance notice)

- Endpoint marked as deprecated (functionality preserved)
- Field deprecated (still returned)
- Replacement endpoint provided

→ Need to share **migration timeline** with FE team.

### 🔴 Breaking (compatibility broken)

- Endpoint deleted / URL changed
- Response field name/type changed
- Required field added (request)
- Error response format changed

→ **Prior agreement + coordinated deployment plan** with FE team required.

---

## Classification Table

```
## Classification Results

| File | Change Description | Classification | FE Impact |
|------|--------------------|----------------|-----------|
{for each changed file:}
| {file}:{line} | {what changed} | {🟢/🟡/🔴} | {impact description} |
{/for}

Summary: 🟢 {n} · 🟡 {n} · 🔴 {n}
```

→ step-03 analysis.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Output rendered in the exact specified format
- Routed correctly to `./step-03-analyze.md`

### ❌ FAILURE
- Rendering with missing or partial data — wait for complete data first
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
