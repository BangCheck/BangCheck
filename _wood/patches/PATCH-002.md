# PATCH-002 — Commit Convention Format

**Date:** 2026-04-22
**Author:** @Woo-JongHo

---

## Summary

Changed the commit message format from `type: description` to `[type] : 한글 설명`.
Standardizes bracket-wrapped type and enforces Korean subject line.

## Target File

`_wood/workflows/_coding-guide.md`

## What Changed

- **Format:** `type: description` → `[type] : 한글 설명 (<50자)`
- **Type table descriptions:** translated to Korean
- **Examples:** updated to reflect new format
- Bad examples updated to flag missing bracket format as an error

## Template Notes

- The bracket format `[type]` is team convention — apply to 00_bmad as the new default
- Korean subject line requirement is SWYP-specific (Korean-first product) — **mark as optional in 00_bmad**, configurable per team
