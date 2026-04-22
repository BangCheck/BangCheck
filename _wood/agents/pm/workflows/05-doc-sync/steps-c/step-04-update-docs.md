---
name: step-04-update-docs
description: "Update Google Docs Completion Status"
nextStepFile: "./step-05-menu.md"
---


# Step 04 — Update Google Docs Completion Status

READ THIS ENTIRE FILE before executing any action.

---

### 4-1. Collect Completed Issues

Based on `{completed_items}` from step-02 + additional query:

```bash
# Recently closed issues (유형:작업)
gh issue list --repo $REPO --state closed \
  --label "유형:작업" \
  --json number,title,closedAt,assignees,milestone \
  --limit 50
```

---

### 4-2. Select Target Document for Update

```
Select the Google Docs progress sheet:
(Search keywords: "SWYP Development Progress" OR "sprint progress")

  [1] {title} — {last_modified}
  [2] {title} — {last_modified}

Number:
```


> 🛑 **STOP** — Wait for user input before continuing.


---

### 4-3. Update Content Preview (MANDATORY)

```
📝 Google Docs Update Preview

Document: {doc_title}

Items to add/modify ({n} items):
| Screen | Feature | Status | Completion Date | Assignee |
|--------|---------|--------|----------------|----------|
| SCR-HOME | Room card list | ✅ Complete | 2026-04-20 | {assignee} |
| SCR-AUTH | Email login | ✅ Complete | 2026-04-19 | {assignee} |

[Y] Update  [E] Edit  [N] Cancel
```


> 🛑 **STOP** — Wait for user input before continuing.


---

### 4-4. Update Docs (When Y is Selected)

Update the target sheet/document using MCP `google-drive` tools:

```
updateGoogleSheet / updateGoogleDoc
→ Update status field for completed items
→ Fill in completion date and assignee
```

```
✅ Google Docs update complete
  [🌐 View document]({doc_url})
```

---

## ❌ Strictly Prohibited

- Auto-updating without preview
- Arbitrarily modifying specification content
- Marking incomplete items as complete

---

## Completion

After update or cancellation → load `./step-05-menu.md`.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Data read successfully from MCP/API
- GitHub CLI command executed and output displayed
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-05-menu.md`

### ❌ FAILURE
- MCP not authenticated or unavailable → STOP, guide user to connect
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
