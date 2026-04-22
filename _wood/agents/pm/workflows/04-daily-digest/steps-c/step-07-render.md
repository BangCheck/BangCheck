---
name: step-07-render
description: "Render Full Digest"
nextStepFile: "./step-08-actions.md"
---


# Step 07 — Render Digest

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Render Full Digest

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A REPORTER — present data as-is, never add unverified information
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + recent activity
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

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

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Output rendered in the exact specified format
- Routed correctly to `./step-08-actions.md`

### ❌ FAILURE
- Rendering with missing or partial data — wait for complete data first
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
