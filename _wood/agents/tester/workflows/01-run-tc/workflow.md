---
name: tester-run-tc
description: "Sequentially execute TCs for a page issue and record results"
agent: tester
allowed_roles: [Admin, Tester, Frontend, Backend]
---

<!-- AI-PROTECTED-FILE v1.0 -->

# Tester Workflow — Run Test Cases

**Goal:** Sequential TC execution → record results (update issue body) → register bugs on failure → session report

## Steps

| Step | Mode | File | Content |
|------|------|------|---------|
| **Create (steps-c)** |
| 1 | c | steps-c/step-01-select.md | Page selection + TC parsing |
| 2 | c | steps-c/step-02-execute.md | TC execution loop + result input |
| 3 | c | steps-c/step-03-record.md | Record results (issue body + bug registration) |
| 4 | c | steps-c/step-04-report.md | Session report + next recommendation |
| **Edit (steps-e)** |
| 1 | e | steps-e/step-01-retest.md | TC result edit (retest) |
| **Validate (steps-v)** |
| 1 | v | steps-v/step-01-coverage.md | TC coverage validation |

Read fully, then load `./steps-c/step-01-select.md`.
