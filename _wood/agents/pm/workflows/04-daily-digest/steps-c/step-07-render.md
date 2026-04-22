---
step: 7
title: "Render Full Digest"
nextStep: "./step-08-actions.md"
---

# Step 07 — Render Digest

READ THIS ENTIRE FILE before executing any action.

---

## Assemble and Render Full Digest

```
📰 PM Daily Digest — {yyyy-MM-dd HH:mm}
Query period: {SINCE} ~ now

────────────────────────────────
⚠️ Immediate Action Required
────────────────────────────────
{step-03 blocking section}
{step-03 PM mentions section}
{step-04 stale PR section}

────────────────────────────────
🐛 New Bugs
────────────────────────────────
{step-03 new bugs section}

────────────────────────────────
🎯 Today's Focus
────────────────────────────────
{step-05 section}

────────────────────────────────
📈 Activity Summary
────────────────────────────────
{step-06 summary table}

────────────────────────────────
👤 Assignee Changes
────────────────────────────────
{step-03 assignee changes section}
```

If immediate action items are 0, show at the top:
```
✅ No immediate action items today.
```

---

## Completion

Render complete → load `./step-08-actions.md`.
