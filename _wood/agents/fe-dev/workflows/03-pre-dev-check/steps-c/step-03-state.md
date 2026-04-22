---
name: step-03-state
description: "State Management Pattern Check"
nextStepFile: "null"
---


# Step 03 — State Management Check

### 3-1. State Management Pattern Scan

```bash
# TanStack Query usage
grep -rl "useQuery\|useMutation\|QueryClient" frontend/src/ --include="*.tsx" --include="*.ts" | wc -l

# React Context
grep -rl "createContext\|useContext" frontend/src/ --include="*.tsx" --include="*.ts" | wc -l

# Zustand / Redux
grep -rl "zustand\|useStore\|createStore\|useSelector" frontend/src/ --include="*.tsx" --include="*.ts" | wc -l

# useState overuse (warn if more than 10)
for file in {related_files}; do
  count=$(grep -c "useState" "$file")
  [ "$count" -gt 5 ] && echo "⚠️ $file: useState $count times — consider splitting"
done
```

### 3-2. Data Flow in Related Files

```
## State Management Overview

| Pattern | Usage Count | Related Files |
|---------|-------------|---------------|
| TanStack Query | {n} | {files} |
| React Context | {n} | {files} |
| Zustand/Redux | {n} | {files} |
| Local useState | {n} | {files} |

Recommended pattern for this issue:

{if api_call_needed}
  → TanStack Query (server state management)
  Reason: Issue involves API calls. Caching/revalidation is automatic.
{elif shared_state}
  → Context or Zustand (client state)
  Reason: State shared across multiple components.
{else}
  → useState (local state)
  Reason: State contained within a single component.
{/if}
```

### 3-3. Final Recommendation

```
## Pre-Dev Check Complete

  Responsive:      {✅/⚠️}
  Accessibility:   {✅/⚠️}
  State management: {recommended pattern}

  A. Start development → 03-dev-start/workflow.md ⭐
  B. Refactor existing components first
  C. Return to dashboard

  Blunt recommendation: A — Check complete. Address ⚠️ items as you develop.
```


> 🛑 **STOP** — Wait for user input before continuing.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `null`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
