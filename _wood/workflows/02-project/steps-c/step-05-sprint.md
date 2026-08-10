<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Case 5 — Sprint Management

3 sub-cases: **5-A Create / 5-B Close / 5-C List**

---

## 📋 Case 5-A — Create New Sprint

### 5-A-1. Name Input

```
📦 Create New Sprint

Enter the name (e.g., "S3 Page Development - Sprint 2026-04-22"):
  → ___
```

Refer to sprint column values in `docs/spec/functional-spec-v2.1.2.xlsx`.

### 5-A-2. Duration Input

```
Start date (YYYY-MM-DD, press Enter for today):
  → ___

End date (YYYY-MM-DD, required):
  → ___
```

### 5-A-3. Goal Input

```
Goal/description (optional, press Enter to skip):
  → ___
```

### 5-A-4. Auto-assign Issues from xlsx (optional)

```
Would you like to auto-create issues from screens belonging to this sprint in the xlsx?

▶️ Recommended: [1] Create sprint + create screen issues and assign to this milestone

Other options:
  [2] Create sprint only (add issues manually later)
  [3] Move existing issues to this sprint
  [B] Cancel
```

**Option [1] flow**: Filter xlsx → extract matching sprint rows → create page issues per screen → assign to new milestone.

### 5-A-5. Confirm + Create

```
Confirmation:
  Name:           {input}
  Start:          {input}
  End:            {input}
  Goal:           {input or "(none)"}
  Initial issues: {n} to be assigned

▶️ Recommended: [1] Create
  [2] Edit (start over)
  [B] Cancel
```

Execute:
```bash
gh api repos/BangCheck/BangCheck/milestones \
  -f title="{name}" \
  -f state="open" \
  -f due_on="{end_date}T23:59:59Z" \
  -f description="{goal}"
```

---

## 📋 Case 5-B — Close Sprint

Show open milestone list → select.

If open issues remain:
```
"{name}" has {n} open issues remaining.

▶️ Recommended: [1] Move to next sprint (safe)

Other options:
  [2] Close anyway (issues become unassigned from milestone)
  [3] Cancel
```

```bash
gh api repos/BangCheck/BangCheck/milestones/{number} -X PATCH -f state="closed"
```

---

## 📋 Case 5-C — Sprint List/Progress

```bash
gh api repos/BangCheck/BangCheck/milestones?state=all \
  --jq '.[] | {number, title, state, open_issues, closed_issues, due_on}'
```

Render:
```
📦 Sprint List

| Status | Name | open/closed | Progress | Due |
|--------|------|------------|----------|-----|
| 🟢 | [Sprint 2 — MVP]({url}) | 3/5 | 62% | 2026-05-03 (D-7) |
| ⚠️ | [Page Feature Composition]({url}) | 0/7 | 100% | — | ← close candidate
| ✅ | [Sprint 1]({url}) | 0/1 | 100% | closed |
```

Close candidates show **"[⚠️ Close]"** action link.

```bash
gh api repos/BangCheck/BangCheck/milestones/{number} -X PATCH -f state="closed"
```

---

## Completion

→ Return to `../workflow.md` Step 7 (Report).
