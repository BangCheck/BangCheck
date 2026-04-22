---
name: step-02-build
description: "Build Tree Structure"
nextStepFile: "./step-03-render.md"
---


# Step 02 — Build Tree Structure

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Build Tree Structure

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + Milestones API + Project Board
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### 2-1. Calculate Milestone Status

For each milestone:

```python
# Pseudo-code
closed_pct = closed_issues / total_issues  # total = open + closed

if due_on exists:
    days_elapsed = today - milestone.created_at
    total_days = milestone.due_on - milestone.created_at
    expected_pct = days_elapsed / total_days
    ratio = closed_pct / expected_pct

    if closed_pct == 1.0 and milestone.state == "open":
        milestone_icon = "⚠️"   # close candidate
    elif ratio >= on_track_threshold:
        milestone_icon = "🟢"
    elif ratio >= caution_threshold:
        milestone_icon = "🟡"
    else:
        milestone_icon = "🔴"
else:
    # If no due_on, use completion rate only
    if closed_pct >= 0.8:   milestone_icon = "🟢"
    elif closed_pct >= 0.5: milestone_icon = "🟡"
    else:                   milestone_icon = "⚪"
```

---

### 2-2. Calculate Page Status

```python
if page.state == "closed":
    page_icon = "✅"
elif all sub-tasks closed:
    page_icon = "✅ (close candidate)"
elif any task has label "상태:진행중":
    page_icon = "🟢"
else:
    page_icon = "⚪"
```

---

### 2-3. Task Status Icon Mapping

| Label | Icon |
|-------|------|
| 상태:진행중 | 🟢 |
| 상태:리뷰   | 🟣 |
| 상태:블로킹 | 🔴 |
| 상태:할일   | 🟡 |
| 상태:백로그 | ⚪ |
| 상태:완료   | ✅ |
| closed (no label) | ✅ |

---

### 2-4. Assemble Tree Structure

```
milestones[]
  milestone
    pages[]          ← 유형:페이지 issues (belonging to milestone)
      tasks[]        ← 유형:작업 (Parent: #page_num or sub-issue)
    independent[]    ← independent tasks without a page
    bugs[]           ← 유형:버그
```

---

## Completion

After tree structure is built → load `./step-03-render.md` and follow all instructions.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Output rendered in the exact specified format
- Routed correctly to `./step-03-render.md`

### ❌ FAILURE
- Rendering with missing or partial data — wait for complete data first
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
