<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Case 3 — Add Task (Sub-issue)

---

## 3-1. Parent Selection

If invoked with `parent_number` (from step-02-page), use it.
Otherwise:

```bash
gh issue list --repo SWYP-Backend/project --label "유형:작업" --state open \
  --json number,title --limit 20
```

```
Select parent page:

| # | Title |
|---|-------|
| #{n} | {title} |
| [0] | Create standalone task without parent

Enter number:
```

---

## 3-2. Bulk Create (if task_list provided)

Show list for confirmation only:

```
Tasks to create:

| # | task | priority |
|---|------|---------|
| 1 | {task_1} | inherited |
| 2 | {task_2} | inherited |

Proceed to fill in details for each task one by one.
```

STOP and WAIT for user input (`Y` to proceed, `E` to edit list, `B` to cancel).

---

## 3-3. Per-task Detail Collection (MANDATORY)

For **each task** in the list, collect details before creating:

```
── Task {n}/{total}: {task_title} ──

Fill in the details below. Press Enter to skip optional fields.

[Required]
  What needs to be implemented?
  > ___

[Optional — leave blank to use placeholder]
  Implementation checklist items (comma-separated):
  > ___

  Edge cases to consider (comma-separated):
  > ___

  Test scenarios (comma-separated):
  > ___

  Done criteria (comma-separated, defaults applied if blank):
  > ___
```

STOP and WAIT for user input before moving to next task.

Apply defaults for skipped fields:
- Implementation checklist → `- [ ] (to be detailed)`
- Edge cases → `- [ ] (to be detailed)`
- Test scenarios → `- [ ] (to be detailed)`
- Done criteria → standard 3 items (feature works / no regression / code convention)

---

## 3-4. Preview Before Create (MANDATORY)

After collecting details for all tasks, show full preview:

```
📋 Issue preview — {task_title}

  Parent:    #{parent_number}
  Labels:    유형:작업 · {priority}
  Milestone: {milestone}
  Assignee:  {assignee}

  ## Implementation
  {description}

  ## Implementation Checklist
  {checklist}

  ## Edge Cases
  {edge_cases}

  ## Test Scenarios
  {test_scenarios}

  ## Done Criteria
  {done_criteria}

[Y] Create  [E] Edit  [N] Skip this task
```

STOP and WAIT. Repeat for each task.

---

## 3-5. Create + Link Each Task

```bash
gh issue create --repo SWYP-Backend/project \
  --title "{task_title}" \
  --label "유형:작업,{priority_inherited}" \
  --milestone "{milestone_inherited}" \
  --assignee "{assignee}" \
  --body "{rendered}"
```

Link as sub-issue (preferred):
```bash
gh api graphql -f query='
mutation($parent: ID!, $child: ID!) {
  addSubIssue(input: { issueId: $parent, subIssueId: $child }) {
    issue { number }
    subIssue { number }
  }
}' -f parent="{parent_node_id}" -f child="{child_node_id}"
```

Duplicate check before each creation:
```bash
gh issue list --repo SWYP-Backend/project --state open --search "{title}"
```

---

## Completion

→ Return to `../workflow.md` Step 7 (Report).
