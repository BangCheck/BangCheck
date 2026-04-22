---
step: 2
title: "Classify changes"
nextStep: "./step-03-analyze.md"
---

# Step 02 — Classify Changes

Classify each changed file into 3 levels:

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
