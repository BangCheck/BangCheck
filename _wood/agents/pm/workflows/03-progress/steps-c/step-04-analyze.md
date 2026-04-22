---
name: step-04-analyze
description: "Branch code analysis"
nextStepFile: "./step-05-crosscheck.md"
---


# Step 04 — Branch Analysis

READ THIS ENTIRE FILE before executing any action.

---

### 4-1. Commit Analysis

```bash
git log --format="%h|%an|%s|%ar" main..{selected_branch}
```

```python
commit_count = len(commits)
last_commit_date = commits[0].date  # latest
days_since_last = (today - last_commit_date).days
stale = days_since_last > stale_commit_days  # based on milestone-meta.yaml
```

---

### 4-2. Changed File Analysis

```bash
git diff --stat main..{selected_branch}
```

---

### 4-3. Test File Presence

```bash
git diff --name-only main..{selected_branch} | grep -E "\.(test|spec)\." | wc -l
```

```python
test_presence_score = 1 if test_files_added > 0 else 0
```

If test scenarios are specified but test_files = 0 → flag as `🔴 No tests`.

---

### 4-4. TODO/FIXME Markers

```bash
git diff main..{selected_branch} | grep -E "^\+.*//.*(TODO|FIXME)" | wc -l
```

Save `todo_count`. Higher count means more deductions.

---

### 4-5. PR Status

```bash
gh pr list --repo $REPO --search "closes #{N}" --state all \
  --json number,state,reviews --limit 1
```

| PR Status | Score |
|-----------|-------|
| No PR | 0.0 |
| Draft | 0.3 |
| Open (no review) | 0.5 |
| Open (review requested) | 0.7 |
| Approved | 0.9 |
| Merged | 1.0 |

---

## Completion

Save analysis values → load `./step-05-crosscheck.md`.
