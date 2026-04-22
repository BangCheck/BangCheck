---
name: step-01-verify-ui
description: "UI Consistency Verification"
---


# Validate — UI Consistency Verification


## YOUR TASK

UI Consistency Verification

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE AN AUDITOR — report findings accurately, never skip checks
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## MANDATORY SEQUENCE

### V1-1. Design Token Consistency

```bash
# Detect hardcoded Tailwind custom colors
grep -rn "bg-\[#\|text-\[#\|border-\[#" frontend/src/ --include="*.tsx" | head -20

# Hardcoded spacing
grep -rn "p-\[.*px\]\|m-\[.*px\]\|gap-\[.*px\]" frontend/src/ --include="*.tsx" | head -20
```

### V1-2. Korean UI Consistency

```bash
# Search for Korean text (check if hardcoded)
grep -rn '"[가-힣]' frontend/src/components/ --include="*.tsx" | wc -l
# → Check whether separated into i18n or constants file
```

### V1-3. Results

```
## UI Consistency Verification

| Item | Result |
|------|--------|
| Hardcoded colors | {n} instances (recommend using theme) |
| Hardcoded spacing | {n} instances |
| Hardcoded Korean text | {n} instances (recommend separating into constants) |
| Component naming | {PascalCase compliance} |

{if issues > 0}
  A. Clean up now (refactoring)
  B. Separate into a distinct issue
  C. Record report only

  Blunt recommendation: B — Separating feature development from refactoring keeps PR reviews cleaner.
{else}
  ✅ UI consistency looks good
{/if}
```


> 🛑 **STOP** — Wait for user input before continuing.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
