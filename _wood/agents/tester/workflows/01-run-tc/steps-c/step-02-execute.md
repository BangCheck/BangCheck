---
name: step-02-execute
description: "TC Execution Loop"
nextStepFile: "./step-03-record.md"
---


# Step 02 — TC Execution Loop


## YOUR TASK

TC Execution Loop

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

Execute sequentially starting from unchecked (⬜) TCs. For each TC:

```
▶️ Running: {TC_ID}: {case_name}

Scenario:
  1. {step_1}
  2. {step_2}
  3. {step_3}

Expected result:
  {expected_result}

Select result after execution:
[1] ✅ Pass
[2] ❌ Fail → bug registration flow
[3] ⏭️ Skip (not applicable / not implemented)
[4] ⏸️ Defer (check later)
[D] End session → step-04 report
[B] Back
```


> 🛑 **STOP** — Wait for user input before continuing.


## MANDATORY SEQUENCE

### [1] Pass
Record status as ✅ → next TC.

### [2] Fail
→ step-03 record (includes bug registration flow).

### [3] Skip
```
Skip reason: ___
```
→ Record ⏭️ with reason → next TC.

### [4] Defer
No status change → next TC.

### [D] End Session
→ step-04 report.

---

**Loop: Auto-display next TC if unchecked TCs remain. Proceed to step-04 when all done.**

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-03-record.md`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
