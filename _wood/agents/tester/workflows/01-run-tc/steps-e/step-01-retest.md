---
name: step-01-retest
description: "TC Result Edit (Retest)"
---


# Edit — TC Retest

### E1-1. Select target TC

```
Select a TC to retest:

{for each non-unchecked TC:}
  {status} {TC_ID}: {case_name}
    {if ❌} → bug #{bug_number} — {bug_status} {/if}
{/for}

Enter TC ID:
```


> 🛑 **STOP** — Wait for user input before continuing.


### E1-2. Re-execute

```
▶️ Retest: {TC_ID}: {case_name}

Previous result: {previous_status}
{if ❌}
  Linked bug: #{bug_number} ({bug_status})
  Has the bug been fixed?
{/if}

Scenario:
  {steps}

Expected result:
  {expected}

Result after re-execution:
[1] ✅ Pass (previously failed → now fixed)
[2] ❌ Still failing
[3] ⏭️ Change to Skip
```


> 🛑 **STOP** — Wait for user input before continuing.


### E1-3. Update

- Change TC status in issue body
- Update bug issue status (if ❌→✅, suggest closing the bug)
- Update progress summary

```
✅ Retest complete

  {TC_ID}: {old_status} → {new_status}
  {if bug_resolved} Close bug #{bug_number}? [Y/N] {/if}

  A. Retest another TC
  B. Return to dashboard

  Recommendation: {A if more retestable, else B}
```


> 🛑 **STOP** — Wait for user input before continuing.

