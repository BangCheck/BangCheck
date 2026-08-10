<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow — PR Detail View

> **Purpose:** Enable a non-developer PM to grasp PR status at a glance and decide on next actions.
> **Caller:** 07-pm-recommend.md (action: pr-violation, pr-incomplete, pr-no-reviewer, pr-stale)

---

## Step 1 — PR Data Collection

```bash
REPO="BangCheck/BangCheck"

ALL_PRS=$(gh pr list --repo $REPO --state open \
  --json number,title,author,labels,reviewRequests,reviews,body,createdAt,additions,deletions,changedFiles,headRefName,url \
  --limit 20)
```

### Checklist Parsing

Extract `- [ ]` / `- [x]` from each PR body:

```bash
# For each PR:
total_checks=$(echo "$body" | grep -cE '^\s*- \[(x| )\]' || echo 0)
done_checks=$(echo "$body" | grep -cE '^\s*- \[x\]' || echo 0)
undone_checks=$(echo "$body" | grep -cE '^\s*- \[ \]' || echo 0)
undone_items=$(echo "$body" | grep -E '^\s*- \[ \]' | sed 's/^\s*- \[ \] //')
```

### Linked Issue Extraction

```bash
linked_issues=$(echo "$body" | grep -oiE '(closes?|fixes?|resolves?) #[0-9]+' | grep -oE '#[0-9]+')
```

### Elapsed Days Calculation

```bash
created_at="{PR createdAt}"
days_ago=$(( ($(date +%s) - $(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" +%s)) / 86400 ))
```

---

## Step 2 — PR Card Render

Render the PR list passed via context_var or the full list:

```
## Open PR ({count} total)

{for each PR, sorted by priority_score:}

{severity_icon} PR #{number}  {title}  [Shortcut]({url})
   closes {linked_issues} · {area} · {author_name} · {days_ago} days ago
   Size: +{additions}/-{deletions}, {changedFiles} files
   Checklist: {done_checks}/{total_checks} {progress_bar} {pct}%
   {if undone_checks > 0}
   Incomplete:
     ☐ {undone_item_1}
     ☐ {undone_item_2}
   {/if}
   Reviewer: {reviewer_status}
   Labels: {labels}
   → {recommendation}

{/for}
```

### severity_icon Determination

| Condition | Icon | priority_score |
|-----------|------|---------------|
| compliance-violation label | 🔴 | 1 |
| Incomplete checklist + 3+ days | 🟡 | 2 |
| No reviewer + 2+ days | 🟡 | 3 |
| Review requested + no review 48h+ | ⏰ | 4 |
| All complete + review done | ✅ | 5 |

### reviewer_status Format

| Status | Display |
|--------|---------|
| reviewRequests present, no reviews | 🟡 {name} (requested, pending review) |
| reviews APPROVED | ✅ {name} (approved) |
| reviews CHANGES_REQUESTED | 🔴 {name} (changes requested) |
| No reviewRequests | ❌ No reviewer assigned |

### Area Detection

| Condition | Area |
|-----------|------|
| headRefName contains `feat/` + body has frontend keywords | FE |
| body has backend/API/DB/entity keywords | BE |
| changedFiles include both FE+BE paths | FE+BE |
| Other | Infra |

### Recommendation Generation

| Status combination | Recommendation sentence |
|-------------------|------------------------|
| violation | "The violation needs to be resolved first. Shall we check with the author?" |
| Incomplete checklist | "There are {n} incomplete items. Shall we request the author to finish them?" |
| No reviewer + checklist complete | "Assigning a reviewer will allow merge to proceed right away." |
| Review pending 48h+ | "The reviewer has been unresponsive for {hours} hours. Shall we send a reminder?" |
| Checklist complete + review approved | "Ready to merge! Would you like to request Admin to merge?" |

---

## Step 3 — Duplicate/Conflict Detection

If 2+ PRs close the same issue:

