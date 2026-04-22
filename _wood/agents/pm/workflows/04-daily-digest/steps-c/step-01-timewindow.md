---
name: step-01-timewindow
description: "Set Query Time Window"
nextStepFile: "./step-02-fetch.md"
---


# Step 01 — Set Query Time Window

READ THIS ENTIRE FILE before executing any action.

---


## YOUR TASK

Set Query Time Window

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

### 1-1. Time Window Selection Menu

```
Select the query time window:

[1] Since yesterday (24h) — default
[2] Last 3 days
[3] Last week
[4] Custom date input (e.g., 2026-04-18)

Number: (Enter = default 24h)
```

STOP and WAIT for user input. If no input, apply 24h default.

---

### 1-2. Set SINCE Variable

```bash
# 24h default
SINCE_ISO=$(date -u -v-24H +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null \
          || date -u -d '24 hours ago' +"%Y-%m-%dT%H:%M:%SZ")

# 3 days
SINCE_ISO=$(date -u -v-72H +"%Y-%m-%dT%H:%M:%SZ" ...)

# 1 week
SINCE_ISO=$(date -u -v-7d +"%Y-%m-%dT%H:%M:%SZ" ...)

# Custom
SINCE_ISO="{user_input}T00:00:00Z"
```

---

## Completion

Save `{SINCE_ISO}` → load `./step-02-fetch.md`.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- Routed correctly to `./step-02-fetch.md`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
