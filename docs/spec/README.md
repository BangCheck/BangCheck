<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# SWYP Functional Specification

> Source of truth for product requirements.
> File-level version control — new versions create **new files** (not additional sheets).

---

## Files

| Version | File | Status | Published |
|---------|------|--------|-----------|
| **v2.1.1** | `functional-spec-v2.1.1.xlsx` | Current (working) | 2026-04-16 |
| v2.1 | `functional-spec-v2.1.xlsx` | Baseline (archived) | 2026-04-10 |

---

## Versioning Policy

### New version = new file

```
File naming convention: functional-spec-v{major}.{minor}.{patch}.xlsx

- major: Service structure/scope changed
- minor: Page added/removed, major feature added
- patch: Field added/changed, text correction
```

### Bump rules

| Change | Bump |
|--------|------|
| Service redefinition / major pivot | **major** (v2.x → v3.0) |
| Page added/removed | **minor** (v2.1 → v2.2) |
| Field/action change, typos | **patch** (v2.1 → v2.1.1) |

### Archival

- Previous versions are **never deleted** — history preservation
- Diffs between versions can be checked with file comparison tools
- Issues linked to each version are traceable

---

## Sheet Structure (based on v2.1.1)

| Sheet | Purpose |
|-------|---------|
| `기늠 명세서_v2.1.1` | Latest working functional spec (main sheet) |
| `핵심 기능 상세 설명서_v2.1` | Detailed feature descriptions |
| `Q&A` | Discussion history |
| `체크리스트 항목` | User checklist data |
| `IA` | Information architecture |

### Main Sheet Columns (14)

| Column | Field |
|--------|-------|
| A | Screen ID (SCR-*) |
| B | Screen Name |
| C | Section |
| D | Feature ID (SCR-*-001) |
| E | Status (Common/In Development/Complete) |
| F | Field Name |
| G | Input |
| H | Action (Condition/Logic) |
| I | Output |
| J | Type |
| K | Exception Handling |
| L | Scale |
| M | Priority (Highest/High/Medium/Low) |
| N | Feasibility |

---

## Integration with Workflows

### Issue creation

- See `_wood/workflows/02-project.md` Case 2
- Screen (page) from functional spec → GitHub page issue
- Feature ID → tracking key for sub-issues

### Progress analysis

- Analysis source for `_wood/agents/pm/workflows/03-progress.md`
- Cross-reference issue checklists with spec items

---

## Editing Process

Spec changes are Admin/PM only. Regular users can only suggest.

### Admin/PM editing

1. Edit locally (e.g., modify v2.1.1.xlsx)
2. Determine version bump based on change nature
3. If new version, create **new file** (`cp` + rename):
   ```bash
   cp functional-spec-v2.1.1.xlsx functional-spec-v2.1.2.xlsx
   # edit...
   ```
4. Update the table in this README
5. Create PR — Admin review required per CODEOWNERS

### Non-admin suggestion

1. Submit change request as GitHub issue (`유형:개선`)
2. Specify "spec change suggestion" in body
3. Admin reviews and edits directly

---

## Forbidden

- Do not add new versions as new sheets in the same file (file-level policy)
- AI must not auto-modify specs (human-only)
- Do not delete previous version files (history preservation)
- Do not ignore file naming convention (no variants like `spec-latest.xlsx`)

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
