<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Case 6 — Issue Status Change

---

## 6-1. Select Issue

```
Enter issue number: #{n}
```

Show current state, ask for new:
```
#{n} {title} — Current: {status}

[1] Backlog    [2] Todo    [3] In Progress
[4] Blocked    [5] Review  [6] Done
```

---

## 6-2. Apply Change

```bash
gh issue edit {n} \
  --remove-label "{current_status}" \
  --add-label "{new_status}" \
  --repo SWYP-Backend/project
```

Special handling:
- `[4] Blocked` → ask reason → add as issue comment
- `[6] Done` → check for open sub-issues, warn if any

---

## Completion

→ Return to `../workflow.md` Step 7 (Report).
