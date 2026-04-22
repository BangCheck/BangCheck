---
name: step-01-edit-issue
description: "Edit Issue"
---


# Edit Step 01 — Edit Existing Issue

> Modify tracking info, assignee, API contract, and body of an already-created issue.

---

### E1-1. Select Edit Target

```
Select the issue to edit:

[1] Enter issue number directly
[2] Select from recently created issues
[3] Select from issues by specification screen

Select:
```


> 🛑 **STOP** — Wait for user input before continuing.


---

### E1-2. Load Current Issue

```bash
gh issue view {number} --repo $REPO \
  --json number,title,body,labels,assignees,milestone
```

Display current state:
```
📋 Issue #{number} Current State

Title:     {title}
Assignee:  {assignees}
Labels:    {labels}
Sprint:    {milestone}

Tracking info:
  Spec reference: {show if exists / "❌ Missing"}
  WBS ID:         {show if exists / "❌ Missing"}
  Parent:         {show if exists / "❌ Missing"}
  Role:           {show if exists / "❌ Missing"}
  API Contract:   {show if exists / "❌ Missing"}
```

---

### E1-3. Edit Menu

```
What would you like to modify?

[T] Title
[A] Change assignee → Uses assign-recommend engine
[L] Add/remove labels
[M] Change sprint (milestone)
[K] Enhance tracking info (WBS, Parent, spec reference)
[C] Add/edit API contract (BE issues)
[B] Edit full body
[R] Done → Return to dashboard

Select:
```


> 🛑 **STOP** — Wait for user input before continuing.


---

### E1-4. Enhance Tracking Info [K]

When an existing issue is missing tracking keys:

```
Current tracking info:
  WBS ID: {current value or "None"}
  Parent: {current value or "None"}

Items to enhance:
[W] Enter WBS ID
[P] Link parent issue (select from page issue list)
[S] Link specification screen code
[A] All at once

Select:
```

After input → Update issue body:
```bash
# Add/modify ### Tracking Info section in existing body
gh issue edit {number} --repo $REPO --body "{updated_body}"
```

---

### E1-5. Add/Edit API Contract [C]

```
Enter the API contract:

Endpoint (e.g., POST /api/auth/login):
Request (e.g., { email, password }):
Response (e.g., { accessToken, refreshToken }):
Authentication (required/not required):
```

After input → Update body with the API contract section format from issue-task-be.template.md.

If there is an FE integration issue:
```
🔗 Notify FE integration issue #{fe_issue} about the API change? [Y/N]
```

---

## 🔙 Return

After editing → Return to step-05-menu.md or PM dashboard.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- GitHub CLI command executed and output displayed
- User input received at every STOP gate before proceeding
- Template filled completely with no placeholder variables remaining

### ❌ FAILURE
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Skipping a STOP gate and proceeding without user confirmation
- Leaving unfilled `{placeholder}` variables in the output

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
