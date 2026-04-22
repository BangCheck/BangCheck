---
name: step-03-comment
description: "Comment writing flow"
nextStepFile: "./step-05-menu.md"
---


# Step 03 — Comment Writing Flow

READ THIS ENTIRE FILE before executing any action.

⚠️ Comments MUST be previewed and confirmed by the user before sending. Auto-sending is prohibited.

---

## 3-1. Select Target

```
Specify the target issue for the comment:

Enter issue number (e.g., 22):
Or select from the list:
  [1] #{n} {title}
  [2] #{n} {title}
  ...
```

STOP and WAIT for user input.

---

## 3-2. Write Message

```
Write a comment on [#{n} {title}].
Auto-mention for assignees: entering {assignee} will be replaced with @{github_login}.

Content:
```

STOP and WAIT for user input.

Replace `{assignee}` → `@{github_login}` (based on team-roles.yaml).

---

## 3-3. Preview (MANDATORY)

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

STOP and WAIT for user input.

---

## 3-4. Send (when Y is selected)

```bash
gh issue comment {n} --repo $REPO --body "{composed_message}"
```

```
✅ Comment sent successfully
  [🌐 View Comment]({comment_url})
```

---

## 3-5. Edit / Cancel

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
