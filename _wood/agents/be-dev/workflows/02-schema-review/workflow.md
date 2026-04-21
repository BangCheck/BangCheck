---
name: be-schema-review
description: "DB schema / data model change review + safety check"
agent: be-dev
allowed_roles: [Admin, Backend]
---

<!-- AI-PROTECTED-FILE v1.0 -->

# BE Workflow — Schema Review

**Goal:** Check DB schema changes for safety, performance, integrity, and security, and confirm rollback plan

## Steps

| Step | Mode | File | Description |
|------|------|------|-------------|
| **Create** |
| 1 | c | steps-c/step-01-detect.md | Detect schema change files |
| 2 | c | steps-c/step-02-risk.md | Check 5 risk areas |
| 3 | c | steps-c/step-03-rollback.md | Confirm rollback plan |
| 4 | c | steps-c/step-04-report.md | Report + team sharing + recommendation |
| **Edit** |
| 1 | e | steps-e/step-01-fix-schema.md | Apply fixes for detected issues |
| **Validate** |
| 1 | v | steps-v/step-01-verify-erd.md | Compare ERD document vs actual entities |

Read fully, then load `./steps-c/step-01-detect.md`.
