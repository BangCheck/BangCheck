---
step: 2
title: "Compare with GitHub Issues"
nextStep: "./step-03-create-issues.md"
---

# Step 02 — Specification vs GitHub Issues Comparison

READ THIS ENTIRE FILE before executing any action.

---

## 2-1. Fetch Current GitHub Issues

```bash
# All issues with label "유형:페이지"
gh issue list --repo $REPO --state all \
  --label "유형:페이지" \
  --json number,title,labels,state,milestone --limit 100

# All issues with label "유형:작업"
gh issue list --repo $REPO --state all \
  --label "유형:작업" \
  --json number,title,labels,state,milestone --limit 200
```

---

## 2-2. Comparison — Detect Missing / Mismatched Items

Map specification items to GitHub issues:

```python
for feature in spec_sections:
    match = find_issue_by_title_similarity(feature, github_issues)
    if not match:
        missing.append(feature)           # No issue → needs creation
    elif match.state == "closed":
        completed.append(feature)          # Completed
    else:
        in_progress.append(feature)        # In progress
```

---

## 2-3. Output Comparison Results

```
## 📊 Specification ↔ GitHub Comparison Results

✅ Issue exists (completed):    {n}
🟢 Issue exists (in progress): {n}
🔴 No issue (missing):         {n}

### 🔴 Missing Items — Issues Need to Be Created
| Screen | Feature |
|--------|---------|
| SCR-HOME | Room card delete button |
| SCR-AUTH | Google social login |
| ...      | ...              |
```

If 0 missing items:
```
✅ All specification items are registered in GitHub.
```

---

## Completion

Save comparison results as `{missing_items}`, `{completed_items}` → load `./step-03-create-issues.md`.
