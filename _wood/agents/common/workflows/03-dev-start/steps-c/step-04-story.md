---
step: 4
title: "Story creation → save to workspace/stories"
nextStep: "./step-05-branch.md"
---

# Step 04 — Story Creation

READ THIS ENTIRE FILE before executing any action.

---

## 4-1. Story Auto-Draft

Break down Stories based on code status (step-02) + facts (step-03) + incomplete issue checklist items:

```
## Story Breakdown — #{issue_number} {issue_title}

Based on incomplete issue items ({undone_count} items):

  └── Story 1: {implementation unit based on undone_item_1}
       AC: Given/When/Then
       Related files: {related_files}

  └── Story 2: {based on undone_item_2}
       AC: Given/When/Then
       Related files: {related_files}

  └── Story 3: Error handling / edge cases
       AC: Given/When/Then

{if api_contract}
  └── Story N: API contract verification
       AC: Given API call When {endpoint} Then returns {response_schema}
{/if}
```

---

## 4-2. Preview Confirmation

```
📋 Story Preview

{above draft}

[Y] Save  [E] Edit  [S] Add story  [N] Skip (do not save)

Selection:
```

STOP and WAIT.

---

## 4-3. Save to Personal Workspace (when Y is selected)

**Use the _story-template.md format.**
**Save path: personal workspace → `_wood/workspace/_{USER_LOGIN}/stories/`**

```bash
PERSONAL_DIR="_wood/workspace/_${USER_LOGIN}"
STORIES_DIR="$PERSONAL_DIR/stories"
EPICS_DIR="$PERSONAL_DIR/epics"

# Auto-create folders if missing
mkdir -p "$STORIES_DIR" "$EPICS_DIR"

# Epic number → extract from issue's Parent page, use issue number if unavailable
EPIC_NUM={parent_page_number or issue_number}

for i in 1 2 3 ...; do
  FILENAME="e${EPIC_NUM}-s0${i}-{slug}.md"
  
  # Fill and save based on _story-template.md
  cat > "$STORIES_DIR/$FILENAME" << EOF
# E${EPIC_NUM}-S0${i} — {story_title}

## Metadata

| Field | Value |
|---|---|
| Epic | E${EPIC_NUM} — {epic_title} |
| Story | S0${i} |
| GitHub Issue (Epic) | #${EPIC_NUM} |
| GitHub Issue (Task) | #{issue_number} |
| Screen ID | {spec_screen or "N/A"} |
| Status | ready |
| Assignee | ${USER_LOGIN} |

---

## Goal

{story_goal}

---

## Scope

### In
{in_scope}

### Out
{out_scope}

---

## Acceptance Criteria

\`\`\`
{given_when_then}
\`\`\`

---

## Implementation Hints

{if api_contract}
- API: {method} {path}
- Request: {request_schema}
- Response: {response_schema}
{/if}
- Related files: {related_files}

---

## Definition of Done

- [ ] AC above are met
- [ ] GitHub Issue #{issue_number} checklist item checked
- [ ] PR created with \`Closes #{issue_number}\`
- [ ] No console errors / lint warnings
- [ ] Reviewed and merged

---

## Story Log

| Date | Note |
|---|---|
| {today} | Story created from #{issue_number} |
EOF
done
```

```
✅ Story saved — _wood/workspace/_{USER_LOGIN}/

  📁 stories/e{ep}-s01-{slug}.md
  📁 stories/e{ep}-s02-{slug}.md
  ...
```

---

## Completion

Save complete or skipped → load `./step-05-branch.md`.
