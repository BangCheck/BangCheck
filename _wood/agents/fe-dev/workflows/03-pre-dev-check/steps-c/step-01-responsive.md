---
name: step-01-responsive
description: "Responsive Check (360px~)"
nextStepFile: "./step-02-a11y.md"
---


# Step 01 — Responsive Check

Check the responsive state of components/pages related to the issue from the code.

### 1-1. Scan Related Files

```bash
# Find related components/pages by issue keyword
grep -rl "{keyword}" frontend/src/components/ frontend/src/app/ --include="*.tsx" | head -10
```

### 1-2. Analyze Tailwind Responsive Classes

```bash
# Check for responsive breakpoint usage
for file in {related_files}; do
  echo "=== $file ==="
  grep -c "sm:\|md:\|lg:\|xl:" "$file" || echo "⚠️ No responsive classes"
  grep -c "w-full\|min-w-\|max-w-" "$file" || echo "⚠️ No width constraint"
done
```

### 1-3. Check Results

```
## Responsive Check — {page/component}

| File | Responsive Classes | Width Constraint | Verdict |
|------|--------------------|-----------------|---------|
{for each file:}
| {file} | {sm/md/lg count} | {w-full/max-w present} | {✅/⚠️/❌} |
{/for}

⚠️ Items to watch:
{for each warning:}
  📁 {file}:{line} — {issue: e.g. fixed width px, no responsive classes}
{/for}

{if warnings > 0}
  A. Reinforce responsiveness before starting development
  B. Fix while developing
  C. Ignore (confirm after design is finalized)

  Blunt recommendation: B — Fixing while developing is most efficient. But verifying 360px minimum is mandatory.
{else}
  ✅ Responsiveness looks good
{/if}
```

→ step-02 accessibility.
