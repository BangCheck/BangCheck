---
name: step-03-create-issues
description: "Issue Creation Wizard"
nextStepFile: "./step-04-update-docs.md"
---


# Step 03 — Issue Creation Wizard

READ THIS ENTIRE FILE before executing any action.

**Principles:**
- FE tasks → Assignee: Woo Jong-ho (FE Team Lead)
- BE tasks → Assignee: Ha Ji-myung (BE Team Lead)
- Both → Create 2 separate issues: FE issue + BE issue
- **MANDATORY: Always confirm before any issue or project creation — no silent auto-creation**
- **MANDATORY: Always show a recommendation before asking — never present a blank prompt**

### Confirmation Rule (applies to ALL issue/project creation in this workflow)

Before creating ANY issue or project item:
1. Show what will be created (preview)
2. Offer a natural recommendation on what to prioritize
3. Ask conversationally — not with a Y/N gate

```
✅ Good:
"SCR-HOME 미연동 기능이 6개예요. 우선순위 높은 것부터 3개만 먼저 생성할까요,
아니면 전체 다 올릴까요?"

❌ Bad:
"이슈를 생성하시겠습니까? (Y/N)"
```

If user confirms → create.
If user modifies scope → adjust and re-preview.
If user declines → skip this screen, move to next.

---

## 3-0. Entry Branch

```
[A] Create missing specification items   → 3-A (auto-draft)
[B] Create new feature outside spec      → 3-B (wizard)
[C] Cancel

Select:
```

STOP and WAIT for user input.

---

## 3-A. Create Missing Specification Items (Auto-Draft)

### A-1. Sprint Status Check

```bash
# Current active sprint
gh api "repos/$REPO/milestones?state=open&per_page=5" \
  --jq '.[] | {number, title, due_on, open_issues, closed_issues}'

# FE Lead (Woo Jong-ho) current issue count
gh issue list --repo $REPO --state open \
  --assignee "Woo-JongHo" --json number --jq length

# BE Lead (Ha Ji-myung) current issue count
gh issue list --repo $REPO --state open \
  --assignee "hajimyung" --json number --jq length
```

### A-2. Generate Draft for Each Missing Item

Auto-determine FE/BE for each item:

```python
# Classification rules
if feature contains ["UI", "screen", "component", "button", "page", "layout", "style"]:
    work_type = "FE"
elif feature contains ["API", "DB", "server", "data", "schema", "endpoint"]:
    work_type = "BE"
else:
    work_type = "Both"  # Cannot determine → ask user
```

Ask user only for ambiguous FE/BE items:
```
[#{n} {feature}] — Is this FE or BE?
[F] Frontend  [B] Backend  [FB] Both

Select:
```

### A-3. Sprint + Date Recommendation

```
Sprint recommendation:

Current Sprint 1 — D-{days} remaining  (FE Woo Jong-ho: {n} tasks in progress)
  → If there is capacity: Recommend Sprint 1 assignment
  → If deadline within 3 days: Recommend Sprint 2 assignment

Recommended period:
  Start date: {sprint_start or today}
  End date: Estimated {n} days → {calculated_date}
  (Adjustable)
```

---

## 3-B. New Feature Outside Spec — Wizard

When the PM describes what they want to build, the agent guides through each step.

### Q1. Which screen?

```
Which screen (page) is this feature for?

Currently registered screens:
  SCR-HOME  SCR-AUTH  SCR-CHECK-CREATE  SCR-CHECK-EDIT
  SCR-COMPARE  SCR-LANDING  SCR-DASHBOARD

Enter screen name or number (enter directly for a new screen):
```

STOP and WAIT.

### Q2. Issue Title

```
Enter a brief feature name:
e.g.) "Room card delete button", "Add Google social login"

Title:
```

STOP and WAIT.

### Q3. FE / BE Recommendation

Auto-determine based on the entered title/description, then recommend:

```
🤖 Recommendation: {FE / BE / Both}
  Rationale: "Contains '{keyword}' → Classified as {FE/BE} task"

[Y] Accept recommendation  [F] Change to FE  [B] Change to BE  [FB] Both

Select:
```

STOP and WAIT.

**If Both is selected → Mark as 2 separate FE/BE issues to be created.**

### Q4. Priority Recommendation

```
Priority recommendation:

  Direct user request → Priority: High recommended
  Improvement/Bug → Priority: Medium recommended
  UI detail → Priority: Low recommended

Recommended: Priority:{recommended}

[Y] Accept  [1] Critical  [2] High  [3] Medium  [4] Low

Select:
```

STOP and WAIT.

### Q5. Sprint + Date Recommendation

```
Sprint status:

🟢 Sprint 1 — D-{days}  ({open} tasks in progress)
   FE Woo Jong-ho: {n} / BE Ha Ji-myung: {n}

{Recommendation message}:
  → "Sprint 1 deadline has {n} days remaining with capacity. Recommend Sprint 1 assignment"
  → "Sprint 1 deadline is within 3 days. Recommend Sprint 2 assignment"

Recommended sprint: {milestone}
Recommended period: {start_date} ~ {end_date}

[Y] Accept  [S] Change sprint  [D] Enter dates manually

Select:
```

STOP and WAIT.

### Q6. Additional Details (Optional)

```
Enter additional description if any. (Press Enter to skip)

Description:
```

STOP and WAIT.

---

## 3-C. Preview (MANDATORY — Common for All Cases)

### Load Template

Issue body uses a common template:
- FE issue → `_wood/templates/issue-task.template.md`
- BE issue → `_wood/templates/issue-task-be.template.md` (includes API contract section)

After filling template variables, show preview:

