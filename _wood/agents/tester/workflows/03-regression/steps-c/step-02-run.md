---
name: step-02-run
description: "Re-execute TCs for selected scope"
nextStepFile: "./step-03-report.md"
---


# Step 02 — Run Regression TCs

Re-execute **already passed (✅) TCs** for selected pages.

### 2-1. Extract target TCs

```
## Regression Test Targets

{for each affected_page:}
### [#{n} {title}]({url}) — ✅ {count} TCs

{for each passed_tc:}
  ✅ {TC_ID}: {case_name}
{/for}
{/for}

Total {total_regression_tcs} to re-execute.
[Y] Start  [S] Select subset  [B] Cancel
```


> 🛑 **STOP** — Wait for user input before continuing.


### 2-2. Execution loop

Same approach as 01-run-tc/steps-c/step-02-execute.md:

```
▶️ Regression test: {TC_ID}: {case_name}
   Previous result: ✅ Pass

{scenario}

Result:
[1] ✅ Still passing (no regression)
[2] ❌ Fail (REGRESSION DETECTED!)
[3] ⏭️ Skip
[D] End session
```

### [2] Regression failure

```
🔴 REGRESSION DETECTED!

  TC: {TC_ID} — previously ✅ → now ❌
  Suspected cause PR: #{pr_num}

  A. Register bug + notify PR author ⭐
  B. Register bug only
  C. Record only (later)

  Recommendation: A — Regression is likely caused by recent changes.
             Notifying the author immediately speeds up the hotfix.
```


> 🛑 **STOP** — Wait for user input before continuing.


→ Proceed to step-03 report when all TCs complete.
