---
name: step-01-select
description: "Page Selection + TC Parsing"
nextStepFile: "./step-02-execute.md"
---


# Step 01 — Select Page + Parse TC


## YOUR TASK

Page Selection + TC Parsing

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A ROUTER — follow conditions exactly, never guess
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## MANDATORY SEQUENCE

### 1-1. Page list

```bash
gh issue list --repo $REPO --label "유형:페이지" \
  --state open --json number,title,body --limit 20
```

Parse TC count + status from each page's `### Test Cases` section:

```
Select a page to test:

| # | Page | TCs | ⬜ Unchecked | ❌ Failed | Completion |
|---|------|-----|-------------|----------|------------|
{for each page:}
| {i} | [#{n} {title}]({url}) | {total} | {unchecked} | {failed} | {pct}% |
{/for}

Recommendation: {page with most unchecked or failed} — 
  {if failed > 0} Start with pages that have failed TCs to speed up bug tracking.
  {elif unchecked > 0} Start with the page that has the most unchecked TCs.
  {else} Pages without TCs need TC definition requests sent to the developer first.

Enter number:
```


> 🛑 **STOP** — Wait for user input before continuing.


### 1-2. TC Parsing

Parse TC table from the selected page issue body:

```
## #{n} {title} — TC List

{for each TC:}
  {status_icon} {TC_ID}: {case_name}
    Linked: #{linked_issue}
    {if status == ❌} → bug #{bug_number} {/if}
{/for}

Starting execution from unchecked (⬜) TCs.
```

→ step-02 execution loop.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Data parsed into structured format without errors
- GitHub CLI command executed and output displayed
- Output rendered in the exact specified format
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-02-execute.md`

### ❌ FAILURE
- Empty or malformed response → report exact error, do not continue
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Rendering with missing or partial data — wait for complete data first
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
