---
name: pm-doc-sync
description: "Google Drive ↔ GitHub Issues ↔ Google Docs document synchronization"
agent: pm
allowed_roles: [Admin, PM]
nextStep: "./steps-c/step-01-read-drive.md"
stepsCompleted: []
---

<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow — Document Sync

**Goal:** Keep documents ↔ issues ↔ completion records in sync.
**Principle:** Document integration is PM-exclusive. Developers use GitHub only.

## Flow

```
Google Drive (Feature Specification)
    ↓ Step 1: Read
    ↓ Step 2: Compare with GitHub Issues
    ↓ Step 3: Create missing issues (Preview → Confirm)

Completed Development
    ↓ Step 4: Update Google Docs progress
```

| Step | File | Description |
|------|------|-------------|
| 1 | steps-c/step-01-read-drive.md | Read feature specification from Google Drive |
| 2 | steps-c/step-02-diff.md | Compare with GitHub Issues |
| 3 | steps-c/step-03-create-issues.md | Create missing issues |
| 4 | steps-c/step-04-update-docs.md | Update Google Docs completion status |
| 5 | steps-c/step-05-menu.md | Action menu |

Read fully, then load `./steps-c/step-01-read-drive.md` and follow all instructions.
