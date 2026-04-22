---
step: 3
title: "Confirm rollback plan"
nextStep: "./step-04-report.md"
---

# Step 03 — Rollback Plan

```
## Rollback Plan

Up migration: {file}
Down migration: {file or "❌ missing — needs to be added"}

{if down_missing}
  ⚠️ Down migration is missing.
  Manual recovery procedures will be needed if production fails.

  A. Create down migration
  B. Document manual recovery procedure only
  C. Later (accept risk)

  Candid recommendation: A — without rollback in a production incident, you face service outage.
{/if}

### Data backfill

{if new_not_null_column}
  Logic to populate existing data for the new NOT NULL column is needed:
  
  ```sql
  UPDATE {table} SET {column} = {default} WHERE {column} IS NULL;
  ```
  
  Did you include this query in the migration? [Y/N]
{/if}
```

STOP and WAIT.

→ step-04 report.
