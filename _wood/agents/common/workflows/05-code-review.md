<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Common Workflow — Code Review

> **Purpose:** Read code from a review-requested PR and perform a structured review
> **Roles:** FE, BE, Admin
> **Trigger:** When sprint-recommend suggests "review Story exists"

---

## Step 1 — PR Selection

```bash
# PRs where review is requested
REVIEW_PRS=$(gh pr list --repo $REPO --state open \
  --json number,title,author,body,additions,deletions,changedFiles,url | \
  jq "[.[] | select(.reviewRequests[]?.login == \"$USER_LOGIN\")]")
```

```
Select a PR to review:

| # | PR | Title | Author | Size |
|---|-----|-------|--------|------|
{for each:}
| {i} | #{n} | {title} | {author} | +{add}/-{del} {files} files |
{/for}

Candid recommendation: 1 — starting with the smallest keeps team progress moving quickly.

Number:
```

STOP and WAIT.

---

## Step 2 — Read Diff

```bash
gh pr diff {pr_number} --repo $REPO
```

### Role Boundary Check

```
{if ROLE == Frontend AND diff contains backend/src}
  ⚠️ This PR contains BE code changes.
  Delegate BE-related parts to the BE reviewer.
  Reviewing FE code only.
{/if}

{if ROLE == Backend AND diff contains frontend/src}
  ⚠️ This PR contains FE code changes.
  Delegate FE-related parts to the FE reviewer.
  Reviewing BE code only.
{/if}
```

---

## Step 3 — Review Checklist

### Common Checks

```
## Code Review — PR #{number}

### Basics
- [ ] PR title matches commit convention
- [ ] closes #{issue} present in body
- [ ] No unnecessary file changes (.env, lock files, etc.)

### Code Quality
- [ ] Function/variable names are clear
- [ ] No duplicate code
- [ ] Error handling is appropriate
- [ ] No security vulnerabilities (SQL injection, XSS, etc.)
```

### FE Additional Checks

```
- [ ] Mobile responsive (360px~)
- [ ] Korean UI consistency
- [ ] Accessibility (keyboard/screen reader)
- [ ] No unnecessary re-renders
- [ ] Image optimization
```

### BE Additional Checks

```
- [ ] Matches API contract (endpoint, request/response)
- [ ] No DB query N+1 issues
- [ ] No missing auth/permission checks
- [ ] Breaking changes are marked
- [ ] Transaction handling is appropriate
```

---

## Step 4 — Write Review Comments

```
## Review Results

{if issues_found}
### Issues Found

{for each issue:}
📁 {file}:{line}
  Issue: {description}
  Suggestion: {suggestion}
  Severity: {🔴 blocker / 🟡 suggestion / 💡 nit}
{/for}

### Verdict

  A. ✅ Approve — no issues (or nits only)
  B. 💬 Comment — leave feedback only, hold approval
  C. 🔴 Request Changes — modifications needed

  Candid recommendation: {letter} — {reason}
{else}
  ✅ Code quality is good — recommend Approve

  A. ✅ Approve
  B. 💬 Comment and Approve
{/if}
```

STOP and WAIT.

### Execute

```bash
# Approve
gh pr review {pr_number} --repo $REPO --approve --body "{comment}"

# Comment
gh pr review {pr_number} --repo $REPO --comment --body "{comment}"

# Request changes
gh pr review {pr_number} --repo $REPO --request-changes --body "{comment}"
```

**preview required** — _safety.md § Comment Safety

---

## Step 5 — Complete + Next Recommendation

```
✅ Review complete — PR #{number}

  Verdict: {approve/comment/request-changes}

{if more_review_prs > 0}
  A. Next review (#{next_pr}) ⭐
  B. Return to dashboard

  Candid recommendation: A — {more_review_prs} more reviews remaining.
{else}
  A. Return to dashboard
  B. Continue my own work → 03-dev-start

  Candid recommendation: B — reviews are done, get back to your own work.
{/if}
```

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21
