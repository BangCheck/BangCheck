---
name: step-01-update-contract
description: "Update issue API contract + notify FE"
---


# Edit — Update API Contract


## YOUR TASK

Update issue API contract + notify FE

## MANDATORY EXECUTION RULES

### Universal Rules
- 📖 Read this entire file before taking any action
- 🎯 YOU ARE AN EDITOR — modify only what user confirms, never auto-apply
- 🛑 NEVER fabricate command output or API data
- 🚫 Do NOT proceed past a STOP gate without user input

## MANDATORY SEQUENCE

### E1-1. Select Target Issue

```
Issue number containing the API contract to update: #___
```


> 🛑 **STOP** — Wait for user input before continuing.


### E1-2. Load Current API Contract

```bash
gh issue view {number} --repo $REPO --json body --jq .body
# Parse "### API Contract" section from body
```

```
Current API Contract:
  Endpoint: {method} {path}
  Request:  {request_schema}
  Response: {response_schema}
  Auth:     {auth}
```

### E1-3. Input Changes

```
Fields to update (press Enter to keep current value):

  Endpoint: {current} → ___
  Request:  {current} → ___
  Response: {current} → ___
  Auth:     {current} → ___
```


> 🛑 **STOP** — Wait for user input before continuing.


### E1-4. Preview + Confirm

```
📋 API Contract Update Preview

  Before                          After
  {old_endpoint}                  {new_endpoint}
  {old_request}                   {new_request}
  {old_response}                  {new_response}

[Y] Update  [E] Revise  [N] Cancel
```


> 🛑 **STOP** — Wait for user input before continuing.


### E1-5. Update Issue Body + Notify FE

```bash
gh issue edit {number} --repo $REPO --body "$UPDATED_BODY"
```

If there is an FE integration issue:
```
🔗 Notify FE integration issue #{fe_issue} about the change?

[Y] Send comment (preview first)  [N] Skip
```

→ Return to dashboard after completion.

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- Data parsed into structured format without errors
- GitHub CLI command executed and output displayed
- User input received at every STOP gate before proceeding

### ❌ FAILURE
- Empty or malformed response → report exact error, do not continue
- CLI error or HTTP 4xx/5xx → report exact stdout/stderr, STOP
- Skipping a STOP gate and proceeding without user confirmation

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
