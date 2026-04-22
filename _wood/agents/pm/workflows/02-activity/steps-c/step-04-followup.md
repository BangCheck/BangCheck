---
name: step-04-followup
description: "Pending reply tracking"
nextStepFile: "./step-05-menu.md"
---


# Step 04 — Pending Reply Tracking

READ THIS ENTIRE FILE before executing any action.

---

### 4-1. Query Unanswered Comments Sent by Me

```bash
PM_LOGIN=$(gh api user --jq .login)
SINCE_72H=$(date -u -v-72H +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null \
          || date -u -d '72 hours ago' +"%Y-%m-%dT%H:%M:%SZ")

# Comments sent by PM
gh api "/repos/$REPO/issues/comments?since=$SINCE_72H&per_page=100" \
  --jq ".[] | select(.user.login == \"$PM_LOGIN\") |
        {id, body, issue_url, created_at}"
```

For each comment → check whether a reply has been received on the corresponding issue:
- Check if the mentioned assignee responded within 24h

---

### 4-2. Render

```
## 📮 Comments Awaiting Reply

- [Comment sent on #{n}]({comment_url}) — No response for {days} day(s)
  > "{comment_preview}..."
  Assignee: [{assignee}]({profile})
  [💬 Follow Up] [→ Comment Writing Step 3]

(If none: ✅ All inquiries have been responded to)
```

---

## Completion

After rendering is complete → load `./step-05-menu.md` and follow all instructions.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- GitHub CLI command executed and output displayed
- Output rendered in the exact specified format
- Routed correctly to `./step-05-menu.md`

### ❌ FAILURE
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Rendering with missing or partial data — wait for complete data first
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
