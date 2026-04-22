---
name: step-01-verify
description: "Compare issue API contract vs actual code"
---


# Validate — API Contract Verification


## YOUR TASK

Compare issue API contract vs actual code

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE AN AUDITOR — report findings accurately, never skip checks
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## MANDATORY SEQUENCE

### V1-1. Collect Issue API Contracts

```bash
# Parse API contract sections from backend-labeled issues
BE_ISSUES=$(gh issue list --repo $REPO --state open --label "backend" \
  --json number,title,body --limit 50)

# Extract ### API Contract table from each issue body
```

### V1-2. Extract Endpoints from Actual Code

```bash
# Spring Boot Controller patterns
grep -rn "@\(Get\|Post\|Put\|Delete\|Patch\)Mapping" backend/src/ | \
  sed 's/.*Mapping("\(.*\)").*/\1/' | sort -u

# Or Express/Nest patterns
grep -rn "router\.\(get\|post\|put\|delete\)" backend/src/ | head -30
```

### V1-3. Comparison Table

```
## 📊 API Contract vs Code Comparison

| Issue | Contract Endpoint | Exists in Code | Match |
|-------|-------------------|----------------|-------|
{for each issue with api contract:}
| #{n} {title} | {method} {path} | {✅ exists / ❌ not found} | {✅ / ⚠️ schema mismatch / ❌} |
{/for}

### Endpoints in code but not in issues
{for each unmatched code endpoint:}
  📁 {controller}:{line} — {method} {path} → ⚠️ not linked to issue
{/for}

## Verification Results

  Match:          {n}
  Mismatch:       {n}
  Unlinked:       {n} (exists in code but not in issues)
  Unimplemented:  {n} (exists in issues but not in code)
```

### V1-4. Recommendation

```
{if mismatch > 0 or unlinked > 0}
  A. Fix API contracts in mismatched issues → steps-e/step-01
  B. Create issues for unlinked endpoints → 02-project/case-03-task
  C. Record report only

  Candid recommendation: A — if contract and code diverge, FE may develop against the wrong spec.
{else}
  ✅ API contracts and code are in sync!
{/if}
```


> 🛑 **STOP** — Wait for user input before continuing.


→ Return to dashboard after completion.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Data parsed into structured format without errors
- GitHub CLI command executed and output displayed
- Output rendered in the exact specified format
- User input received at every STOP gate before proceeding

### ❌ FAILURE
- Empty or malformed response → report exact error, do not continue
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Rendering with missing or partial data — wait for complete data first
- Skipping a STOP gate and proceeding without user confirmation

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
