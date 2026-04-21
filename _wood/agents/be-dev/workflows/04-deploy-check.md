<!-- AI-PROTECTED-FILE v1.0 -->

# BE Workflow 04 — Deploy Check

> **Purpose:** Verify configuration, environment, and dependencies before deployment
> **Trigger:** Before PR creation, or selected directly from menu

---

## Step 1 — Configuration Verification

```bash
# Check application.yaml changes
git diff main..HEAD -- '**/application*.yaml' '**/application*.yml'

# .env changes
git diff main..HEAD -- '**/.env*'

# build.gradle / pom.xml changes
git diff main..HEAD -- '**/build.gradle' '**/pom.xml'
```

```
## Deploy Configuration Verification

| Item | Status |
|------|--------|
| application.yaml | {changed/unchanged} |
| .env.example | {in sync/⚠️ mismatch} |
| Build dependencies | {changed/unchanged} |
| DB migration | {present/none} |
| Port configuration | {verified} |
| CORS domain | {verified} |
```

---

## Step 2 — Per-Environment Verification

```
| Check | Item | dev | prod |
|-------|------|-----|------|
| {✅/❌} | DB connection | {verified} | {needs verification} |
| {✅/❌} | OAuth redirect URI | {localhost:3000} | {prod URL configured?} |
| {✅/❌} | JWT secret | {dev key} | {env separated?} |
| {✅/❌} | CORS origin | {localhost} | {prod domain?} |
```

---

## Step 3 — Recommendation

```
{if issues_found}
  A. Fix configuration issues
  B. Update docs/be/deploy.md
  C. Sync .env.example

  Blunt recommendation: A — Incorrect deploy config will cause production outages.
{else}
  ✅ Deploy configuration is healthy.

  A. Update docs/be/deploy.md
  B. Return to dashboard
{/if}
```

STOP and WAIT.

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21
