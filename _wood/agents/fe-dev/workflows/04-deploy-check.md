<!-- AI-PROTECTED-FILE v1.0 -->

# FE Workflow 04 — Deploy Check

> **Purpose:** Pre-deployment build/environment/SEO/performance verification

---

## Step 1 — Build Verification

```bash
# Build success check
cd frontend && npm run build 2>&1 | tail -20

# TypeScript errors
npx tsc --noEmit 2>&1 | tail -10

# Lint
npm run lint 2>&1 | tail -10
```

```
| Item | Status |
|------|--------|
| Build | {✅ Success / ❌ Failed} |
| TypeScript | {✅ No errors / ❌ {n} error(s)} |
| Lint | {✅ Passed / ⚠️ {n} warning(s)} |
```

---

## Step 2 — Environment + SEO

```
| Item | Status |
|------|--------|
| .env.example sync | {✅ / ⚠️} |
| API base URL | {dev/prod separation confirmed} |
| OG meta tags | {present/absent} |
| robots.txt | {present/absent} |
| sitemap | {present/absent} |
```

---

## Step 3 — Recommendation

```
{if build_failed}
  ❌ Build failed — deployment not possible

  A. Fix build errors
  B. Return to dashboard

  Blunt recommendation: A — Nothing works if it doesn't build.
{elif warnings > 0}
  ⚠️ Deployable but with warnings

  A. Fix warning items then deploy
  B. Ignore warnings and proceed with deployment
  C. Return to dashboard

  Blunt recommendation: A — Ignoring warnings now leads to bigger problems later.
{else}
  ✅ Ready for deployment!

  A. Create PR → 05-pr.md
  B. Return to dashboard
{/if}
```

STOP and WAIT.

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21
