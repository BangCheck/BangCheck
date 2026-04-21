---
name: be-api-contract
description: "API change detection → classification → FE sharing → contract update"
agent: be-dev
allowed_roles: [Admin, Backend]
---

<!-- AI-PROTECTED-FILE v1.0 -->

# BE Workflow — API Contract Check

**Goal:** Verify that API changes match FE expectations + detect breaking changes + sync issues/docs

## Step-File Architecture

| Step | Mode | File | Description |
|------|------|------|-------------|
| **Create (steps-c)** |
| 1 | c | steps-c/step-01-detect.md | Detect API-related file changes |
| 2 | c | steps-c/step-02-classify.md | Classify changes (Additive/Deprecation/Breaking) |
| 3 | c | steps-c/step-03-analyze.md | Diff analysis + impact table |
| 4 | c | steps-c/step-04-communicate.md | Write FE comment + update spec |
| 5 | c | steps-c/step-05-report.md | Final report + next recommendation |
| **Edit (steps-e)** |
| 1 | e | steps-e/step-01-update-contract.md | Update issue body API contract + notify FE |
| **Validate (steps-v)** |
| 1 | v | steps-v/step-01-verify.md | Compare issue API contract vs actual code |

## Initialization

Read fully, then load `./steps-c/step-01-detect.md`.
