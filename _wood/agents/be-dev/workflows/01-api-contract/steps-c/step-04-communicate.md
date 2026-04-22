---
step: 4
title: "FE comment + spec update"
nextStep: "./step-05-report.md"
---

# Step 04 — FE Communication + Spec Update

## 4-1. Write FE Comment

```
💬 Frontend Team Sharing Draft

Target: {FE integration issue #{fe_issue} or PR #{pr_number}}
Author: {USER_NAME}

Content (preview):
---
{if breaking}
@frontend please review ⚠️

This PR has **Breaking change(s)** ({breaking_count}):

{for each breaking:}
- `{method} {path}` — {description}
  before: {old_schema}
  after:  {new_schema}
{/for}

Please coordinate a simultaneous deployment schedule.
{elif deprecation}
@frontend migration notice

{for each deprecation:}
- `{old_endpoint}` → `{new_endpoint}`
  The existing API will be maintained for now; please migrate by {deadline}.
{/for}
{else}
@frontend new API addition notice 📢

{for each additive:}
- `{method} {path}` added — {description}
{/for}

Use as needed.
{/if}
---

[Y] Send  [E] Edit  [N] Cancel
```

STOP and WAIT. **_safety.md § Comment Safety required.**

---

## 4-2. Spec Update Check

```
This change needs to be reflected in docs/spec/ or docs/be/api-spec.md.

{if api_spec_exists}
  The {endpoint} entry currently {exists/does not exist} in api-spec.md.
  
  A. Update api-spec.md now
  B. Only add a "spec update needed" tag to the PR body
  
  Candid recommendation: A — docs should be updated alongside code so the next person is not confused.
{else}
  ⚠️ docs/be/api-spec.md does not exist yet.
  
  A. Create a draft now (based on _docs-map.yaml template)
  B. Later
  
  Candid recommendation: A — creating it now means it will be maintained going forward.
{/if}
```

STOP and WAIT.

→ step-05 report.
