---
step: 7
title: "Completion sync — issue checklist + Story status + FE↔BE comments"
nextStep: null
---

# Step 07 — Completion Sync

READ THIS ENTIRE FILE before executing any action.

**Principle:** GitHub Issue is the SSOT. This step syncs the issue checklist, Story status, and FE↔BE linkage.

---

## 7-1. Confirm Completed Items

```
## Completion Sync — #{issue_number} {issue_title}

Please confirm which items were completed in this session:

Issue checklist:
{for each undone_item from step-01:}
  [ ] {item_text}  ← completed this time? [Y/N]
{/for}
```

STOP and WAIT — user confirms completed items.

---

## 7-2. Update GitHub Issue Checklist

Reflect user-confirmed items in the issue body:

```bash
# Get current body
CURRENT_BODY=$(gh issue view {issue_number} --repo $REPO --json body --jq .body)

# Check completed items (- [ ] → - [x])
UPDATED_BODY=$(echo "$CURRENT_BODY" | sed 's/- \[ \] {completed_item}/- [x] {completed_item}/')

# preview
echo "Issue checklist update preview:"
echo ""
diff <(echo "$CURRENT_BODY") <(echo "$UPDATED_BODY") || echo "(no changes)"
echo ""
echo "[Y] Update  [N] Cancel"
```

STOP and WAIT.

```bash
gh issue edit {issue_number} --repo $REPO --body "$UPDATED_BODY"
```

---

## 7-3. Story Status Update

Update completed Story files' Status → done:

```bash
for story_file in $(completed_stories); do
  sed -i '' 's/| Status | in-progress/| Status | done/' "$story_file"
  # Add completion record to Story Log
  echo "| $(date +%Y-%m-%d) | Story completed |" >> "$story_file"
done
```

---

## 7-4. API Contract Finalization (BE issues only)

```
{if role contains "Backend" AND api_contract exists}

Did the API contract change during implementation?

[Y] Changed → update issue body API contract section + FE comment
[N] Same as draft → confirmation notice to FE only
[S] No API contract (not applicable)
```

STOP and WAIT.

### [Y] Changed

```
Enter the changed API contract:

Endpoint: {existing value}  → ___
Request:  {existing value}  → ___
Response: {existing value}  → ___

(Press Enter to keep existing value)
```

→ Update issue body API contract section
→ Comment on FE linked issue:

```
💬 FE Comment Preview

Target: #{fe_linked_issue}

Content:
---
⚠️ API Contract Change Notice

#{issue_number} {issue_title}

Changes:
  Before: {method} {path} → Response: {old_schema}
  After:  {method} {path} → Response: {new_schema}

Please review.
---

[Y] Send  [E] Edit  [N] Cancel
```

### [N] Same as Draft

Confirmation notice to FE linked issue:

```
💬 FE Comment Preview

Target: #{fe_linked_issue}

Content:
---
✅ API Contract Finalized

#{issue_number} {issue_title}
API: {method} {path}

Implementation completed as originally drafted. Please review once PR is up.
---

[Y] Send  [E] Edit  [N] Cancel
```

---

## 7-5. Sprint Status Update (personal + shared simultaneously)

Reflect completed Story/Issue in **both personal and shared** sprint-status simultaneously.

### 7-5a. Update Personal sprint-status

```bash
PERSONAL_DIR="_wood/workspace/_${USER_LOGIN}"
PERSONAL_SPRINT="$PERSONAL_DIR/sprint-status.yaml"

# Auto-create folder if missing
mkdir -p "$PERSONAL_DIR/stories" "$PERSONAL_DIR/epics"

if [ ! -f "$PERSONAL_SPRINT" ]; then
  # First entry — auto-create personal sprint-status
  cat > "$PERSONAL_SPRINT" << EOF
# Sprint Status
login: ${USER_LOGIN}
stories: []
EOF
  echo "📁 Personal sprint-status created: $PERSONAL_SPRINT"
fi

# Update story status: in-progress → done
# Find entry with matching story_id or issue number, set status: done
# If entry does not exist, append:
#   - story_id: {story_id}
#     issue: {issue_number}
#     branch: {branch_name}
#     status: done
#     started: {started_at or today}
#     completed: {today}
echo "📊 Personal sprint-status update:"
echo "  stories:"
echo "    {story_id}: in-progress → done"
```

### 7-5b. Personal Story File Status → done

```bash
# Update story files in personal workspace
for story_file in $(completed_stories); do
  sed -i '' 's/| Status | in-progress/| Status | done/' \
    "$PERSONAL_DIR/stories/$story_file"
  echo "| $(date +%Y-%m-%d) | Story completed |" >> "$PERSONAL_DIR/stories/$story_file"
done
```

### 7-5c. Update Shared sprint-status (SSoT)

```bash
SHARED_SPRINT="_wood/workspace/_shared/sprint-status.yaml"

if [ -f "$SHARED_SPRINT" ]; then
  # Update story → done in development_status
  # Recalculate epic progress (if all stories done → epic → done)
  
  echo "📊 Shared sprint-status update preview:"
  echo ""
  echo "  development_status:"
  echo "    {story_id}: in-progress → done"
  echo ""
  echo "  {if all_stories_in_epic_done}"
  echo "    {epic_id}: in-progress → done"
  echo "  {/if}"
  echo ""
  echo "  [Y] Update  [N] Skip"
fi
```

STOP and WAIT.

**Both locations must be updated so PM can check the shared sprint-status and assess overall team progress.**

---

## 7-6. FE↔BE Communication Proposal (MANDATORY on development completion)

When development is complete, propose specifically how to communicate with FE.

### 7-6a. Change Analysis

