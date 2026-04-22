---
name: step-03-escalations
description: "Detect Escalations"
nextStepFile: "./step-04-stale-pr.md"
---


# Step 03 — Detect Escalations

READ THIS ENTIRE FILE before executing any action.

---

### 3-1. Blocking Declarations

From events where `event=="labeled"` AND `label.name=="상태:블로킹"`:

```
🚫 New Blocking ({count} items)
- [#{n} {title}]({url}) — declared by [{actor}]({profile}) ({time_ago})
  💬 Latest comment: "{preview}"
  [🌐 Issue]({url})  [💬 Ask for reason →]
```

---

### 3-2. PM Mentions

```bash
PM_LOGIN=$(yq '.members | to_entries | map(select(.value.role == "PM")) | .[0].key' _wood/team-roles.yaml)
```

Comments containing `@{PM_LOGIN}` in body:

```
📢 PM Mentions ({count} items)
- [{member}]({profile}) mentioned in [#{n} {title}]({url})
  > "@{PM_LOGIN} {preview}..."
  [🌐 Comment]({url})  [💬 Reply →]
```

---

### 3-3. New Bugs

Label `유형:버그` + created date >= SINCE:

```
🐛 New Bugs ({count} items)
- [#{n} {title}]({url}) — reported by [{reporter}]({profile})
  Priority: {priority_label}
```

---

### 3-4. Assignee Changes

Events `assigned` / `unassigned`:

```
👤 Assignee Changes ({count} items)
- [#{n} {title}]({url}) — {before} → {after}
```

---

## Completion

Save escalation data → load `./step-04-stale-pr.md`.
