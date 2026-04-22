---
patch: "004"
title: "Sub-issue Detection Flow (FE/BE Agent)"
target_files:
  - "_wood/agents/fe-dev/agent.md"
  - "_wood/agents/be-dev/agent.md"
template_ready: "partial"
date: "2026-04-22"
---

# PATCH-004 — Sub-issue Detection Flow

## What Changed

Added `Step 1-B — Detection` to both FE and BE agent dashboards.

Three detection points run automatically after Step 1 (context collection):

| # | Trigger | Action |
|---|---------|--------|
| ① | Assigned screen issue has no sub-issues | Inform user. Do NOT auto-create. Offer template draft on request. |
| ② | API Contract change keywords in BE sub-issue comments | Notify linked FE sub-issue via comment |
| ③ | FE + BE sub-issues both closed | Suggest updating parent screen issue / notifying PM |

## Why

- PM creates screen-level issues (1 per screen) with feature checklists
- Developers create their own FE/BE sub-issue pairs
- Detection replaces manual tracking — AI surfaces the right action at the right time

## Template Notes

- **Generic**: Detection ① and ③ logic is project-agnostic → template-ready
- **BangCheck-specific**: Detection ② assumes FE/BE sub-issue pair structure and `issue-sub-fe/be.template.md` — requires adaptation per project
- Template should reference a `common/detection.md` stub rather than duplicating in both agents

## Files Added (BangCheck-specific)

- `_wood/templates/issue-screen.template.md` — screen-level issue (1 per screen, D열 섹션 grouping)
- `_wood/templates/issue-sub-fe.template.md` — FE sub-issue with API contract section
- `_wood/templates/issue-sub-be.template.md` — BE sub-issue with API contract + FE link
