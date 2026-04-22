---
name: step-01-fetch
description: "Collect and render 24h activity data"
nextStepFile: "./step-05-menu.md"
---


# Step 01 — Collect 24h Activity Data

READ THIS ENTIRE FILE before executing any action.

---

### 1-1. Set Time Baseline

```bash
SINCE_ISO=$(date -u -v-24H +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null \
          || date -u -d '24 hours ago' +"%Y-%m-%dT%H:%M:%SZ")
```

---

### 1-2. Collect Data (Parallel)

```bash
# Issue comments
gh api "/repos/$REPO/issues/comments?since=$SINCE_ISO&per_page=50" \
  --jq '.[] | {body, user: .user.login, issue_url, created_at}'

# Issue events (label changes, close, assignment)
gh api "/repos/$REPO/issues/events?per_page=100" \
  --jq '.[] | select(.created_at >= "'$SINCE_ISO'") |
        {event, issue: .issue.number, actor: .actor.login, created_at}'

# Active branch commits
git fetch origin --prune
git for-each-ref --format='%(refname:short)' refs/remotes/origin/feat/ refs/remotes/origin/fix/ \
  | xargs -I{} git log --since="24 hours ago" --format="%h|%an|%ar|%s|{}" {}

# Merged PRs
gh pr list --repo $REPO --state merged \
  --search "merged:>=$SINCE_ISO" \
  --json number,title,author,mergedAt --limit 20
```

---

### 1-3. Render

```
## 🔥 Last 24 Hours Activity

### 💬 Comments ({n} items)
- [#{N} {issue_title}]({url}) — [{member}]({profile})
  > "{comment_preview 80 chars}..."  ({time_ago})

### 💾 Commits ({n} items)
- [{member}]({profile}) — `{commit_subject}` on `{branch}` ({time_ago})

### 📌 Status Changes ({n} items)
- [#{N} {title}]({url}) — {before} → {after}  by [{actor}]({profile})

### ✅ Merges ({n} items)
- [PR #{n} {title}]({url}) by [{author}]({profile}) ({time_ago})
```

If all sections are empty:
```
⚠️ No team activity in the last 24 hours.
Consider running a daily standup.
```

---

## Completion

After rendering is complete → load `./step-05-menu.md` and follow all instructions.
