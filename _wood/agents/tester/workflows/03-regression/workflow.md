---
name: tester-regression
description: "Regression test — auto-select impact scope based on PR merge + re-execute TCs"
agent: tester
allowed_roles: [Admin, Tester, Frontend, Backend]
---

<!-- AI-PROTECTED-FILE v1.0 -->

# Tester Workflow — Regression Test

## Steps

| Step | Mode | File | Content |
|------|------|------|---------|
| 1 | c | steps-c/step-01-scope.md | Regression scope selection (smart/all/custom) |
| 2 | c | steps-c/step-02-run.md | Re-execute TCs for selected scope |
| 3 | c | steps-c/step-03-report.md | Regression report + recommendation |
| 1 | v | steps-v/step-01-impact.md | PR change-based impact scope analysis |

Read fully, then load `./steps-c/step-01-scope.md`.
