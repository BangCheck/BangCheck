---
name: step-04-stale-pr
description: "Detect Stale PRs"
nextStepFile: "./step-05-focus.md"
---


# Step 04 — Detect Stale PRs

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Detect Stale PRs

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE A FACILITATOR — guide the user, never act autonomously
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## CONTEXT BOUNDARIES

- Data sources: GitHub Issues API + PR API + recent activity
- Scope: This step only — do not pre-fetch data for future steps
- Dependencies: previous step output must be complete before proceeding

## MANDATORY SEQUENCE

### 4-1. Load SLA Threshold

```bash
SLA=$(yq '.global_defaults.review_sla_hours' _wood/milestone-meta.yaml)
```

---

### 4-2. Stale PR Filter

```bash
gh pr list --repo $REPO --state open \
  --json number,title,author,createdAt,updatedAt,reviews \
  | jq --argjson sla "$SLA" '
    .[] | select(
      (now - (.updatedAt | fromdateiso8601)) / 3600 > $sla
    )'
```

---

### 4-3. Render

```
⏰ Stale PRs ({count} items) — exceeded review SLA of {SLA}h

- [PR #{n} {title}]({url}) — [{author}]({profile}), waiting {hours}h
  Reviewer: [{reviewer}]({profile}) or "unassigned"
  [🌐 PR]({url})  [💬 Nudge reviewer →]

(If none: ✅ No stale PRs)
```

---

## Completion

Save stale PR data → load `./step-05-focus.md`.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- GitHub CLI command executed and output displayed
- Output rendered in the exact specified format
- Routed correctly to `./step-05-focus.md`

### ❌ FAILURE
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Rendering with missing or partial data — wait for complete data first
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
