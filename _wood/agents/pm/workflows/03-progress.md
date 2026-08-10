<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow 03 — Progress Estimation (AI Code Analysis)

> **Agent:** PM
> **Purpose:** Answer "How much is really done?" using code analysis
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)
> **Accuracy:** ~70% (for reference only, not authoritative)

---

## 🛑 Pre-flight

- User role in `[Admin, PM]`
- At least 1 open milestone must exist
- Feature/issue has an associated branch (usually `feat/{N}-*`)

---

## 🎯 What this workflow does

Given an issue number, estimate its real completion % by:
1. Parsing issue body (checklist items, test scenarios)
2. Analyzing branch commits + diff
3. Scanning code for TODO markers, test files
4. Computing weighted score (weights from `milestone-meta.yaml`)
5. Generating PM-friendly summary with evidence

**What this workflow does NOT do:**
- Judge code quality
- Detect bugs
- Replace human review
- Guarantee accuracy

---

## Step 1 — Target Selection

```
🔍 Which feature's progress would you like to analyze?

[1] Specify by issue number (e.g. #5)
[2] Select from active issue list
[3] Comprehensive analysis by page (page issue + all sub-issues)

Number:
```

### Input A — Issue number

```bash
gh issue view {N} --repo BangCheck/BangCheck \
  --json number,title,body,state,labels,assignees
```

### Input B — Active issue list

```bash
gh issue list --repo BangCheck/BangCheck \
  --milestone "$MILESTONE_NUM" --state open \
  --json number,title,assignees --limit 30
```

### Input C — Page comprehensive

If user selects a `유형:페이지` issue, auto-include all sub-issues.

---

## Step 2 — Parse Issue

Extract from issue body:

### 2-1. Checklist items

Count `- [ ]` (pending) and `- [x]` (done) under these sections:
- `### 기본 체크리스트` (page issue)
- `### 구현 세부 사항`
- `### 고려해야 할 케이스`

```python
# Pseudo-code for AI reference
total_checklist = count("- [ ]") + count("- [x]")
completed_checklist = count("- [x]")
checklist_ratio = completed_checklist / total_checklist if total_checklist > 0 else 0
```

### 2-2. Test scenarios

Count items under `### 테스트 시나리오` or `## 테스트 케이스`.
These serve as the expected test case count.

### 2-3. Explicit requirements

Look for imperative verbs in body ("구현", "추가", "지원") to estimate scope.

---

## Step 3 — Find Branch

Search for branches matching the issue:

```bash
BRANCHES=$(git branch -a | grep -E "(feat|fix|refactor)/.*{N}(-|$)" | head -5)
```

### Cases

| Found | Action |
|-------|--------|
| 1 branch | Use it |
| Multiple branches | Ask user to pick |
| 0 branches | Warn: "No branch found — cannot estimate progress" + offer to use just checklist |

---

## Step 4 — Branch Analysis

Compare branch with `main`:

```bash
BRANCH={selected}

# Commits
git log --format="%h|%an|%s|%ar" main..$BRANCH

# File changes
git diff --stat main..$BRANCH

# Test files added
git diff --name-only main..$BRANCH | grep -E "\.(test|spec)\." | wc -l

# Full diff for code scan
git diff main..$BRANCH
```

### 4-1. Commit activity

```python
commit_count = len(commits)
last_commit_date = commits[-1].date
days_since_last = (today - last_commit_date).days
```

If `days_since_last > stale_commit_days` → flag as stale.

### 4-2. Test presence

```python
test_files_added = count files matching *.test.* or *.spec.* in diff
test_presence_score = 1 if test_files_added > 0 else 0
```

If issue had `N` test scenarios and `0` test files → flag `🔴 No tests`.

### 4-3. TODO markers

Scan diff for remaining TODO/FIXME:

```bash
git diff main..$BRANCH | grep -E "^\+.*//.*(TODO|FIXME)" | wc -l
```

More TODOs → less complete.

### 4-4. File coverage

For each file mentioned in issue body's "구현 세부 사항", check if it appears in diff.
(Heuristic: not every issue lists files)

---

