<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Case 7 — Issue Management

---

## 7-1. Select Issue

```
Enter issue number: #{n}
```

Show issue summary:
```
#{n} {title}
  Status: {state} | Labels: {labels} | Assignee: {assignees}
  Milestone: {milestone}
```

---

## 7-2. Management Menu

```
[1] Edit issue           — Modify title/body/labels
[2] Change assignee
[3] Move to milestone
[4] Close issue
[5] Sub-issue management — Add/remove
[6] Page checklist update
[B] Back
```

---

## 7-3. Actions

- **Edit title**: `gh issue edit {n} --title "{new}"`
- **Edit body**: fetch current, apply user's edit description, write back
- **Edit labels**: add/remove specific
- **Assign**: `gh issue edit {n} --add-assignee "{login}"`
- **Move milestone**: `gh issue edit {n} --milestone "{name}"`
- **Close**: `gh issue close {n} --reason completed|not-planned`
- **Sub-issue add/remove**: via GraphQL `addSubIssue` / `removeSubIssue` mutations
- **Page checklist update**: edit "### Default Checklist" section

Before close: warn if sub-issues still open.

---

## Completion

→ Return to `../workflow.md` Step 7 (Report).
