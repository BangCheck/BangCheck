<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Recommend Engine

> **Purpose:** Collect GitHub status and dynamically recommend actions from the pm-actions.csv catalog based on matching trigger conditions.
> **Pattern:** BMAD help.md (catalog + artifact discovery + rule-based routing)
> **Caller:** agent.md dashboard, step-03-render.md attention items

---

## 🛡️ Design Principles

1. **Catalog-driven** — Choices are dynamically generated from `pm-actions.csv`, not hardcoded
2. **Trigger evaluation** — Evaluate condition expressions against collected state variables, extract only matching actions
3. **Priority sorting** — Lower number = more urgent. Top 3 displayed as A/B/C
4. **Handler linking** — Every choice is guaranteed to have an executable workflow path (no dead links)
5. **[Shortcut] included** — GitHub URL always included for issues/PRs in context_var

---

## Step 1 — State Collection

Use variables already collected from the dashboard or step-03-render.
If any variables are missing, supplement here:

```bash
REPO="SWYP-Backend/project"

# Blockers
BLOCKER_ISSUES=$(gh issue list --repo $REPO --label "상태:블로킹" --state open \
  --json number,title,assignees,createdAt,url --limit 10)
blocker_count=$(echo "$BLOCKER_ISSUES" | jq length)
blocker_max_days=$(echo "$BLOCKER_ISSUES" | jq '[.[] | ((now - (.createdAt | fromdateiso8601)) / 86400 | floor)] | max // 0')

# Unassigned
UNASSIGNED_ISSUES=$(gh issue list --repo $REPO --state open \
  --json number,title,labels,assignees,url --limit 50 | jq '[.[] | select(.assignees | length == 0)]')
unassigned_count=$(echo "$UNASSIGNED_ISSUES" | jq length)

# D-day
dday=$(( ( $(date -j -f "%Y-%m-%d" "2026-05-09" +%s 2>/dev/null || date -d "2026-05-09" +%s) - $(date +%s) ) / 86400 ))

# Milestone anomaly detection
MILESTONES=$(gh api repos/$REPO/milestones --jq '.[] | {title, state, open_issues, closed_issues, due_on, html_url}')
# state=open but open_issues=0 → completed but not closed
milestone_stale_count=$(echo "$MILESTONES" | jq -s '[.[] | select(.state == "open" and .open_issues == 0 and .closed_issues > 0)] | length')
# due_on is null for open milestones
milestone_no_due_count=$(echo "$MILESTONES" | jq -s '[.[] | select(.state == "open" and .due_on == null)] | length')

# PR status
ALL_PRS=$(gh pr list --repo $REPO --state open \
  --json number,title,author,labels,reviewRequests,reviews,body,createdAt,url --limit 20)

# PR classification
pr_violation_count=$(echo "$ALL_PRS" | jq '[.[] | select(.labels[]?.name == "compliance-violation")] | length')
pr_no_reviewer_count=$(echo "$ALL_PRS" | jq '[.[] | select(.reviewRequests | length == 0)] | length')
pr_stale_count=$(echo "$ALL_PRS" | jq '[.[] | select(.reviews | length == 0) | select(((now - (.createdAt | fromdateiso8601)) / 3600) > 48)] | length')

# PR incomplete checklists
pr_unchecked_count=0
for body in $(echo "$ALL_PRS" | jq -r '.[].body // ""' | base64); do
  unchecked=$(echo "$body" | base64 -d | grep -c '^\s*- \[ \]' || true)
  [ "$unchecked" -gt 0 ] && pr_unchecked_count=$((pr_unchecked_count + 1))
done

# Project init state
milestone_count=$(gh api repos/$REPO/milestones --jq 'length' 2>/dev/null || echo 0)
total_issue_count=$(gh issue list --repo $REPO --state open --json number --limit 1000 | jq length 2>/dev/null || echo 0)

# GDrive
gdrive_alert=""  # Check docs/spec/ directory — empty string if absent
```

