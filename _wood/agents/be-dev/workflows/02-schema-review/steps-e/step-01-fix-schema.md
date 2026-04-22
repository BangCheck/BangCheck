---
name: step-01-fix-schema
description: "Apply fixes for detected issues"
---


# Edit — Fix Schema Issues

Address items flagged as ❌ fix needed in the risk check.

## E1-1. Fix Target List

```
## Items Needing Fix

{for each fix_needed:}
  {i}. {file}:{line} — {problem}
     Suggestion: {suggestion}
{/for}

Which item to fix first?

[A] All in order
[number] Specific item only
[B] Return to dashboard
```

STOP and WAIT.

## E1-2. Fix Guidance

For each item:

```
## Fix — {problem}

Current code:
  📁 {file}:{line}
  {code snippet}

Fix approach:
  {concrete fix with A/B/C/D}

  A. {minimal fix} — {description}
  B. {recommended fix} — {description}
  C. Skip

  Candid recommendation: {letter} — {reason}
```

STOP and WAIT. Proceed to next item after selection.

## E1-3. Completion

```
✅ Schema fixes complete

  Fixed: {n}
  Skipped: {n}

  A. Re-run schema review (verify fixes) → steps-c/step-01
  B. Return to dashboard

  Candid recommendation: A — running it again after fixes ensures everything is safe.
```
