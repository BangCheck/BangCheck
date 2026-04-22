---
name: step-01-select
description: "Select target issue for analysis"
nextStepFile: "./step-02-parse.md"
---


# Step 01 — Select Analysis Target

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Select target issue for analysis

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A ROUTER — follow conditions exactly, never guess
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + Branch data
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### 1-1. Selection Menu

```
🔍 Which feature's progress would you like to analyze?

[1] Enter issue number directly (e.g., 5)
[2] Select from active issue list
[3] Page-level comprehensive analysis (page + all sub-issues)
[B] Go back

Number:
```


> 🛑 **STOP** — Wait for user input before continuing.


---

### 1-2. Input A — Issue Number

```bash
gh issue view {N} --repo $REPO \
  --json number,title,body,state,labels,assignees
```

---

### 1-3. Input B — Active Issue List

```bash
gh issue list --repo $REPO \
  --state open --label "상태:진행중" \
  --json number,title,assignees --limit 30
```

Display the list, then wait for number input.

---

### 1-4. Input C — Page Comprehensive

Select a `유형:페이지` issue → automatically include that issue + all sub-issues.

```bash
gh issue list --repo $REPO --label "유형:페이지" --state open \
  --json number,title --limit 20
```

After selection, automatically collect sub-issue list.

---

## Completion

Issue selection complete → save `{selected_issue}` → load `./step-02-parse.md`.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Data parsed into structured format without errors
- GitHub CLI command executed and output displayed
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-02-parse.md`

### ❌ FAILURE
- Empty or malformed response → report exact error, do not continue
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
