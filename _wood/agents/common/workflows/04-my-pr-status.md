<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Common Workflow — My PR Status Check

> **Purpose:** View PRs I submitted + PRs I've been asked to review at a glance, with next action recommendations
> **Roles:** FE, BE, Admin (for developers)
> **PM version:** PM uses pr-detail-view.md (team-wide view)

---

## Step 1 — Data Collection

```bash
# PRs I submitted
MY_PRS=$(gh pr list --repo $REPO --author "$USER_LOGIN" --state open \
  --json number,title,body,labels,reviewRequests,reviews,createdAt,additions,deletions,changedFiles,url)

# PRs where I'm requested as reviewer
REVIEW_REQUESTED=$(gh pr list --repo $REPO --state open \
  --json number,title,author,reviewRequests,url | \
  jq "[.[] | select(.reviewRequests[]?.login == \"$USER_LOGIN\")]")
```

---

## Step 2 — My PR Cards

```
## PRs I Submitted ({count})

{for each PR:}
{severity_icon} PR #{number}  {title}  [link]({url})
   closes #{linked_issues} · {days_ago} days ago
   Check: {done}/{total} {progress_bar}
   {if undone > 0}
   Incomplete:
     ☐ {undone_item}
   {/if}
   Reviewer: {reviewer_status}
   → {recommendation}
{/for}
```

---

## Step 3 — Review Requests

```
## Review Requests ({count})

{for each:}
📬 PR #{number}  {title}  [link]({url})
   Author: {author} · {days_ago} days ago
   → Please review after checking the code
{/for}

{if count == 0}
✅ No review requests
{/if}
```

---

## Step 4 — Recommendations

```
{if review_requested > 0}
  A. Handle review request (#{first_review_pr}) ⭐
     → Reviews come first to keep the team moving.
  B. Complete my PR checklist
  C. Return to dashboard

  Candid recommendation: A — reviewing others' PRs first means your PR gets reviewed sooner too.

{elif my_pr_undone > 0}
  A. Finish PR with incomplete checklist (#{pr_num})
  B. Assign reviewer
  C. Return to dashboard

  Candid recommendation: A — checklist must be completed before the reviewer can proceed.

{elif my_pr_no_reviewer > 0}
  A. Assign reviewer ⭐
  B. Return to dashboard

  Candid recommendation: A — no reviewer means nobody will look at it.

{else}
  ✅ PR status is good — waiting for review.
  [B] Return to dashboard
{/if}
```

STOP and WAIT.

---

## ✅ Success Criteria

- Both my PRs and review-requested PRs displayed
- Checklist progress shown
- Specific next action recommended

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21
