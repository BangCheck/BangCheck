---
name: step-01-verify-erd
description: "Compare ERD document vs actual entities"
---


# Validate — ERD Verification

## V1-1. Load ERD Document

```bash
ERD_FILE="docs/be/erd.md"
[ -f "$ERD_FILE" ] && cat "$ERD_FILE" || echo "❌ ERD document not found"
```

## V1-2. Scan Actual Entities

```bash
# JPA Entity class list
grep -rn "@Entity" backend/src/ --include="*.java" -l | sort

# Extract fields from each Entity
for entity in $(entities); do
  grep -E "@Column|private .* \w+;" "$entity"
done
```

## V1-3. Comparison Table

```
## 📊 ERD vs Entity Comparison

| Table | ERD Document | Code Entity | Match |
|-------|-------------|-------------|-------|
{for each:}
| {table} | {✅ exists / ❌ missing} | {✅ exists / ❌ missing} | {✅ / ⚠️} |
{/for}

### Field Mismatches
{for each mismatch:}
  📁 {entity}:{line} — `{field}` → {exists/missing/type differs} in ERD
{/for}

## Results
  Match: {n}   Mismatch: {n}   ERD only: {n}   Code only: {n}

{if mismatch > 0}
  A. Update ERD document (based on code) → edit docs/be/erd.md
  B. Fix code (based on ERD) → development work
  C. Record report only

  Candid recommendation: A — typically code is the latest source of truth, so update the docs to match.
{else}
  ✅ ERD and code are in sync!
{/if}
```

STOP and WAIT.