```bash
# Classify changes from this branch
CHANGED=$(git diff --name-only main..HEAD)

# BE change classification
API_CHANGED=$(echo "$CHANGED" | grep -E "Controller|Route|endpoint|api" | wc -l)
DTO_CHANGED=$(echo "$CHANGED" | grep -E "DTO|dto|Response|Request" | wc -l)
ENTITY_CHANGED=$(echo "$CHANGED" | grep -E "Entity|entity|model" | wc -l)
AUTH_CHANGED=$(echo "$CHANGED" | grep -E "Auth|OAuth|Jwt|Security" | wc -l)
CONFIG_CHANGED=$(echo "$CHANGED" | grep -E "application|config|\.env" | wc -l)
```

### 7-6b. Determine Communication Method

| Change Type | FE Impact | Communication Method |
|-------------|-----------|---------------------|
| API endpoint added | 🟢 None (starts when FE uses it) | Info share only — note in PR body |
| API endpoint changed | 🔴 Breaking | Comment on FE linked issue + ⚠️ in PR body |
| DTO field changed | 🟡 Possible impact | Comment on FE issue |
| Auth flow changed | 🔴 Full impact | Notify both PM + FE |
| DB only changed | 🟢 None | Update docs/be/erd.md only |
| Config only changed | 🟢 None | Update docs/be/deploy.md only |

### 7-6c. Communication Proposal Output

```
## FE Communication Proposal

{if API_CHANGED > 0 or DTO_CHANGED > 0}
  🔔 There are API changes. FE needs to be notified.

  A. Leave API finalization comment on FE linked issue (#{fe_issue})
     → include changed endpoint + request/response schema
  B. Add "⚠️ API Changes" section to PR body → FE checks during PR review
  C. Both (A+B)

  Recommendation: C — notify immediately via issue comment, and leave a record in PR for future tracking.

{elif AUTH_CHANGED > 0}
  🔴 Auth flow change. Both PM and FE need to know.

  A. Comment on both PM(@yekhong) + FE linked issue
  B. Note "⚠️ AUTH CHANGE" in PR body + request simultaneous deployment
  
  Recommendation: A — auth has full impact, prior agreement is essential.

{else}
  ✅ No FE impact from these changes. Just update docs.
{/if}
```

STOP and WAIT (only when FE impact exists).

### 7-6d. API Issue Sync

When API endpoint is changed/finalized, **also update the API contract section in the issue body**:

```bash
# Find ### API Contract section in issue body
CURRENT_BODY=$(gh issue view {issue_number} --repo $REPO --json body --jq .body)

if echo "$CURRENT_BODY" | grep -q "### API 계약"; then
  # Update existing API contract → finalized values
  # preview required
  echo "Issue #{issue_number} API contract update preview:"
  echo ""
  echo "Before: {old_endpoint} {old_schema}"
  echo "After:  {new_endpoint} {new_schema}"
  echo ""
  echo "[Y] Update  [N] Skip"
fi
```

→ Also reflect in docs/be/api-spec.md (handled in 7-7 document impact check)

---

## 7-7. Document Impact Check

Check if this change may impact docs/.

```bash
# Changed file list
CHANGED_FILES=$(git diff --name-only main..HEAD)

# Doc impact rules (refer to _DOCS-MAP.yaml)
# Controller/Route added → docs/architecture.md
# .env changed → docs/getting-started.md
# API endpoint changed → needs docs/spec/ update
# DB schema changed → docs/database.md
```

### If impact found:

```
📖 Documents that may be affected by this change:

  ⚠️ {doc_file} — {reason}

  Document updates are auto-checked during PR creation (05-pr.md Step 4.5).
  Update now?

  [Y] Update docs now → edit docs files
  [N] Handle together during PR creation (later)

  Recommendation: N — more efficient to handle all at once during PR stage.
        However, if API endpoint changed: Y — FE may already be working with the old spec.
```

### If no impact:

```
✅ No docs impact
```

---

## 7-8. Next Action Recommendation

```
✅ Sync complete

  Issue #{issue_number}: {done}/{total} checklist ({pct}%)
  Story: {completed_count}/{total_count} done
  {if api_comment_sent} FE link: comment sent to #{fe_issue} {/if}

{if all_checklist_done}
  🎉 All issue checklist items are complete!
  
  A. Commit → Create PR ⭐ (recommended)  → 04-commit.md → 05-pr.md
  B. Additional work (edge cases / test reinforcement)
  C. Return to dashboard
  
  Recommendation: A — everything is done, submitting a PR gets you a review sooner.

{elif remaining_count > 0}
  ☐ {remaining_count} incomplete items remaining:
  {for each remaining:}
    ☐ {item}
  {/for}

  A. Continue developing next item  → step-06-dev.md
  B. Stop here and commit only      → 04-commit.md
  C. Return to dashboard
  
  Recommendation: A — with {remaining_count} items left, continuing is more efficient.
{/if}
```

STOP and WAIT.

| Input | Action |
|-------|--------|
| `A` (commit→PR) | load `_wood/workflows/04-commit.md` → then `05-pr.md` |
| `A` (continue dev) | load `./step-06-dev.md` (next Story) |
| `B` | load `_wood/workflows/04-commit.md` |
| `C` | return to agent dashboard |

---

## ✅ Success Criteria

- GitHub Issue checklist reflects actual completion state
- Story file Status updated to done
- sprint-status.yaml reflects story/epic progress
- FE linked issue commented when API contract changed (preview required)
- Document impact check executed (guidance provided if impact found)
- Next action recommendation adapts to remaining work volume

## ❌ Failure Criteria

- Auto-checking issue checklist without user confirmation
- Sending FE comment without preview
- Checking items that are not actually completed
- Skipping sprint-status.yaml update (skip OK if file doesn't exist)
- Proceeding to PR without document impact check
- Deleting Story files
