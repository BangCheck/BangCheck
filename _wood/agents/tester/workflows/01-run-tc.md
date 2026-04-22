<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Tester Workflow 01 — Run Test Cases

> **Agent:** Tester
> **Purpose:** Sequentially execute TCs for a page issue and record results
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, Tester]`
- `### Test Cases` section exists in page issue body

---

## Step 1 — Select Page

```bash
gh issue list --repo SWYP-Backend/project --label "유형:페이지" \
  --state open --json number,title,body --limit 20
```

```
Select a page to test:

| # | Page | TC count | Completion |
|---|------|----------|------------|
| 1 | [#4 Login Page]({url}) | 11 | 27% |
| 2 | [#9 Landing Page]({url}) | 0 | N/A |

Enter number:
```

---

## Step 2 — Parse TC from issue body

Parse TC table from issue body:

```markdown
### Test Cases

| ID | Case | Linked | Status |
|----|------|--------|--------|
| TC-LOGIN-01 | Email format validation | #5 | ✅ |
| TC-LOGIN-02 | Naver OAuth success | #6 | ✅ |
| TC-LOGIN-03 | Mid-flow cancellation | #6 | ❌ |
...
```

Status:
- ⬜ Unchecked
- ✅ Pass
- ❌ Fail
- ⏭️ Skip (not applicable)

---

## Step 3 — TC Execution Loop

Execute sequentially starting from unchecked (⬜) TCs:

```
▶️ Running: TC-LOGIN-04: Minimum password length (8 chars) validation

Scenario:
  1. Go to login page
  2. Enter email
  3. Enter 7-character password
  4. Click login button

Expected result:
  "Password must be at least 8 characters" message displayed

Select result after execution:
[1] ✅ Pass
[2] ❌ Fail → bug registration flow
[3] ⏭️ Skip (not applicable / not implemented)
[4] ⏸️ Defer (check later)
[B] Back
```

---

## Step 4 — Result Recording

### 4-1. Pass (✅)

Update the TC status to ✅ in the issue body:

```bash
# Fetch current body
gh issue view {page_num} --json body --jq .body > /tmp/body.md

# AI finds the TC line in body and changes status
# | TC-LOGIN-04 | ... | ⬜ | → | TC-LOGIN-04 | ... | ✅ |

gh issue edit {page_num} --body "$(cat /tmp/body.md)" --repo SWYP-Backend/project
```

### 4-2. Fail (❌)

Automatically switch to bug registration flow:

```
❌ Failure handling

Registering a bug issue. Collecting information:

Suggested title: "[bug] {page_name} - {tc_name} failed"
Example:         "[bug] Login Page - Password minimum length validation failed"

[Y] Use this title  [E] Edit

Reproduction steps:
  (auto-copied from TC scenario, editable)

Expected vs Actual:
  Expected: {from_tc}
  Actual: (enter)

Error log (if any):
  (enter or press Enter to skip)

---
→ Delegate to 02-project.md Case 4 to create the actual issue
→ Update TC row with bug number: `❌ → ❌ (#{bug_number})`
```

### 4-3. Skip (⏭️)

```
Skip reason:
  (enter) — e.g., "Before map API integration"

Add comment to issue body:
  | TC-LOGIN-XX | ... | ⏭️ | ← comment: reason
```

### 4-4. Defer (⏸️)

Move to next TC without status change.

---

## Step 5 — Progress Update

Update section at the bottom of issue body when session ends:

```markdown
### 🧪 TC Progress (auto-updated)
  Pass: {✅_count}/{total} ({pct}%)
  Fail: {❌_count} (bugs {bug_links})
  Skip: {⏭️_count}
  Unchecked: {⬜_count}

  Last updated: {yyyy-MM-dd HH:mm} by [{tester}]({profile})
```

---

## Step 6 — Session Report

```markdown
🧪 TC Execution Session Complete

Page: [#{n} {title}]({url})

### This Session
  Executed: {count}
  Passed:   {✅_count}
  Failed:   {❌_count}  → Bugs registered: {bug_links}
  Skipped:  {⏭️_count}

### Overall Status
  {total_done}/{total} ({pct}%) complete

Next action:
  [C] Continue next TC
  [P] Switch to another page
  [R] Share progress with PM → 02-activity.md
  [X] Exit
```

---

## ✅ Success Criteria

- TC status accurately reflected in issue body
- Bug issue created + linked in TC row on failure
- Reject "failure" without reproducible steps

## ❌ Failure Criteria

- Fabricate TC results
- Corrupt issue body (touching other sections)
- Skip bug registration preview

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
