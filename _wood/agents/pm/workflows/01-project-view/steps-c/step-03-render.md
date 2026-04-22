---
name: step-03-render
description: "Render Tree + Summary"
nextStepFile: "./step-04-filter.md"
---


# Step 03 — Render Tree + Summary

READ THIS ENTIRE FILE before executing any action.

---

### 3-1. Intro Narrative (Non-developer PM Friendly)

Summarize with natural sentences based on the data:

```
📋 Here's the current SWYP project status!

The active sprint is **{milestone_title}**.
The deadline is {due_on}, and {pct}% of all tasks are complete.

There are {page_total} page tasks in total —
{page_done} are complete and {page_open} are still in progress.
Detailed tasks within each page are divided by assignee and being worked on.

{if bug_count > 0}
🐛 There are currently {bug_count} open bugs. Let me check if the dev team is handling them!
{/if}
{if blocker_count > 0}
🚨 There are {blocker_count} blocked issues. What would you like to do?

  A. Leave a comment for the assigned developer → Request status update on the issue
  B. Review blocked issue details → Assess the cause and decide
  C. Lower priority and move to the next sprint

  Candid recommendation: A — Checking with the developer first is the quickest way to resolve it.
{/if}
{if unassigned_count > 0}
👤 There are {unassigned_count} issues without an assignee. What would you like to do?

  A. Assign someone now → Select from the team member list
  B. Review the issue first and get an assignee recommendation
  C. Defer outside this sprint's scope

  Candid recommendation: B — Reviewing the issue content makes it easy to determine whether FE or BE is the right fit.
{/if}
```

If there are no active milestones:
```
⚠️ There are no sprints in progress. Would you like to create a new sprint in [5] Issue Management?
```

---

### 3-2. Per-Page Progress (Tree)

Render each page issue as a human-friendly block:

```
📄 {page_title}  [Go to]({url})
   Progress: {page_done}/{page_total} complete ({pct}%)
   Assignee: {assignee_names}

   Subtasks:
   {task_icon} {task_title}  [Go to]({url}) — {assignee or "Unassigned"} {status_icon}
   {task_icon} {task_title}  [Go to]({url}) — {assignee} {status_icon}
   ...

  🐛 Related Bugs
     {priority_icon} [{bug_title}]({url}) — {assignee or "Unassigned"}
```

---

### 3-3. Attention Items — Dynamic Recommendations (pm-recommend engine)

Instead of hardcoded A/B/C options, invoke the `pm-recommend.md` engine to generate dynamic recommendations.

### Execution

1. After outputting the render result up to Step 3-2,
2. Load `../pm-recommend.md` and **follow all its instructions.**
   - pm-recommend handles: status collection → pm-actions.csv evaluation → dynamic A/B/C generation → input handling
3. After pm-recommend completes, return to the Completion section of this file.

### Notes

- Do not hardcode A/B/C options directly in this file.
- Do not proceed to step-04 without going through pm-recommend.
- If pm-recommend returns "all-clear", proceed directly to step-04.

---

## Completion

After rendering is complete → load `./step-04-filter.md` and follow all instructions.
