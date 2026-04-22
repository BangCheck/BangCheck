<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow 04 — Daily Digest

> **Agent:** PM
> **Purpose:** Review all issues/PRs/escalations to check every morning at a glance
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, PM]`
- Default time window: last 24 hours (configurable)

---

## 🎯 What this workflow does

Automates the **PM's morning routine**:

1. Collect **new issues/PRs/comments** from the last 24 hours
2. Detect **PM escalations** (blocking, @PM mentions, new bugs)
3. Filter **stale review** PRs
4. Identify **due today** items (상태:리뷰 or PR merge imminent)
5. **Summarize changes** by category

---

## Step 1 — Time Window

Default 24 hours. To change:

```
Enter query period:
[1] Since yesterday (24h, default)
[2] Last 3 days
[3] Last week
[4] Custom (enter date)
```

Save to `SINCE` variable in ISO 8601 format.

---

## Step 2 — Fetch Raw Data

```bash
# REPO is set from _core.md § Environment Guard

# A. New issues
gh issue list --repo $REPO --state open \
  --search "created:>=$SINCE" \
  --json number,title,labels,assignees,createdAt,user --limit 50

# B. Recent issue comments
gh api "/repos/$REPO/issues/comments?since=$SINCE&per_page=100" \
  --jq '.[] | {issue_url, body, user: .user.login, created_at}'

# C. Label change events (to capture 상태:블로킹)
gh api "/repos/$REPO/issues/events?per_page=100" \
  --jq '.[] | select(.created_at >= "'$SINCE'") |
         select(.event == "labeled" or .event == "unlabeled") |
         {issue: .issue.number, event, label: .label.name, actor: .actor.login, created_at}'

# D. New / updated PRs
gh pr list --repo $REPO --state all \
  --search "updated:>=$SINCE" \
  --json number,title,author,state,createdAt,updatedAt,reviews --limit 50

# E. New commits (developer activity)
git fetch origin --prune
git for-each-ref --format='%(refname:short)' refs/remotes/origin/ \
  | xargs -I{} git log --since="$SINCE_AGO" --format="%h|%an|%ar|%s|{}" {} 2>/dev/null
```

---

## Step 3 — Detect Escalations

### 3-1. Blocking Declarations (label added)

Events where `event=="labeled"` AND `label=="상태:블로킹"` → blocking detected

```markdown
🚫 **New Blocking ({count} items)**
- [#{n} {title}]({url}) — blocking declared by [{actor}]({profile}) ({time_ago})
  💬 Latest comment: "{preview}"
  [🌐 Issue]({url}) [💬 Ask for reason]
```

### 3-2. PM Mentions

Comments containing `@{PM_login}` in body → PM mention

```markdown
📢 **PM Mentions ({count} items)**
- [{member}]({profile}) mentioned in [#{n} {title}]({url})
  > "@{PM_login} please check this part..."
  [🌐 Comment]({comment_url}) [💬 Reply]
```

### 3-3. New Bugs

Label `유형:버그` + created date in SINCE → new bug

```markdown
🐛 **New Bugs ({count} items)**
- [#{n} {title}]({url}) — reported by [{reporter}]({profile})
  Priority: {priority_label}
  [🌐 Issue]({url})
```

### 3-4. Assignee Changes

Events `assigned` / `unassigned` → assignee change

```markdown
👤 **Assignee Changes ({count} items)**
- [#{n} {title}]({url}) — [{before}]({profile}) → [{after}]({profile})
```

---

## Step 4 — Stale PR Alert

```bash
# Open PRs exceeding review_sla_hours
NOW=$(date -u +%s)
SLA=$(yq '.global_defaults.review_sla_hours' _wood/milestone-meta.yaml)

gh pr list --repo $REPO --state open \
  --json number,title,author,createdAt,updatedAt,reviews \
  | jq --arg now "$NOW" --argjson sla "$SLA" '
    .[] | select((($now | tonumber) - (.updatedAt | fromdate)) / 3600 > $sla)'
```

```markdown
⏰ **Stale PRs ({count} items)** — Review SLA exceeded
- [PR #{n} {title}]({url}) — [{author}]({profile}), waiting {hours} hours
  Reviewer: [{reviewer}]({profile}) or "Not assigned"
  [🌐 PR]({url}) [💬 Nudge reviewer]
```

---

## Step 5 — Today's Focus

### 5-1. Due Today (상태:리뷰)

```bash
gh issue list --repo $REPO --state open \
  --label "상태:리뷰" --json number,title,assignees
```

### 5-2. Approaching Deadline Issues

When `milestone.due_on` is within today + 3 days.

### 5-3. Merge-Ready PRs (APPROVED)

```bash
gh pr list --repo $REPO --state open \
  --json number,reviews | \
  jq '.[] | select(.reviews | map(.state) | contains(["APPROVED"]))'
```

```markdown
🎯 **Today's Focus**
In review:     [#{n} {title}]({url}) — [{assignee}]({profile})
Merge ready:   [PR #{n} {title}]({url}) — APPROVED
Deadline soon: [#{n} {title}]({url}) — D-{days}
```

---

## Step 6 — Change Summary

Aggregate by category and provide a brief summary:

```markdown
## 📊 Last 24 Hours Summary

| Category | Count | Owner |
|----------|-------|-------|
| New issues | {n} | {top_reporter} |
| New PRs | {n} | {top_author} |
| Comments | {n} | - |
| Merged PRs | {n} | - |
| Status changes | {n} | - |
| New blockers | {n} | ⚠️ |
```

---

## Step 7 — Full Digest Output

Combine all sections into one view:

```markdown
📰 PM Daily Digest — {yyyy-MM-dd HH:mm}
Query period: {since} ~ {now}

────────────────────────────────
⚠️ Immediate Action Required
────────────────────────────────
{Step 3-1 Blocking}
{Step 3-2 PM Mentions}
{Step 4 Stale PR}

────────────────────────────────
🐛 New Bugs
────────────────────────────────
{Step 3-3}

────────────────────────────────
🎯 Today's Focus
────────────────────────────────
{Step 5}

────────────────────────────────
📈 Activity Summary
────────────────────────────────
{Step 6 table}

────────────────────────────────
👤 Assignee Changes
────────────────────────────────
{Step 3-4}

---

## Action Options

[1] Post a comment asking for reason on blocking issue
[2] Post a comment nudging stale PR reviewer
[3] Full project view → 01-project-view.md
[B] Return to PM dashboard
```

---

## Step 8 — Quick Actions

Quick Actions for each alert are delegated to `02-activity.md` Step 3 (comment flow).

Example:
- Select blocking issue → open pre-filled inquiry template → send **after preview + confirmation**
- Reply to PM mention → reply in current comment thread

**Comment posting rules: strictly follow `_core.md` / `_ux.md` / `_safety.md` § Comment Safety.**

---

## ✅ Success Criteria

- All events within the 24-hour window collected
- Blocking/mentions/new bugs detected accurately
- Stale PR SLA threshold applied
- All references are clickable
- Preview required before any quick action

## ❌ Failure Criteria

- Missing events (especially label events)
- Arbitrarily changing the query period
- Auto-posting comments
- Displaying distorted developer activity

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
