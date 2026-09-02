<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Case PR — PR Reviewer Assignment

---

## PR-1. Find PRs Without Reviewers

```bash
gh pr list --repo BangCheck/BangCheck --state open \
  --json number,title,author,reviewRequests \
  --jq '.[] | select(.reviewRequests | length == 0)'
```

```
PRs without reviewers:

| PR | Title | Author |
|----|-------|--------|
| #{n} | {title} | {author} |
```

If none:
```
✅ All PRs have reviewers assigned.
```

---

## PR-2. Assign Reviewer

```
Enter PR number to assign reviewer: #___

Team member list:
{lookup from team-roles.yaml}

Reviewer GitHub login:
```

```bash
gh pr edit {pr_number} --add-reviewer "{login}" --repo BangCheck/BangCheck
```

```
✅ Reviewer @{login} assigned to PR #{n}
   [View PR]({url})
```

---

## Completion

→ Return to `../workflow.md` Step 7 (Report).
