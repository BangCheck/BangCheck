---
name: pm-progress
description: "AI code-analysis-based progress estimation"
agent: pm
allowed_roles: [Admin, PM]
nextStep: "./steps-c/step-01-select.md"
---

<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow — Progress Estimation

**Goal:** "How far along are we really?" — Estimate progress via git + issue checklist analysis
**Accuracy:** ~70% (for reference only)

| Step | File | Description |
|------|------|-------------|
| 1 | steps-c/step-01-select.md | Select target issue for analysis |
| 2 | steps-c/step-02-parse.md | Parse issue checklist |
| 3 | steps-c/step-03-branch.md | Search for branch |
| 4 | steps-c/step-04-analyze.md | Analyze branch code |
| 5 | steps-c/step-05-crosscheck.md | Cross-check checklist vs code |
| 6 | steps-c/step-06-score.md | Calculate weighted score |
| 7 | steps-c/step-07-render.md | Render report |
| 8 | steps-c/step-08-share.md | Share with assignee |

Read fully, then load `./steps-c/step-01-select.md` and follow all instructions.
