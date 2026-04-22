---
name: step-06-summary
description: "Change Summary Aggregation"
nextStepFile: "./step-07-render.md"
---


# Step 06 — Change Summary

READ THIS ENTIRE FILE before executing any action.

---

## 6-1. Aggregate by Category

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

## 6-2. Build Summary Table

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
