---
name: dev-start
description: "Dev entry — Issue identification → Code reading → Fact check → Story creation → Development → Completion sync"
allowed_roles: [Admin, Frontend, Backend]
nextStep: "./steps-c/step-01-issue.md"
stepsCompleted: []
---

<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Common Workflow — Dev Start

**Goal:** Upon receiving an issue, read the code directly, assess the current state, create a Story, then develop → complete → sync.

**SSOT:** GitHub Issue is the source of truth for progress. workspace/stories is a supplementary detail store.

## Step-File Architecture

- **Just-In-Time Loading**: Load only the current step file. Load the next step only when instructed.
- **Sequential Enforcement**: Skipping steps is prohibited.
- **00-elicit gate**: If `00-elicit.md` has already been completed, enter Step 1 directly. Otherwise, run `00-elicit.md` first.

## Steps

| Step | File | Description |
|------|------|-------------|
| 1 | steps-c/step-01-issue.md | Issue load + API contract parsing + checklist status |
| 2 | steps-c/step-02-read.md | Code reading (FE/BE branch) |
| 3 | steps-c/step-03-fact.md | Fact check table output |
| 4 | steps-c/step-04-story.md | Story creation → save to workspace/stories |
| 5 | steps-c/step-05-branch.md | Branch creation + issue status update |
| 6 | steps-c/step-06-dev.md | Development guide + code recommendations |
| 7 | steps-c/step-07-sync.md | Completion sync (issue checklist + Story status + FE↔BE comments) |

## Initialization

Read fully, then load `./steps-c/step-01-issue.md` and follow all instructions within it.
