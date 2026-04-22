---
step: 1
title: "Update issue API contract + notify FE"
mode: edit
---

# Edit — Update API Contract

## E1-1. Select Target Issue

```
Issue number containing the API contract to update: #___
```

STOP and WAIT.

## E1-2. Load Current API Contract

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

## E1-3. Input Changes

```
Fields to update (press Enter to keep current value):

  Endpoint: {current} → ___
  Request:  {current} → ___
  Response: {current} → ___
  Auth:     {current} → ___
```

STOP and WAIT.

## E1-4. Preview + Confirm

```
📋 API Contract Update Preview

  Before                          After
  {old_endpoint}                  {new_endpoint}
  {old_request}                   {new_request}
  {old_response}                  {new_response}

[Y] Update  [E] Revise  [N] Cancel
```

STOP and WAIT.

## E1-5. Update Issue Body + Notify FE

```bash
gh issue edit {number} --repo $REPO --body "$UPDATED_BODY"
```

If there is an FE integration issue:
```
🔗 Notify FE integration issue #{fe_issue} about the change?

[Y] Send comment (preview first)  [N] Skip
```

→ Return to dashboard after completion.
