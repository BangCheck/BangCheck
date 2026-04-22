# PATCH-003 — PM Init State Triggers

**Date:** 2026-04-22
**Author:** @Woo-JongHo

---

## Summary

Added project init state detection to the PM recommendation engine.
When no milestones and no issues exist, the engine now recommends starting
with the feature spec sync rather than showing a generic menu.

## Target Files

- `_wood/agents/pm/pm-actions.csv`
- `_wood/agents/pm/workflows/pm-recommend.md`

## What Changed

### pm-actions.csv

Added two new rows at priority 1 and 2:

| id | trigger | priority | label |
|----|---------|----------|-------|
| `project-init` | `milestone_count == 0 AND total_issue_count == 0` | 1 | Start with feature spec sync |
| `milestone-init` | `milestone_count == 0 AND total_issue_count > 0` | 2 | No sprint defined yet — set scope |

### pm-recommend.md

- Added `milestone_count` and `total_issue_count` variable collection in Step 1
- Added `init` category to the description generation rules table (English)

## Template Notes

- Logic is fully generic — no BangCheck-specific content
- `doc-sync` handler path is template-compatible
- Description strings are in English — ready for 00_bmad as-is
