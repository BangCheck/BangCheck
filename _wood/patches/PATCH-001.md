# PATCH-001 — Admin Action Detection Rule (Rule 8)

**Date:** 2026-04-22
**Author:** @Woo-JongHo

---

## Summary

Added Rule 8 to the AI execution protocol. When an AI assistant detects a situation
requiring an Admin action or convention change, it should gently offer to create a
GitHub issue rather than blocking or silently proceeding.

## Target File

`_wood/workflows/_protocol.md`

## What Changed

- Added **Rule 8 — Admin Action Detection (Soft Suggestion)** section
- Defines detection triggers (convention changes, team member registration, protected file edits, permission policy changes, recurring friction)
- Specifies soft conversational tone for suggestions (no abrupt Y/N gates)
- Routes to `swyp-issue improvement` flow when user accepts
- Does not re-prompt in the same session if user declines

## Template Notes

- Fully generic — no BangCheck-specific content
- `swyp-issue improvement` handler reference is template-compatible
- Project board number (`2`) in the flow is BangCheck-specific → **parameterize in 00_bmad**
