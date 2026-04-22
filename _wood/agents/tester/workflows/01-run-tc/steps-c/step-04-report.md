---
step: 4
title: "Session Report + Next Recommendation"
nextStep: null
---

# Step 04 — Session Report

```
🧪 TC Execution Session Complete

Page: [#{n} {title}]({url})

### This Session
  Executed: {count}
  Passed:   {✅_count}
  Failed:   {❌_count}  → Bugs registered: {bug_links}
  Skipped:  {⏭️_count}

### Overall Status
  {total_done}/{total} ({pct}%) complete

### Next Action

{if ❌_count > 0 AND unregistered_bugs > 0}
  A. Register unregistered bugs ({count}) ⭐
  B. Continue next TC
  C. Switch to another page

  Recommendation: A — Failed TCs must be registered as bugs so developers can fix them.

{elif remaining_tc > 0}
  A. Continue next TC ({remaining_tc} remaining) ⭐
  B. Switch to another page
  C. Share progress with PM

  Recommendation: A — Finishing this page's TCs raises overall completion rate.

{elif all_done_this_page}
  🎉 All TCs for this page completed!

  A. Run TCs for another page ({next_page} recommended) ⭐
  B. Share progress with PM
  C. Regression test → 03-regression

  Recommendation: A — {next_page} has {n} unchecked TCs.
  Suggestion: Option B notifies PM and updates sprint progress.
{/if}

  [X] Return to dashboard
```

STOP and WAIT.
