---
step: 2
title: "Build Tree Structure"
nextStep: "./step-03-render.md"
---

# Step 02 — Build Tree Structure

READ THIS ENTIRE FILE before executing any action.

---

## 2-1. Calculate Milestone Status

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

## 2-2. Calculate Page Status

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

## 2-3. Task Status Icon Mapping

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

## 2-4. Assemble Tree Structure

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
