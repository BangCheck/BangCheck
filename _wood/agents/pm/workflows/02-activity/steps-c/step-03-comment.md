---
name: step-03-comment
description: "Comment writing flow"
nextStepFile: "./step-05-menu.md"
---


# Step 03 — Comment Writing Flow

READ THIS ENTIRE FILE before executing any action.


## YOUR TASK

Comment writing flow

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

⚠️ Comments MUST be previewed and confirmed by the user before sending. Auto-sending is prohibited.

---

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + Comments
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### 3-1. Select Target

```
Specify the target issue for the comment:

Enter issue number (e.g., 22):
Or select from the list:
  [1] #{n} {title}
  [2] #{n} {title}
  ...
```


> 🛑 **STOP** — Wait for user input before continuing.


---

### 3-2. Write Message

```
Write a comment on [#{n} {title}].
Auto-mention for assignees: entering {assignee} will be replaced with @{github_login}.

Content:
```


> 🛑 **STOP** — Wait for user input before continuing.


Replace `{assignee}` → `@{github_login}` (based on team-roles.yaml).

---

### 3-3. Preview (MANDATORY)

```
💬 Comment Preview

Target:  [#{n} {title}]({url})
Author:  {USER_NAME}

Content:
---
{composed_message}
---

[Y] Send as-is
[E] Edit
[N] Cancel
```


> 🛑 **STOP** — Wait for user input before continuing.


---

### 3-4. Send (when Y is selected)

```bash
gh issue comment {n} --repo $REPO --body "{composed_message}"
```

```
✅ Comment sent successfully
  [🌐 View Comment]({comment_url})
```

---

### 3-5. Edit / Cancel

- `E` → Return to 3-2 with existing content preserved for re-editing
- `N` → Cancel, navigate to step-05-menu

---

## ❌ Strictly Prohibited

- Auto-sending without preview
- AI arbitrarily modifying user input content
- Adding AI signatures or greetings
- Sending on behalf of another person

---

## Completion

After sending or canceling → load `./step-05-menu.md` and follow all instructions.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- GitHub CLI command executed and output displayed
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-05-menu.md`

### ❌ FAILURE
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
