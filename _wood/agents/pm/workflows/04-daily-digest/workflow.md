---
name: pm-daily-digest
description: "PM Daily Escalation Summary"
agent: pm
allowed_roles: [Admin, PM]
nextStep: "./steps-c/step-01-timewindow.md"
stepsCompleted: []
---

<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow — Daily Digest

**Goal:** Automate PM morning routine — show blocking items, mentions, bugs, stale PRs, and today's focus in one view

| Step | File | Description |
|------|------|-------------|
| 1 | steps-c/step-01-timewindow.md | Set query time window |
| 2 | steps-c/step-02-fetch.md | Collect raw data |
| 3 | steps-c/step-03-escalations.md | Detect escalations |
| 4 | steps-c/step-04-stale-pr.md | Detect stale PRs |
| 5 | steps-c/step-05-focus.md | Today's focus |
| 6 | steps-c/step-06-summary.md | Change summary |
| 7 | steps-c/step-07-render.md | Render full digest |
| 8 | steps-c/step-08-actions.md | Quick actions |

Read fully, then load `./steps-c/step-01-timewindow.md` and follow all instructions.
