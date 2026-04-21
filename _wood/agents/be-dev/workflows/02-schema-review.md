<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# BE Workflow 02 — Schema Review

> **Agent:** Backend Developer
> **Purpose:** Review DB schema / data model changes
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, Backend]`
- Schema/migration changes exist on the current branch

---

## 🎯 When to use

- Adding a new table
- Adding/removing columns
- Modifying indexes
- Before/after writing a migration
- When performance issues are suspected

---

## Step 1 — Detect schema changes

```bash
# Migration files
git diff --name-only main..HEAD | grep -Ei '(migration|schema|\.sql$|flyway|liquibase)'

# JPA/ORM entities (assuming Spring)
git diff --name-only main..HEAD | grep -E '(Entity\.java|@Entity|entities/)'

# Django models (assuming Python)
git diff --name-only main..HEAD | grep -E 'models\.py'
```

---

## Step 2 — Risk Checklist

### 2-1. Migration Safety

```
✓ Is it reversible? (down migration exists)
✓ No production data loss?
✓ DROP COLUMN / DROP TABLE → 2-phase deployment (deprecate → remove)
✓ Default provided when adding NOT NULL column?
✓ Index addition uses CONCURRENTLY (PostgreSQL) / ONLINE (MySQL)
```

### 2-2. Query Performance

```
✓ Index on WHERE clause columns?
✓ N+1 query risk? (review JOIN / fetch eager)
✓ Cursor-based pagination instead of OFFSET?
✓ LIKE 'foo%' is fine (leading wildcard cannot use index)
```

### 2-3. Data Integrity

```
✓ Foreign key constraints set
✓ ON DELETE / ON UPDATE policy specified
✓ Unique constraints (email, phone number, etc.)
✓ Check constraints (status enum, etc.)
```

### 2-4. Security

```
✓ Sensitive data (password) hashed column
✓ PII columns encrypted or masked
✓ Audit log (created_by, updated_by)
```

### 2-5. API Impact

```
✓ DTO / Serializer update needed?
✓ Reflected in OpenAPI spec?
✓ Is it a breaking change? → delegate to 01-api-contract.md
```

---

## Step 3 — Analysis Report

```markdown
🔍 Schema Review — {branch}

## Detected Changes
  Migration:     {count} files
  Entity:        {count} files
  Tables added:  {list}
  Columns added: {list}
  Items removed: {list}

## Risk Assessment

### ✅ Safe
  - add column with default ✓
  - Index using CONCURRENTLY ✓

### ⚠️ Caution
  - No unique constraint on `users.email` → duplicates possible
  - Large `orders` table — watch for lock during migration

### ❌ Fix Required
  - Missing FK on `profiles` table → `user_id` REFERENCES `users(id)` needed
  - `DROP COLUMN last_login` — phased removal recommended (deprecated first)

## Recommended Actions
  [1] Suggest auto FK addition → {file}:{line}
  [2] Generate 2-phase deployment plan (deprecate → remove)
  [3] Re-check API impact → 01-api-contract.md
  [4] Add migration notes to PR body
```

---

## Step 4 — Rollback Plan

If there is a migration, verify the rollback plan:

```markdown
## Rollback Plan

Up migration: {file}
Down migration: {file or "❌ Missing — needs to be added"}

### If Down is missing
- Document manual recovery procedure in case of production failure
- Or generate a down migration:
  ```sql
  -- Reverse of V001__add_profiles_table.sql
  DROP TABLE IF EXISTS profiles;
  ```

### Data backfill
- Logic to populate existing data into new columns?
- e.g. `UPDATE users SET display_name = email WHERE display_name IS NULL;`
```

---

## Step 5 — Team Communication

If a breaking change requires 2-phase deployment, share with BE+FE+PM:

```markdown
💬 Team Share Comment Draft

@frontend @Woo-JongHo

This PR requires a 2-phase schema deployment:

Phase 1 ({PR #{n}}): Add deprecated fields (no FE impact)
Phase 2 (next PR): Remove old fields (after FE migration is complete)

After Phase 1 merges, please begin switching to the new fields on the FE side.

[Y] Send  [E] Edit  [N] Cancel
```

---

## ✅ Success Criteria

- Actual migration file analyzed
- All 5 risk areas checked
- Rollback plan confirmed
- Team share proposed when breaking change detected

## ❌ Failure Criteria

- Changing schema without a migration file (untraceable)
- Approving missing down migration
- Ignoring missing FK/constraints
- Referencing fictitious files

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
