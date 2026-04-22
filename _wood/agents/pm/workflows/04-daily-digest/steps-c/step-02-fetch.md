---
name: step-02-fetch
description: "Collect Raw Data"
nextStepFile: "./step-03-escalations.md"
---


# Step 02 — Collect Raw Data

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Collect Raw Data

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A DATA READER — report exact API/MCP response, never fabricate
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + recent activity
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### 2-1. Parallel Collection

```bash
# A. New issues
gh issue list --repo $REPO --state open \
  --search "created:>=$SINCE_ISO" \
  --json number,title,labels,assignees,createdAt,user --limit 50

# B. Issue comments
gh api "/repos/$REPO/issues/comments?since=$SINCE_ISO&per_page=100" \
  --jq '.[] | {issue_url, body, user: .user.login, created_at}'

# C. Label change events
gh api "/repos/$REPO/issues/events?per_page=100" \
  --jq '.[] | select(.created_at >= "'$SINCE_ISO'") |
        select(.event == "labeled" or .event == "unlabeled") |
        {issue: .issue.number, event, label: .label.name, actor: .actor.login, created_at}'

# D. PR changes
gh pr list --repo $REPO --state all \
  --search "updated:>=$SINCE_ISO" \
  --json number,title,author,state,createdAt,updatedAt,reviews --limit 50

# E. Developer commits
git fetch origin --prune
git for-each-ref --format='%(refname:short)' refs/remotes/origin/ \
  | xargs -I{} git log --since="$SINCE_ISO" --format="%h|%an|%ar|%s|{}" {} 2>/dev/null
```

---

## Completion

Collection complete → load `./step-03-escalations.md`.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- GitHub CLI command executed and output displayed
- User explicitly confirmed before commit/push
- Routed correctly to `./step-03-escalations.md`

### ❌ FAILURE
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Committing or pushing without explicit user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
