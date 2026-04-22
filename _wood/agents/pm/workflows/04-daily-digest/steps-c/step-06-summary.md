---
name: step-06-summary
description: "Change Summary Aggregation"
nextStepFile: "./step-07-render.md"
---


# Step 06 — Change Summary

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Change Summary Aggregation

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

### 6-1. Aggregate by Category

Based on collected data:

| Category | Aggregation Source |
|----------|-------------------|
| New issues | step-02 A result |
| New PRs | step-02 D where createdAt >= SINCE |
| Comments | step-02 B result |
| Merged PRs | step-02 D where state=merged |
| Status changes | step-02 C result |
| New blockers | step-03-1 result |

---

### 6-2. Build Summary Table

```
## 📊 {period} Summary

| Category       | Count |
|----------------|-------|
| New issues     | {n}   |
| New PRs        | {n}   |
| Comments       | {n}   |
| Merged PRs     | {n}   |
| Status changes | {n}   |
| New blockers   | {n} ⚠️ |
```

---

## Completion

Save summary data → load `./step-07-render.md`.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Output rendered in the exact specified format
- Routed correctly to `./step-07-render.md`

### ❌ FAILURE
- Rendering with missing or partial data — wait for complete data first
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
