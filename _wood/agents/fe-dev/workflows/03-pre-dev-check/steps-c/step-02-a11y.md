---
name: step-02-a11y
description: "Accessibility Check"
nextStepFile: "./step-03-state.md"
---


# Step 02 — Accessibility Check


## YOUR TASK

Accessibility Check

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## MANDATORY SEQUENCE

### 2-1. Basic Accessibility Scan

```bash
for file in {related_files}; do
  echo "=== $file ==="
  # aria-label usage
  grep -c "aria-label\|aria-" "$file" || echo "⚠️ No aria attributes"
  # role attribute
  grep -c 'role="' "$file" || echo "⚠️ No role attribute"
  # tabIndex
  grep -c "tabIndex\|tabindex" "$file" || echo "⚠️ No tabIndex"
  # semantic tags
  grep -c "<main\|<nav\|<header\|<footer\|<section\|<article" "$file"
  # img alt
  grep -c '<img' "$file" && grep -c 'alt=' "$file"
done
```

### 2-2. Check Results

```
## Accessibility Check

| Item | Status |
|------|--------|
| aria-label | {n} used / ⚠️ insufficient |
| Keyboard navigation | {tabIndex present/absent} |
| Semantic tags | {in use / div overused} |
| Image alt | {all present / {n} missing} |
| Touch target (44px) | {needs verification} |

{if issues > 0}
  A. Reinforce accessibility before starting development
  B. Fix while developing (recommended)
  C. Separate into a distinct issue

  Blunt recommendation: B — Adding accessibility from the start when writing new components is easier than fixing it later.
{else}
  ✅ Accessibility looks good
{/if}
```

→ step-03 state management.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Routed correctly to `./step-03-state.md`

### ❌ FAILURE
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
