---
name: step-05-report
description: "Final report + next recommendation"
nextStepFile: "null"
---


# Step 05 — Report

```
🔍 API Contract Check — {branch}

## Change Summary
  🟢 Additive:     {n}
  🟡 Deprecation:  {n}
  🔴 Breaking:     {n}

## Actions Completed
  FE comment: {sent / not sent}
  Spec update: {done / deferred}

## Next Recommendation

  A. Add API changes section to PR body → 05-pr.md
  B. Also run schema review → 02-schema-review
  C. Return to dashboard

  Candid recommendation: A — stating API changes in the PR helps reviewers understand quickly.
  Suggestion: if there were breaking changes, also B — DB schema and API may have changed together.
```


> 🛑 **STOP** — Wait for user input before continuing.


→ After selection, load the corresponding workflow or return to dashboard.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `null`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
