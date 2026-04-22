---
name: step-07-render
description: "Progress report render"
nextStepFile: "./step-08-share.md"
---


# Step 07 — Report Render

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Progress report render

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A REPORTER — present data as-is, never add unverified information
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## Render

```
🔍 Progress Analysis: [#{n} {title}]({url})

## Issue Spec
  Checklist: {completed}/{total} ({pct}%)
  Test scenarios: {test_count} specified

## Branch: `{selected_branch}`
  Commits:       {commit_count}
  Last commit:   {time_ago}  {stale_flag}
  Changed files: {file_count}  (+{added} / -{removed} lines)

## AI Estimated Progress: {final_score}%

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + Branch data
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### Rationale
  {icon} Checklist completion: {pct}%
  {icon} Commit activity:      {stale or active}
  {icon} Tests:                {present/absent}
  {icon} TODO markers:         {todo_count} remaining
  {icon} PR status:            {pr_state}

### Checklist Cross-Check
  {icon} {item 1}: {found/not found}
  {icon} {item 2}: {found/not found}
  ...

---
⚠️ This figure is for reference only (estimated accuracy ~70%).
   Final completion judgment is up to the PM/reviewer.

[🌐 Issue]({url})  [🌐 Branch]({compare_url})
```

---

## Icon Criteria

| Condition | Icon |
|-----------|------|
| Checklist ≥80% | ✅ |
| 50~80% | 🟡 |
| <50% | 🔴 |
| Recent commits | ✅ |
| Stale | ⚠️ |
| Tests present | ✅ |
| No tests | 🔴 |
| TODO = 0 | ✅ |
| TODO present | 🟡 |

---

## Completion

After render complete → load `./step-08-share.md`.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Output rendered in the exact specified format
- User explicitly confirmed before commit/push
- Routed correctly to `./step-08-share.md`

### ❌ FAILURE
- Rendering with missing or partial data — wait for complete data first
- Committing or pushing without explicit user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
