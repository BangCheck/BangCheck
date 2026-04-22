<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# BE Workflow 01 — API Contract Check

> **Agent:** Backend Developer
> **Purpose:** Verify that API changes match FE expectations + detect breaking changes
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, Backend]`
- Assumes API-related changes exist on the current branch

---

## 🎯 Why this matters

Frontend developers write UI trusting your API.
If the API contract breaks, the entire team faces delays + risk of production incidents.

This workflow:
1. Auto-detects API changes
2. Classifies breaking changes
3. Generates a summary to share with the FE team

---

## Step 1 — Detect API changes

```bash
# Detect API-related file changes
git diff --name-only main..HEAD | grep -E '(controller|route|endpoint|api|handler|dto)'

# Or Spring Boot example (assumed)
git diff --name-only main..HEAD | grep -E '(Controller\.java|\.java|schema\.sql|OpenAPI)'

# OpenAPI/Swagger file changes
git diff main..HEAD -- '**/*.yaml' '**/*.yml' '**/openapi*' '**/swagger*'
```

### Detection Targets

| File Type | Impact |
|----------|------|
| Controller / Route | Endpoint added/modified/deleted |
| DTO / Model | Response structure changed |
| Schema (DB) | Indirect impact (field added/deleted) |
| OpenAPI spec | Official contract change |

---

## Step 2 — Classify changes

Classify each change into one of the following:

### 🟢 Additive (backward-compatible)

```
- New endpoint added
- Optional field added to response
- New enum value added (existing values preserved)
```

→ **No** FE impact. Information sharing only.

### 🟡 Deprecation (advance notice)

```
- Endpoint marked deprecated (functionality preserved)
- Field deprecated (still returned)
- Replacement endpoint provided
```

→ Need to share **migration timeline** with FE team.

### 🔴 Breaking (backward-incompatible)

```
- Endpoint deleted
- Endpoint URL changed
- Response field name changed
- Response field type changed
- Required field added (request)
- Error response format changed
```

→ **Prior agreement + simultaneous deployment plan** with FE team required.

---

## Step 3 — Analyze diff

AI reads the diff and classifies each change:

```bash
git diff main..HEAD -- '{api_paths}' > /tmp/api_diff.txt
```

Pass to AI for analysis in the following format:

```markdown
## API Change Analysis

### 🟢 Additive (2 items)
- `POST /api/auth/refresh` (new)
  Reason: access token renewal
- `GET /api/user/profile` response adds `displayName?: string` (optional)

### 🟡 Deprecation (1 item)
- `GET /api/user/me` → migration to `GET /api/user/profile` recommended
  Deprecation point: {version}
  Planned removal: {version}

### 🔴 Breaking (1 item) ⚠️
- `POST /api/auth/login` response structure changed
  before: `{ token: string, user: User }`
  after:  `{ accessToken: string, refreshToken: string, user: User }`
  Impact: FE token storage logic requires full rewrite
```

---

## Step 4 — FE communication draft

If breaking changes exist, show a preview comment to share with FE:

```markdown
💬 Frontend Team Share Draft

Target: [PR #{n}]({url})
Author: {USER_NAME} (self)

Content (preview):
---
@frontend please review ⚠️

This PR includes **1 Breaking change**:

- `POST /api/auth/login` response structure changed
- Impact: token storage logic requires modification

Please coordinate the simultaneous deployment schedule.

Details:
- [API Change Analysis section]
- [PR #{n}]({url})
---

[Y] Send  [E] Edit  [N] Cancel
```

**Comment safety rules (_safety.md § Comment Safety) must be followed.**

---

## Step 5 — Spec document update

Check if OpenAPI / xlsx spec needs to be updated:

```
This change needs to be reflected in docs/spec/functional-spec-*.xlsx.

Current version: {version}
Next version: {version+1}  (patch bump recommended)

How to update:
  1. Request spec update from Admin or PM
  2. Or edit the spec file yourself and create a PR
  
docs: [spec/README.md]({url})
```

---

## Step 6 — Report

```markdown
🔍 API Contract Check — {branch}

## Change Summary
  🟢 Additive:     {n} items
  🟡 Deprecation:  {n} items
  🔴 Breaking:     {n} items

## Assessment
  {icon} {overall_message}

  e.g. "⚠️ 1 Breaking change — prior agreement with FE required.
        Additive items can be handled with info sharing."

## Recommended Actions
  [1] Share Breaking change comment with FE team → Step 4
  [2] Request spec document update → Step 5
  [3] Add ⚠️ BREAKING CHANGE tag to PR body
  [4] Dismiss (confirmed no changes)
```

---

## ✅ Success Criteria

- Diff analysis based on actual files
- Classification is accurate (additive/deprecation/breaking)
- FE share comment previewed before sending
- Spec update necessity flagged

## ❌ Failure Criteria

- Missing breaking change
- Mentioning fictitious endpoints
- Auto-tagging FE team (without preview)
- Arbitrarily modifying spec

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
