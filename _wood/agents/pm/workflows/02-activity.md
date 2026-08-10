<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow 02 — Activity & Comments

> **Agent:** PM
> **Purpose:** Answer "What's happening right now?" + enable commenting
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, PM]`
- At least 1 open milestone must exist

---

## Step 1 — Recent Activity Feed (24h)

Query GitHub for activity in the last 24 hours:

```bash
# REPO is set in _core.md § Environment Guard
SINCE_ISO=$(date -u -d '24 hours ago' +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null \
          || date -u -v-24H +"%Y-%m-%dT%H:%M:%SZ")

# Issue comments
gh api "/repos/$REPO/issues/comments?since=$SINCE_ISO&per_page=50" \
  --jq '.[] | {body, user: .user.login, issue_url, created_at, issue: .issue_url}'

# Issue events (label changes, close/reopen, assign)
gh api "/repos/$REPO/issues/events?per_page=100" \
  --jq '.[] | select(.created_at >= "'$SINCE_ISO'") | {event, issue: .issue.number, actor: .actor.login, created_at}'

# Commits on active branches (all feat/fix/refactor branches)
git fetch origin --prune
git for-each-ref --format='%(refname:short)' refs/remotes/origin/feat/ refs/remotes/origin/fix/ \
  | xargs -I{} git log --since="24 hours ago" --format="%h|%an|%ar|%s|{}" {}

# Merged PRs
gh pr list --repo $REPO --state merged \
  --search "merged:>=$SINCE_ISO" \
  --json number,title,author,mergedAt --limit 20
```

### Render

```markdown
## 🔥 Recent 24h Activity

### 💬 Comments ({n})
- [{#N} {issue_title}]({url}) — [{member_name}]({profile})
  > "{comment_preview_first_80_chars}..."
  ({time_ago})

### 💾 Commits ({n})
- [{member_name}]({profile}) — `{commit_subject}` on `{branch}` ({time_ago})

### 📌 Status Changes ({n})
- [{#N} {title}]({url}) — {status before → after} by [{actor}]({profile})

### ✅ Merges ({n})
- [PR #{n} {title}]({url}) by [{author}]({profile}) ({time_ago})
```

### No activity

If all sections empty:
```
⚠️ No team activity in the last 24 hours.
Activity frequency appears low. Consider running a daily standup.
```

---

## Step 2 — Issue-centric View

For each active milestone's issue, aggregate its recent activity:

```bash
for ISSUE_NUM in $SPRINT_ISSUES; do
  # Issue details
  gh issue view $ISSUE_NUM --repo $REPO --json number,title,state,labels,assignees,comments
  
  # Related branch activity (branch name contains issue number)
  git log --since="7 days ago" --format="%h|%ar|%s" --all \
    -- $(git ls-files | head) 2>/dev/null | head -5
  
  # PR linked to this issue (closes #N pattern)
  gh pr list --repo $REPO --search "closes #$ISSUE_NUM" --state all --json number,title,state
done
```

### Render

```markdown
## 📋 In-Progress Issue Activity

### [#5 Login Form UI]({url})
  Assignee: [Woo Jong-ho]({profile})   Status: 🟢 In Progress
  
  Recent:
  💬 "Validation added" — Woo Jong-ho (3 hours ago)
  💾 feat: email validation (2 hours ago)
  
  [🌐 Issue]({url}) **[💬 Write Comment]** (Step 3)

### [#22 DB Schema]({url})
  Assignee: [Park Backend]({profile})   Status: 🔴 Blocking 2 days
  
  Recent:
  💬 "API spec needs to be finalized" — Park Backend (2 days ago)
  ⚠️ No response — PM intervention needed
  
  [🌐 Issue]({url}) **[💬 Request Status Comment]** (Step 3)
```

---

## Step 3 — Comment Flow (with preview)

### 3-1. Select target

User chose `💬 Write Comment` on an issue or from menu.

```
Please specify the comment target:

Method A: Enter issue number
  e.g. 5

Method B: Select from dashboard
  [1] #5 Login Form UI
  [2] #22 DB Schema
  ...

Number:
```

### 3-2. Compose message

```
Write your comment.
(Use {assignee} to auto-mention the assignee)
(End with a blank line)

Input:
```

Example user input:
```
{assignee} please share your progress update.
Are there any blockers?
```

AI replaces `{assignee}` with `@{github_login}` of the issue's first assignee.

### 3-3. Preview (MANDATORY)

Per `_safety.md` § Comment Safety:

```
💬 Comment Preview

Target:   [#22 DB Schema]({url})
Author:   Hong Ye-eun (you)

Content:
---
@Park-Backend please share your progress update.
Are there any blockers?
---

[Y] Send as-is
[E] Edit
[N] Cancel
```

### 3-4. Send (after Y)

```bash
gh issue comment 22 --repo BangCheck/BangCheck --body "..."
```

Return:
```
✅ Comment sent successfully
  [🌐 View comment]({comment_url})
```

### 3-5. Edit (E) or cancel (N)

- `E` → re-show compose prompt with current text pre-filled
- `N` → abort, return to menu

### ❌ Forbidden

- DO NOT auto-send without preview
- DO NOT paraphrase user's input
- DO NOT add AI-generated content (signatures, closing phrases)
- DO NOT send on behalf of someone else (always PM's own voice)

---

## Step 4 — Follow-up Tracking

When user sends a comment that asks a question, track it:

```
📮 Comments Awaiting Reply (sent by me)

- [Comment on #22]({url}) — no response for 2 days
  [💬 Follow up] [✉️ Suggest DM escalation]
```

(Query: my own comments with `?`, no reply from mentioned user within 24h)

---

## Menu

```
[1] Refresh full activity feed     → Step 1
[2] Select issue and write comment → Step 3
[3] Check comments awaiting reply  → Step 4
[B] Return to PM Dashboard
```

---

## ✅ Success Criteria

- Activity feed reflects actual GitHub (last 24h)
- All references clickable
- Comments preview + confirm before send
- User's voice preserved (no AI paraphrase)

## ❌ Failure Criteria

- Fabricating comment content
- Auto-sending
- Showing activity older than 24h in "recent"
- Missing links / icons

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