## Step 5 — Checklist vs Code Cross-check

For each `- [ ]` item in issue body, try to match evidence in code:

```
Checklist item: "Login form layout"
  → detect 'LoginForm' or 'login-form' or 'login form' in diff
  → found → bonus

Checklist item: "Validation"
  → detect 'validate', 'validation' patterns
  → found → bonus

Checklist item: "Error handling"
  → detect 'try', 'catch', 'error' patterns
  → not found → penalty
```

⚠️ **Heuristic, not reliable.** Always show evidence to user.

---

## Step 6 — Compute Score

Read weights from `milestone-meta.yaml`:

```bash
yq '.progress_estimation.weights' _wood/milestone-meta.yaml
```

Weighted sum:

```
score = (checklist_ratio          * weights.checklist_completion)
      + (commit_activity_score    * weights.commit_activity)
      + (test_presence_score      * weights.test_presence)
      + (todo_absence_score       * weights.todo_marker_absence)
      + (pr_state_score           * weights.pr_state)
```

Clamp to [0, 1]. Multiply by 100 → percentage.

### `pr_state_score`

| PR state | Score |
|----------|-------|
| No PR | 0 |
| Draft | 0.3 |
| Open + no review | 0.5 |
| Open + review requested | 0.7 |
| Approved | 0.9 |
| Merged | 1.0 |

---

## Step 7 — Render Report

```markdown
🔍 Progress Analysis: [{#N} {title}]({url})

## Issue Spec
  Checklist: {completed}/{total} ({pct}%)
  Test scenarios: {test_count} specified

## Branch: `{branch}`
  Commits:        {count}
  Last commit:    {time_ago}
  Files changed:  {count}
  Lines added:    +{n}
  Lines removed:  -{n}

## AI Estimated Progress: {score}%

### Evidence
  {icon} Checklist completion: {pct}%
  {icon} Commit activity: {description}
  {icon} Tests: {description}
  {icon} TODO markers: {count} remaining
  {icon} PR status: {state}

### Estimated Remaining Work
  - {item 1}
  - {item 2}

### 📊 Assessment
  {icon} {overall message}

  e.g. "⚠️ Approximately 9 more hours of work needed to meet completion criteria.
       At current pace, estimated completion by {target_date}."

---

⚠️  {disclaimer from milestone-meta.yaml}

[🌐 View issue]({url})
[🌐 View branch]({compare_url})
[💬 Share with assignee] → 02-activity.md Step 3
```

### Icon mapping for evidence

| Condition | Icon |
|-----------|------|
| ≥80% of checklist done | ✅ |
| 50~80% | 🟡 |
| <50% | 🔴 |
| Recent commits (<stale_days) | ✅ |
| Stale | ⚠️ |
| Tests present | ✅ |
| Tests missing | 🔴 |
| TODOs = 0 | ✅ |
| TODOs present | 🟡 |

---

## Step 8 — Share Result

```
[S] Share this report as a comment to the assignee (preview required)
[E] Return to PM Dashboard
```

If `S`:
- Compose comment with summary + link to this analysis (ephemeral — not persisted)
- Route to [`02-activity.md`](02-activity.md) Step 3 with pre-filled body

---

## Disclaimer (ALWAYS shown)

Load from `milestone-meta.yaml`:

```yaml
progress_estimation:
  disclaimer: |
    이 수치는 참고용입니다 (예상 정확도 ~70%).
    AI는 코드 품질이나 버그를 판단하지 않으며,
    실제 완료 판단은 PM/리뷰어의 몫입니다.
```

---

## Menu

```
[A] Analyze another issue      → Step 1
[P] Comprehensive page analysis → Step 1 Case C
[S] Share as comment            → Step 8
[B] Return to PM Dashboard
```

---

## ✅ Success Criteria

- Analysis uses real git + gh data (not fabricated)
- Evidence clearly presented
- Disclaimer shown
- User can share via 02-activity (with preview)

## ❌ Failure Criteria

- Skipping disclaimer
- Claiming certainty on AI estimate
- Modifying code or opening PRs automatically
- Missing evidence for score components

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
