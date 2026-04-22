---
name: step-01-detect
description: "Detect schema change files"
nextStepFile: "./step-02-risk.md"
---


# Step 01 — Detect Schema Changes

```bash
# Migration files
MIGRATIONS=$(git diff --name-only main..HEAD | grep -Ei '(migration|schema|\.sql$|flyway|liquibase)')

# JPA Entity
ENTITIES=$(git diff --name-only main..HEAD | grep -E '(Entity\.java|@Entity|entities/)')

# Repository
REPOS=$(git diff --name-only main..HEAD | grep -E 'Repository\.java')
```

```
## Schema Change Detection

| Type | Count | Details |
|------|-------|---------|
| Migration | {n} | {file list} |
| Entity | {n} | {file list} |
| Repository | {n} | {file list} |

{if all == 0}
  ✅ No schema changes.
  [B] Return to dashboard
{else}
  Changed entity summary:
  {for each entity file:}
    📁 {file} — {added/removed/modified fields}
  {/for}
  
  → Proceed to risk check
{/if}
```

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Routed correctly to `./step-02-risk.md`

### ❌ FAILURE
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
