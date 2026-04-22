---
name: pm-project-view
description: "SWYP project status — milestone · page · task hierarchy tree view"
agent: pm
allowed_roles: [Admin, PM]
nextStep: "./steps-c/step-01-load.md"
---

<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow — Project View

**Goal:** Grasp the milestone → page → task structure at a glance.

## Step-File Architecture

- **Just-In-Time Loading**: Only the current step file is loaded into memory. The next step is loaded only when instructed.
- **Sequential Enforcement**: Skipping steps is prohibited.
- **Wait at menus**: Always wait for user input when a menu is displayed.

## Steps

| Step | File | Description |
|------|------|-------------|
| 1 | steps-c/step-01-load.md | Collect GitHub data |
| 2 | steps-c/step-02-build.md | Build tree structure |
| 3 | steps-c/step-03-render.md | Render tree + summary |
| 4 | steps-c/step-04-filter.md | Filter / zoom |
| 5 | steps-c/step-05-actions.md | Next action menu |

## Initialization

Read fully, then load `./steps-c/step-01-load.md` and follow all instructions within it.
