---
name: step-01-impact
description: "PR change-based impact scope analysis"
---


# Validate — Impact Analysis

Pre-analyze impact scope before PR merge. Identify in advance which regression tests will be needed after merge.

### V1-1. PR diff analysis

```bash
gh pr diff {pr_num} --name-only --repo $REPO
```

### V1-2. Impact mapping

```
## 📊 PR #{pr_num} Impact Analysis

| Changed File | Affected Pages | Affected TCs | Severity |
|-------------|---------------|-------------|----------|
{for each changed file:}
| {file} | [#{page}]({url}) | {tc_count} | {🟢/🟡/🔴} |
{/for}

Severity:
  🟢 Low — changes within a specific page
  🟡 Medium — affects multiple pages
  🔴 High — shared component/API changes (global impact)

## Recommended Regression Scope

  Affected pages: {n}
  Estimated TCs: {n}

  A. Run smart regression test after merge → 03-regression steps-c
  B. Notify author of risk before merge
  C. Record report only

  Recommendation: A — Running regression immediately after merge is the most reliable approach.
```


> 🛑 **STOP** — Wait for user input before continuing.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- GitHub CLI command executed and output displayed
- User input received at every STOP gate before proceeding

### ❌ FAILURE
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Skipping a STOP gate and proceeding without user confirmation

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
