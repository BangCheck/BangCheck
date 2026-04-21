<!-- AI-PROTECTED-FILE v1.0 -->

# BE Workflow 03 — Auth Flow Check

> **Purpose:** Verify the entire auth flow when OAuth/JWT/session-related changes are made
> **Trigger:** Recommended when auth changes detected in step-07-sync, or selected directly from menu

---

## Step 1 — Auth Change Detection

```bash
AUTH_FILES=$(git diff --name-only main..HEAD | grep -iE '(auth|oauth|jwt|token|session|security)')
```

Detection result + current auth flow summary:

```
## Auth Flow Status

  OAuth Provider: {Naver, Google}
  Token Strategy: {JWT + Refresh Token (DB)}
  Session: {Stateless}

  Changed files:
  {for each AUTH_FILES:}
    📁 {file} — {change summary}
  {/for}
```

---

## Step 2 — Flow Verification Checklist

```
| Check | Item | Result |
|-------|------|--------|
| {✅/❌} | OAuth authorization URL generated correctly | {analysis} |
| {✅/❌} | Callback handling (including state validation) | {analysis} |
| {✅/❌} | JWT issuance + Refresh Token storage | {analysis} |
| {✅/❌} | Token renewal (refresh flow) | {analysis} |
| {✅/❌} | Logout (Refresh Token deletion) | {analysis} |
| {✅/❌} | CORS configuration (FE domain allowed) | {analysis} |
| {✅/❌} | Protected endpoint auth filter | {analysis} |
```

---

## Step 3 — Recommendation

```
{if issues_found}
  A. Fix problematic items → code fix guidance
  B. Update docs/be/auth-flow.md
  C. Notify FE about auth changes

  Blunt recommendation: A — Auth issues are security concerns and must be fixed immediately.
{else}
  ✅ Auth flow is healthy.

  A. Update docs/be/auth-flow.md
  B. Return to dashboard

  Blunt recommendation: A — If there were changes, update the docs as well.
{/if}
```

STOP and WAIT.

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21
