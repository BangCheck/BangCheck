---
name: step-03-analyze
description: "Diff analysis + impact table"
nextStepFile: "./step-04-communicate.md"
---


# Step 03 — Analyze Diff

```bash
git diff main..HEAD -- '{api_paths}' > /tmp/api_diff.txt
```

AI reads the diff and provides detailed analysis:

```
## API Change Analysis

### 🟢 Additive ({n})
- `POST /api/auth/refresh` (new)
  Reason for addition: access token renewal
- `GET /api/user/profile` response adds `displayName?: string` (optional)

### 🟡 Deprecation ({n})
- `GET /api/user/me` → migration to `GET /api/user/profile` recommended
  Deprecation date: {version}

### 🔴 Breaking ({n}) ⚠️
- `POST /api/auth/login` response structure changed
  before: `{ token: string, user: User }`
  after:  `{ accessToken: string, refreshToken: string, user: User }`
  Impact: FE token storage logic requires full revision
```

### Impact Summary

```
{if breaking_count > 0}
  ⚠️ {breaking_count} breaking change(s) — prior FE agreement required

  A. Write comment for FE → step-04
  B. Modify code first to reduce breaking changes
  C. Record analysis only, handle later

  Candid recommendation: A — the sooner breaking changes are communicated, the less team impact.
{elif deprecation_count > 0}
  🟡 {deprecation_count} deprecation(s) — FE information sharing recommended

  A. Write info-sharing comment for FE → step-04
  B. Record in PR body only
  
  Candid recommendation: A — migration timeline should be set early.
{else}
  ✅ Additive only — no FE impact. Recording in PR body is sufficient.

  A. Add API changes section to PR body → step-05
  B. Return to dashboard
{/if}
```


> 🛑 **STOP** — Wait for user input before continuing.


→ step-04 or step-05.
