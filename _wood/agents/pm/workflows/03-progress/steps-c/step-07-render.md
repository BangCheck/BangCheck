---
name: step-07-render
description: "Progress report render"
nextStepFile: "./step-08-share.md"
---


# Step 07 — Report Render

READ THIS ENTIRE FILE before executing any action.

---

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
