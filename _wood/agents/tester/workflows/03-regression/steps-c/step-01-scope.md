---
step: 1
title: "Regression Scope Selection"
nextStep: "./step-02-run.md"
---

# Step 01 — Scope Selection

```
Select regression test scope:

[1] Single PR — files changed impact area
[2] All pages — key TCs for every page
[3] Smart (recommended) — auto-select based on changes
[4] Custom — specify page numbers directly

{if recent_merged_pr}
Recommendation: 3 — Based on recently merged PR #{pr_num}({title}),
             it's efficient to test only the affected pages.
Note: If shared component changes are included, option 2 (all pages) is safer.
{else}
Recommendation: 2 — If there's no recently merged PR, run key TCs for all pages.
{/if}
```

STOP and WAIT.

### [3] Smart Scope

```bash
# Changed files in recently merged PR
gh pr diff {pr_num} --name-only

# Estimate affected pages
# src/app/login/** → #4 Login page
# src/components/Header/** → all pages (shared)
# src/lib/api/** → all pages with API calls
# backend/src/**Controller** → related FE pages
```

```
## Smart Scope Analysis

PR #{pr_num}: {title}
Changed files: {n}

Affected pages:
{for each affected_page:}
  [#{n} {title}]({url}) — Reason: {reason}
{/for}

Proceed with this scope for regression testing?
[Y] Proceed  [E] Adjust scope  [B] Cancel
```

STOP and WAIT.

→ step-02 execution.
