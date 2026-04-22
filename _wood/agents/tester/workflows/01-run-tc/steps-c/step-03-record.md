---
name: step-03-record
description: "Record Result (issue body + bug registration)"
nextStepFile: "./step-02-execute.md"
---


# Step 03 — Record Result


## YOUR TASK

Record Result (issue body + bug registration)

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## MANDATORY SEQUENCE

### 3-1. Issue body update

```bash
BODY=$(gh issue view {page_num} --json body --jq .body)
# TC status change: ⬜ → ✅ or ❌ or ⏭️
UPDATED=$(echo "$BODY" | sed "s/| ${TC_ID} |.*| ⬜ |/| ${TC_ID} | ... | ${new_status} |/")

# preview
echo "TC status update:"
echo "  ${TC_ID}: ⬜ → ${new_status}"
echo "[Y] Update  [N] Cancel"
```


> 🛑 **STOP** — Wait for user input before continuing.


```bash
gh issue edit {page_num} --body "$UPDATED" --repo $REPO
```

### 3-2. Bug registration on failure

When ❌ is selected:

```
❌ Failure handling

Registering a bug issue.

Suggested title: "[bug] {page_name} - {tc_name} failed"
[Y] Use as-is  [E] Edit

Reproduction steps: (auto-copied from TC scenario, editable)
  1. {step_1}
  2. {step_2}

Expected result: {from_tc}
Actual result: ___

Error log (if any): ___
```


> 🛑 **STOP** — Wait for user input before continuing.


→ Delegate to `_wood/workflows/02-project/steps-c/case-04-bug.md`
→ Add bug number to TC row: `❌ (#{bug_number})`

### 3-3. Progress update

```bash
# Update bottom of issue body
### 🧪 TC Progress (auto-updated)
  Total {total}: ✅ {pass} · ❌ {fail} · ⏭️ {skip} · ⬜ {unchecked}
  Progress: {pct}%
  Last updated: {date} by {tester}
```

→ Return to step-02 execution loop (next TC).
→ Proceed to step-04 report when all done.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- GitHub CLI command executed and output displayed
- Output rendered in the exact specified format
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-02-execute.md`

### ❌ FAILURE
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Rendering with missing or partial data — wait for complete data first
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
