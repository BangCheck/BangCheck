---
step: 1
title: "Page Selection + TC Parsing"
nextStep: "./step-02-execute.md"
---

# Step 01 — Select Page + Parse TC

## 1-1. Page list

```bash
gh issue list --repo $REPO --label "유형:페이지" \
  --state open --json number,title,body --limit 20
```

Parse TC count + status from each page's `### Test Cases` section:

```
Select a page to test:

| # | Page | TCs | ⬜ Unchecked | ❌ Failed | Completion |
|---|------|-----|-------------|----------|------------|
{for each page:}
| {i} | [#{n} {title}]({url}) | {total} | {unchecked} | {failed} | {pct}% |
{/for}

Recommendation: {page with most unchecked or failed} — 
  {if failed > 0} Start with pages that have failed TCs to speed up bug tracking.
  {elif unchecked > 0} Start with the page that has the most unchecked TCs.
  {else} Pages without TCs need TC definition requests sent to the developer first.

Enter number:
```

STOP and WAIT.

## 1-2. TC Parsing

Parse TC table from the selected page issue body:

```
## #{n} {title} — TC List

{for each TC:}
  {status_icon} {TC_ID}: {case_name}
    Linked: #{linked_issue}
    {if status == ❌} → bug #{bug_number} {/if}
{/for}

Starting execution from unchecked (⬜) TCs.
```

→ step-02 execution loop.
