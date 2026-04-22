---
name: step-03-report
description: "Regression Report + Recommendation"
nextStepFile: "null"
---


# Step 03 — Regression Report

```
🧪 Regression Test Complete

## Scope
  {scope_type}: {pages tested}
  {if pr_based} Reference PR: #{pr_num} {/if}

## Results
  Re-executed: {total}
  ✅ Pass: {pass}
  🔴 REGRESSION: {fail}
  ⏭️ Skip: {skip}

{if regression_count > 0}
## 🔴 Regression Details

{for each regression:}
  TC: {TC_ID} — {case_name}
  Page: [#{page_num} {page_title}]({url})
  Suspected cause PR: #{pr_num}
  Bug: #{bug_number}
{/for}

## Recommendations

  A. Comment regression report on PR author ⭐
  B. Notify PM of regression (blocking decision)
  C. Return to dashboard

  Recommendation: A — The PR author can fix regressions fastest.
  Suggestion: If {fail} > 3, also do B — PM may need to adjust release schedule.

{else}
  ✅ No regressions! All existing TCs still pass.

  A. Notify PM of regression test pass
  B. Return to dashboard

  Recommendation: B — No regressions means no need to notify. PR is safe to merge.
{/if}
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
