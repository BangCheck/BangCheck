<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Tester Workflow 03 — Regression Test

> **Agent:** Tester
> **Purpose:** Verify that new changes have not broken existing functionality
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, Tester]`
- A PR to verify or deployment immediately after merge exists

---

## 🎯 When to use

- Just before PR merge (QA gate)
- Final verification before release
- After a large refactor

---

## Step 1 — Scope Selection

```
Select regression test scope:

[1] Single PR — files changed impact area
[2] All pages — key TCs for every page
[3] Smart (recommended) — auto-select based on changes
[4] Custom — specify page numbers directly
```

### Smart scope logic

```bash
# Changed files in PR
gh pr diff {pr_num} --name-only

# Estimate affected pages
# - src/app/login/** → #4 Login page
# - src/components/Header/** → all pages (shared)
# - src/lib/api/** → all pages with API calls
```

→ Suggest list of affected pages (confirm with user before finalizing).

---

## Step 2 — Collect TC Set

Select only **critical** TCs from each target page:

### Critical criteria

- ✅ Happy path TCs (mandatory)
- ❌ Exception handling TCs
- 🔐 Auth/permissions TCs
- 📱 Mobile display TCs

Excluded:
- Detailed accessibility TCs (separate cycle)
- Edge case TCs (not sprint QA)

```markdown
## Regression Test Plan

Target pages: 3
  [#4 Login Page] — 6 critical TCs
  [#9 Landing Page] — 3 critical TCs
  [#10 Map Page] — 5 critical TCs

Total 14 TCs to execute.
Estimated time: ~{n} minutes

[Y] Start  [E] Edit TCs  [N] Cancel
```

---

## Step 3 — Execution

Execution is similar to `01-run-tc.md` but with **regression mode tag**:

```
[REGRESSION] TC-LOGIN-01: Email format validation
(Previous result: ✅, re-executing now)

...

Result:
[1] ✅ Pass (same as before)
[2] ❌ Fail (REGRESSION — newly broken)
[3] 🟡 Intermittent (flaky — retry needed)
```

### Option 2 REGRESSION failure handling

Immediately register bug with high severity:

```markdown
🚨 Regression Detected

TC-LOGIN-01 previously passed → now failing
Recent possibly relevant change: PR #{n}

Suggested bug issue:
  Title: "[regression] Login email format validation failed"
  Labels: 유형:버그, 순위:최상 (regression)
  Body:
    - Previous pass history
    - Current failure symptoms
    - Suspected cause PR

[Y] Register as-is (→ 02-project.md Case 4)
[E] Edit
[N] Cancel
```

---

## Step 4 — Report

```markdown
🧪 Regression Test Report

Scope: {scope}
Executed: {total} TCs

### Results
  ✅ Pass:     {count}
  ❌ Fail:     {count} 🚨
  🟡 Flaky:   {count}
  ⏭️ Skip:    {count}

### Regressions Detected ({count})
  - TC-LOGIN-01 (#{bug_n}) — estimated related to PR #{pr_n}
  - ...

### Verdict
  {icon} {overall_message}

  e.g., "🚨 2 regressions — PR merge not recommended. Owner verification needed."
  e.g., "✅ All passed — no regressions. Safe to merge."

### PR Comment Suggestion

Share regression results with the owner:

💬 Preview:
---
@{pr_author} Sharing regression test results:

✅ 12/14 passed
❌ 2 regressions:
  - TC-LOGIN-01 failed (#{bug_n})
  - TC-MAP-03 failed (#{bug_n})

Please verify before merging.
---

[Y] Send [E] Edit [N] Cancel
(_safety.md § Comment Safety applies)
```

---

## Step 5 — Historical Trend (optional)

Track regression history for the same page:

```
📊 [#4 Login Page] Regression History

| Date | Pass rate | Regressions | Related PR |
|------|-----------|-------------|------------|
| 2026-04-16 | 86% | 2 | PR #13 |
| 2026-04-10 | 100% | 0 | - |
| 2026-04-05 | 100% | 0 | - |
```

→ Identify areas with recurring regressions → suggest training/refactoring to PM.

---

## ✅ Success Criteria

- Execute only critical TCs (time efficiency)
- Immediately register regressions as bugs
- Share results with PR author (after preview)

## ❌ Failure Criteria

- Indiscriminate execution of all TCs (sprint delay)
- Ignoring regressions
- Auto PR block (out of scope — comment only)

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