```
⚠️ Potential Conflict Detected

There are {count} PRs closing issue #{issue_number}:
  - PR #{a} ({author_a}) — {title_a}  [Shortcut]({url_a})
  - PR #{b} ({author_b}) — {title_b}  [Shortcut]({url_b})

We need to verify whether these PRs should be merged in order or are duplicates.
Shall we ask the author ({author})?

[Y] Request confirmation via comment
[N] Skip
```

---

## Step 4 — Action Menu

```
What would you like to do?

[1] Assign a reviewer to a specific PR     → Enter PR number → Select team member → gh pr edit --add-reviewer
[2] Leave a comment for the author          → Enter PR number → Delegate to 02-activity.md
[3] Bulk reminder for PRs with incomplete checklists  → Comment to each PR author (preview required)
[4] Check merge-ready PRs                   → Filter PRs with complete checklist + approved review
[B] Return to PM dashboard

Enter a number:
```

STOP and WAIT for user input.

---

## Step 5 — Handlers

### [1] Assign Reviewer

```
Enter the PR number:
```

→ Recommend suitable reviewers from team-roles.yaml (based on PR area):
```
PR #{n} — {title} (Area: {FE/BE})

Recommended reviewers:
  1. [{name}]({profile}) — {role}, currently reviewing {review_count} PRs
  2. [{name}]({profile}) — {role}, currently reviewing {review_count} PRs

Enter a number or GitHub login:
```

After confirmation:
```bash
gh pr edit {pr_number} --add-reviewer "{login}" --repo $REPO
```

### [2] Comment

Delegate to 02-activity.md. Pass PR context.

### [3] Bulk Reminder

Preview comment for each PR → user confirmation → send.

### [4] Check Merge-Ready

Filter PRs with 100% checklist + APPROVED review:
```
✅ Merge-ready PRs:
  PR #{n} {title} — Checklist {done}/{total}, review approved
  → Shall we leave a merge request comment for Admin (@Woo-JongHo)? [Y/N]
```

---

## 🔙 Return — Recommendation Loop Return (MANDATORY)

**After all actions (reviewer assignment, comment sent, conflict check, etc.) are complete**, the following must be executed:

### Return Step 1 — Completion Summary

```
✅ {action_summary}
   (e.g., "Reviewer assigned to PR #29", "Conflict check comment sent to dlwldP")
```

### Return Step 2 — Next Task Suggestion

```
Just completed: {completed_action}

Continue?

{if remaining_pr_actions > 0}
  A. Return to PR list → re-render this workflow Step 2
  B. Check other tasks → re-evaluate pm-recommend
  C. Return to PM dashboard
  
  Recommendation: A — There are still {remaining} more PRs to review.
{else}
  A. Check other tasks → re-evaluate pm-recommend
  B. Return to PM dashboard
  
  Recommendation: A — Shall we check if there are other items needing attention?
{/if}
```

STOP and WAIT.

### Special Handling After Conflict Detection Comment

`[Y] Request confirmation via comment` → after sending:

```
✅ Confirmation request comment sent to dlwldP.

Shall we look at other PRs while waiting for a response?

  A. Check remaining PRs → go to Step 4 action menu
  B. Check other tasks → re-evaluate pm-recommend
  C. Return to PM dashboard

  Recommendation: A — It's more efficient to assign reviewers for other PRs while waiting for a response.
```

`[N] Skip` selected:

```
→ Go directly to Step 4 action menu (PR list is already displayed)
```

---

## ✅ Success Criteria

- Checklist progress displayed for all PRs
- Reviewer status accurately reflected
- Duplicate closes detected
- Language understandable by a non-developer PM (minimize code terminology)
- [Shortcut] URL included for all actions
- Preview + confirmation required before sending comments

## ❌ Failure Criteria (MUST NOT)

- Show code diff content to PM
- Execute PR merge (Admin only)
- Send comments without user confirmation
- Omit GitHub URLs
- Fabricate/guess checklist data

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21
