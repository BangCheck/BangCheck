<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow — Milestone Cleanup

> **Purpose:** Close completed milestones + set due dates + guide new sprint creation
> **Caller:** pm-recommend.md (action: milestone-stale, milestone-no-due)

---

## Step 1 — Status Display

```bash
REPO="SWYP-Backend/project"
gh api repos/$REPO/milestones \
  --jq '.[] | "\(.title) | open:\(.open_issues) | closed:\(.closed_issues) | state:\(.state) | due:\(.due_on // "none")"'
```

Render:

```
## 📅 Milestone Status

| Milestone | Open Issues | Closed Issues | State | Due Date | Verdict |
|-----------|-------------|---------------|-------|----------|---------|
{for each milestone:}
| {title} | {open} | {closed} | {state} | {due_on or "❌ None"} | {verdict} |
{/for}

Verdict criteria:
  🔴 Pending close = state:open + open_issues:0 + closed_issues > 0 → needs closing
  ⚠️ No due date = state:open + due_on:null → cannot calculate D-day
  ✅ Normal = state:open + open_issues > 0 + due_on set
```

---

## Step 2 — Handle Milestones Pending Close

```
{for each stale milestone:}

📅 "{title}" — All issues are completed but the milestone is still open.

  A. Close it now
  B. Review issues then close (in case something was missed)
  C. Leave it as is

  Recommendation: A — Leaving completed milestones open clutters the dashboard.

{/for}
```

STOP and WAIT.

### [A] Execute Close

```bash
# preview
echo "Closing milestone '{title}'."
echo "  - Open issues: 0"
echo "  - Closed issues: {n}"
echo ""
echo "Proceed? [Y/N]"
```

After confirmation:
```bash
MILESTONE_NUM=$(gh api repos/$REPO/milestones --jq '.[] | select(.title == "{title}") | .number')
gh api -X PATCH repos/$REPO/milestones/$MILESTONE_NUM -f state=closed
```

---

## Step 3 — Handle Milestones Without Due Date

```
{for each no-due milestone:}

📅 "{title}" — No due date has been set.
   Without a due date, D-day cannot be calculated and schedule tracking becomes difficult.

  Set a due date?
  Enter a date (e.g., 2026-05-09):
  Or [S] Skip

{/for}
```

When a date is entered:
```bash
gh api -X PATCH repos/$REPO/milestones/$MILESTONE_NUM \
  -f due_on="{date}T23:59:59Z"
```

---

## Step 4 — New Sprint Creation Suggestion

If all open milestones have been closed or there is no active sprint:

```
📅 There is currently no active sprint.

Create a new sprint?

[Y] Create new sprint
[N] Later

Recommendation: Y — Without an active sprint, the team lacks a clear focus.
```

### [Y] Create

```
Enter sprint name (e.g., Sprint 2):
Enter due date (e.g., 2026-05-23):
Enter description (e.g., Social login stabilization + map page implementation):
```

```bash
gh api repos/$REPO/milestones \
  -f title="{name}" \
  -f due_on="{date}T23:59:59Z" \
  -f description="{desc}"
```

---

## 🔙 Return — Recommendation Loop Return (MANDATORY)

### Return Step 1 — Completion Summary

```
✅ {action_summary}
   (e.g., "Sprint 1 closed", "Sprint 2 created (due: 2026-05-23)")
```

### Return Step 2 — Next Task Suggestion

```
{if new_sprint_created}
A new sprint has been created! 🎉
Shall we assign issues to the new sprint?

  A. Assign unassigned issues to the new sprint → assign-recommend.md
  B. Check other tasks → re-evaluate pm-recommend
  C. Return to PM dashboard

  Recommendation: A — Issues need to be assigned to the new sprint so the team has direction.
{else}
  A. Check other tasks → re-evaluate pm-recommend
  B. Return to PM dashboard

  Recommendation: A — After milestone cleanup, shall we check for other items needing attention?
{/if}
```

STOP and WAIT.

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21
