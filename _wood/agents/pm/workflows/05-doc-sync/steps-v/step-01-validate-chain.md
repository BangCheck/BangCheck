---
name: step-01-validate-chain
description: "Specification → Issue Chain Validation"
---


# Validate Step 01 — Specification ↔ Issue Chain Validation


## YOUR TASK

Specification → Issue Chain Validation

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE AN AUDITOR — report findings accurately, never skip checks
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

> Validate that the tracking keys in the Specification → PM → Issue → Backend chain are not broken.

---

## CONTEXT BOUNDARIES

- Data sources: Google Sheets MCP (시트22) + GitHub Issues API
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### V1-1. Collect All Issues

```bash
# All task issues
ALL_TASKS=$(gh issue list --repo $REPO --state all \
  --label "유형:작업" \
  --json number,title,body,labels,assignees,milestone --limit 200)

# All page issues
ALL_PAGES=$(gh issue list --repo $REPO --state all \
  --label "유형:페이지" \
  --json number,title,body --limit 50)
```

---

### V1-2. Tracking Key Validation

Parse each task issue's body to check tracking key presence:

```
## 📊 Tracking Key Validation Results

| Issue | WBS ID | Parent | Role | API Contract (BE) | Verdict |
|-------|--------|--------|------|-------------------|---------|
{for each task issue:}
| #{n} {title} | {Present/❌} | {Present/❌} | {Present/❌} | {Present/N/A/❌} | {✅/⚠️/🔴} |
{/for}

Verdict criteria:
  ✅ = All required keys present
  ⚠️ = 1–2 missing (can be enhanced)
  🔴 = Both Parent + WBS missing (orphan issue)
```

---

### V1-3. Orphan Issue Detection

Issues with no Parent, no WBS, and no related issue links:

```
{if orphan_count > 0}
🔴 {orphan_count} orphan issue(s) — Not linked to any specification/page

{for each orphan:}
  #{n} {title}  [Go to issue]({url})
    Labels: {labels}
    Created: {created}
{/for}

What would you like to do?
  A. Enhance tracking info for orphan issues → steps-e/step-01-edit-issue.md
  B. Re-compare with specification → steps-c/step-02-diff.md
  C. Save report only and move on

  Recommended: A — Untracked issues are excluded from sprint progress.
{else}
✅ No orphan issues — All tasks are linked to a page/specification.
{/if}
```

---

### V1-4. FE↔BE Integration Validation

Check whether issue pairs created as Both are cross-linked:

```
{if unlinked_pairs > 0}
⚠️ {unlinked_pairs} unlinked FE↔BE pair(s)

| FE Issue | BE Issue | Status |
|----------|----------|--------|
| #{fe_n} {fe_title} | #{be_n} {be_title} | ❌ No cross-link |

  A. Automatically add cross-links
  B. Review one by one
  
  Recommended: A
{/if}
```

---

### V1-5. BE API Contract Validation

BE-labeled issues missing an API contract section:

```
{if be_no_api_count > 0}
⚠️ {be_no_api_count} BE issue(s) missing API contract

| Issue | Assignee | Status |
|-------|----------|--------|
| #{n} {title} | {assignee} | API Contract ❌ |

  A. PM adds a draft → steps-e/step-01-edit-issue.md [C]
  B. Leave a comment asking the BE developer to fill it in
  C. Save report only

  Recommended: B — It is more accurate when the BE developer finalizes during implementation.
{/if}
```

---

### V1-6. Validation Summary

```
## 📋 Chain Validation Summary

| Item | Result | Count |
|------|--------|-------|
| Total task issues | {total} | |
| Tracking complete (✅) | {complete_count} | {pct}% |
| Enhancement needed (⚠️) | {warn_count} | |
| Orphan issues (🔴) | {orphan_count} | |
| Unlinked FE↔BE | {unlinked_pairs} | |
| BE missing API | {be_no_api_count} | |

{if all_clear}
✅ Chain validation passed! Specification → Issue → Backend tracking is healthy.
{else}
Next actions:
  A. Start fixing flagged items
  B. Return to PM dashboard
{/if}
```

---

## 🔙 Return

After validation → Return to step-05-menu.md or PM dashboard.

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Data parsed into structured format without errors
- GitHub CLI command executed and output displayed

### ❌ FAILURE
- Empty or malformed response → report exact error, do not continue
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