```
📋 Issue Creation Preview

━━━━━━━━━━━━━━━━━━━━━━━━
[FE Issue]
Title:     {screen} — {feature}
Type:      유형:작업
Priority:  {priority}
Assignee:  (assign-recommend engine suggestion or user selection)
Sprint:    {milestone}
📅 Start:  {start_date}
📅 Due:    {end_date}

  Tracking: {spec_screen} / WBS {wbs_id} / Parent #{parent}
  Body: (based on issue-task.template.md)
━━━━━━━━━━━━━━━━━━━━━━━━
{if work_type == "BE" or "Both"}
[BE Issue]
Title:     {screen} — {feature} (BE)
Type:      유형:작업
Priority:  {priority}
Assignee:  (assign-recommend engine suggestion or user selection)
Sprint:    {milestone}
📅 Start:  {start_date}
📅 Due:    {end_date}

  Tracking: {spec_screen} / WBS {wbs_id} / Parent #{parent}
  API Contract: {method} {path} — {summary}
  FE Link: #{fe_issue_number} (auto-linked when Both)
  Body: (based on issue-task-be.template.md)
━━━━━━━━━━━━━━━━━━━━━━━━
{/if}

[Y] Create
[E] Edit
[O] Leave a comment — Add PM comment to issue body
[N] Cancel

Select:
```

STOP and WAIT.

### Assignee Decision Logic (No Hardcoding)

Assignee is determined by the following priority:
1. If the user explicitly specified → use as-is
2. assign-recommend engine (`../assign-recommend.md` Step 2~3 logic executed inline):
   - Look up members for the role from team-roles.yaml
   - Compare current open issue count per member
   - Recommend the member with the most capacity
3. Show recommendation and get user confirmation

```
Assignee recommendation:
  Based on availability among {role} members:
  🟢 [{name}]({profile}) — {open_count} tasks (recommended)
  🟡 [{name}]({profile}) — {open_count} tasks

  [Y] Accept recommendation  [number] Select different team member
```

### API Contract Draft (BE Issues Only)

When creating BE issues, extract an API contract draft from the specification:
- If API information exists in the specification → auto-fill
- If not → infer from the feature name and present a draft + PM confirmation

```
API Contract Draft:
  Endpoint: POST /api/{resource}
  Request:  { ... }
  Response: { ... }

  ⚠️ This draft is an estimate based on the specification. The BE developer will finalize during implementation.

  [Y] Use as-is  [E] Edit  [S] Leave blank (BE will fill in)
```

**[O] Leave a comment:**
```
Enter a comment/context to add to the issue:
(e.g., "Design mockup attachment needed", "Check BE API first before proceeding", "Top priority for this sprint")

Comment:
```
After input → Add to `## PM Notes` section at the bottom of the issue body → Return to 3-C preview.

---

## 3-D. Create Issue (When Y is Selected)

```bash
# FE issue
FE_BODY=$(cat _wood/templates/issue-task.template.md | sed 's/{variable}/value/g')
gh issue create --repo $REPO \
  --title "{title}" \
  --label "유형:작업,{priority_label},프론트엔드" \
  --milestone "{milestone_number}" \
  --assignee "{recommended_fe_assignee}" \
  --body "$FE_BODY"

FE_ISSUE_NUM=$(gh issue list --repo $REPO --state open --search "{title}" --json number --jq '.[0].number')
```

```bash
# BE issue (when BE or Both)
BE_BODY=$(cat _wood/templates/issue-task-be.template.md | sed 's/{variable}/value/g')
gh issue create --repo $REPO \
  --title "{title} (BE)" \
  --label "유형:작업,{priority_label},백엔드" \
  --milestone "{milestone_number}" \
  --assignee "{recommended_be_assignee}" \
  --body "$BE_BODY"

BE_ISSUE_NUM=$(gh issue list --repo $REPO --state open --search "{title} (BE)" --json number --jq '.[0].number')
```

### Cross-Link When Both (MANDATORY)

```bash
# Add BE link to FE issue
gh issue comment $FE_ISSUE_NUM --repo $REPO \
  --body "🔗 BE integration issue: #${BE_ISSUE_NUM} — Please share API contract updates in this issue as well."

# Add FE link to BE issue
gh issue comment $BE_ISSUE_NUM --repo $REPO \
  --body "🔗 FE integration issue: #${FE_ISSUE_NUM} — Please comment on this issue for any API changes."
```

### Parent Link (MANDATORY)

```bash
# Sub-issue API
gh api repos/$REPO/issues/{parent}/sub_issues \
  -f sub_issue_id={child_issue_node_id}

# Fallback: update parent body checklist
```

### Start/End Date Setting (GitHub Project Board)

```bash
ITEM_ID=$(gh project item-list 2 --owner SWYP-Backend --format json \
  --jq ".items[] | select(.content.number == {issue_number}) | .id")

gh project item-edit \
  --project-id "PVT_kwDOEFroms4BUmnd" \
  --id "$ITEM_ID" \
  --field-id "PVTF_lADOEFroms4BUmndzhCFmKQ" \
  --date "{start_date}"

gh project item-edit \
  --project-id "PVT_kwDOEFroms4BUmnd" \
  --id "$ITEM_ID" \
  --field-id "PVTF_lADOEFroms4BUmndzhCFmKU" \
  --date "{end_date}"
```

On error → warning only, issue creation is preserved.

### Output Results

```
✅ Issue creation complete

  [FE] [#{n} {title}]({url}) → Assignee: {assignee}
       Tracking: {spec_screen} / WBS {wbs_id} / Parent #{parent}
  {if Both}
  [BE] [#{n} {title}]({url}) → Assignee: {assignee}
       API: {method} {path}
       🔗 FE↔BE cross-link complete
  {/if}

  📅 {start_date} ~ {end_date}  |  Sprint: {milestone}
```

---

## Completion

After creation or cancellation → load `./step-04-update-docs.md`.