---

## Step 2 — Catalog Load + Trigger Evaluation

```
Load: pm-actions.csv (../pm-actions.csv)

For each row in CSV:
  1. Parse trigger column as condition expression
  2. Evaluate against collected state variables
  3. If TRUE → add to matched_actions list with {id, priority, label, handler, context_var, icon}
  4. If FALSE → skip

Sort matched_actions by priority ASC (lowest number = highest urgency)
```

---

## Step 3 — Dynamic Recommendation Output

### Case A: matched_actions exist

Show top 3 as A/B/C, remainder as [M] show more:

```
{top_action.icon} {situation summary sentence — natural description per category}

  A. {matched_actions[0].label}  [Shortcut]({context_item_url})
  B. {matched_actions[1].label}  [Shortcut]({context_item_url})
  C. {matched_actions[2].label}  [Shortcut]({context_item_url})
  
  {if matched_actions.length > 3}
  [M] Show more — {remaining_count} additional suggestions
  {/if}
  
  Recommendation: {recommend_letter} — {reason: priority-based + situation analysis}
  Suggestion: {complementary suggestion: why combining with the 2nd-priority action is beneficial}
```

### Case B: Only all-clear matched

```
✅ The team is running smoothly! 🚀
Nothing requires special attention. What would you like to start with?
```

→ Return to menu

### Description Generation Rules

Generate natural introductory sentences per category:

| category | Introductory sentence pattern |
|----------|-------------------------------|
| init (no milestone & no issue) | "아직 프로젝트가 시작 전이에요. 기능명세서를 연동해서 첫 스프린트를 열어볼까요?" |
| init (no milestone, issues exist) | "이슈는 있는데 마일스톤(스프린트)이 없어요. 범위를 정리해볼까요?" |
| pr (violation) | "There are {count} PRs with the compliance-violation label. They need review before merge." |
| blocker | "There are {count} blocking issues, stalled for {max_days} days." |
| pr (stale) | "There are {count} PRs waiting for review for over {hours} hours." |
| assign | "{count} issues are drifting without an assignee." |
| pr (no-reviewer) | "There are {count} PRs with no reviewer assigned." |
| pr (incomplete) | "There are {count} PRs with incomplete checklists." |
| docs | "It looks like the spec was recently modified." |

**When multiple categories match simultaneously:**
Show the introductory sentence for the highest-priority category first, then naturally merge the rest into A/B/C labels.

---

## Step 4 — Input Handling

STOP and WAIT for user input.

| Input | Action |
|-------|--------|
| `A` | Load matched_actions[0].handler. Pass context_var data along |
| `B` | Load matched_actions[1].handler |
| `C` | Load matched_actions[2].handler |
| `M` | Display all remaining actions → select by number → load corresponding handler |
| `X` | Return to PM dashboard menu |
| Number (menu) | Delegate to PM agent.md menu handler |
| Free input | Load `00-elicit.md` |

### Context Passing on Handler Load

Data to pass to the handler:
```
{action_id}: Selected action ID
{context_items}: List of issues/PRs matching the trigger (number, title, url, assignees, labels)
{source}: "pm-recommend" (call origin)
```

---

## Step 5 — Return

After handler workflow completion:
1. Re-collect state (Step 1)
2. Re-evaluate catalog (Step 2)
3. If changes detected, show new recommendations; otherwise return to dashboard menu

---

## ✅ Success Criteria

- Actions are dynamically generated from pm-actions.csv
- All A/B/C choices have linked handlers that are executable
- Most urgent items are recommended first in priority order
- [Shortcut] URLs are included for all issues/PRs
- Recommendations automatically update when the situation changes

## ❌ Failure Criteria (MUST NOT)

- Output hardcoded A/B/C choices (must be dynamically generated from CSV)
- Display choices without handlers (dead links)
- Fabricate state data (use only live GitHub data)
- Show warnings when all-clear

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21
