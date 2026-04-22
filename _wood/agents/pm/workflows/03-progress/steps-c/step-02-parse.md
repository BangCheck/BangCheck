---
name: step-02-parse
description: "Parse issue checklist"
nextStepFile: "./step-03-branch.md"
---


# Step 02 — Issue Parsing

READ THIS ENTIRE FILE before executing any action.

---

### 2-1. Checklist Item Count

From the issue body:

```python
# Target sections for parsing
sections = ["Basic Checklist", "Implementation Details", "Cases to Consider"]

total_checklist = count("- [ ]") + count("- [x]")
completed_checklist = count("- [x]")
checklist_ratio = completed_checklist / total_checklist if total_checklist > 0 else 0
```

---

### 2-2. Test Scenario Count

Count items in the `### Test Scenarios` or `## Test Cases` section.
→ Save as expected test case count.

---

### 2-3. Implementation Requirement Extraction

Extract items containing imperative verbs ("implement", "add", "support") from the body → use for scope estimation.

---

## Completion

Parsing complete → save `{checklist_ratio}`, `{test_count}` → load `./step-03-branch.md`.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Data parsed into structured format without errors
- Routed correctly to `./step-03-branch.md`

### ❌ FAILURE
- Empty or malformed response → report exact error, do not continue
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
