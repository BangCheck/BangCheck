---
step: 1
title: "Select target issue for analysis"
nextStep: "./step-02-parse.md"
---

# Step 01 — Select Analysis Target

READ THIS ENTIRE FILE before executing any action.

---

## 1-1. Selection Menu

```
🔍 Which feature's progress would you like to analyze?

[1] Enter issue number directly (e.g., 5)
[2] Select from active issue list
[3] Page-level comprehensive analysis (page + all sub-issues)
[B] Go back

Number:
```

STOP and WAIT for user input.

---

## 1-2. Input A — Issue Number

```bash
gh issue view {N} --repo $REPO \
  --json number,title,body,state,labels,assignees
```

---

## 1-3. Input B — Active Issue List

```bash
gh issue list --repo $REPO \
  --state open --label "상태:진행중" \
  --json number,title,assignees --limit 30
```

Display the list, then wait for number input.

---

## 1-4. Input C — Page Comprehensive

Select a `유형:페이지` issue → automatically include that issue + all sub-issues.

```bash
gh issue list --repo $REPO --label "유형:페이지" --state open \
  --json number,title --limit 20
```

After selection, automatically collect sub-issue list.

---

## Completion

Issue selection complete → save `{selected_issue}` → load `./step-02-parse.md`.
