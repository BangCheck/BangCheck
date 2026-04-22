---
name: step-03-escalations
description: "Detect Escalations"
nextStepFile: "./step-04-stale-pr.md"
---


# Step 03 — Detect Escalations

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Detect Escalations

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + recent activity
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

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

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Routed correctly to `./step-04-stale-pr.md`

### ❌ FAILURE
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
