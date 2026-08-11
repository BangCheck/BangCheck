<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow — Team Member Assignment Recommendation

> **Purpose:** Match unassigned issues to team members using label-based FE/BE classification and workload comparison.
> **Pattern:** BMAD catalog (team-roles.yaml) + state discovery (gh issue) + rule matching
> **Caller:** 07-pm-recommend.md (action: assign-recommend)

---

## Step 1 — Data Collection

### 1-1. Unassigned Issue List

```bash
REPO="BangCheck/BangCheck"

UNASSIGNED=$(gh issue list --repo $REPO --state open \
  --json number,title,labels,url --limit 50 | \
  jq '[.[] | select(.assignees | length == 0)]')
```

### 1-2. Team Member List + Roles

```bash
# Extract members from team-roles.yaml
# Each member: {login, name, role}
```

### 1-3. Current Open Issue Count per Member

```bash
# For each member in team-roles.yaml:
for LOGIN in $(members); do
  COUNT=$(gh issue list --repo $REPO --assignee "$LOGIN" --state open --json number --jq length)
  # store: {login, name, role, open_count}
done
```

---

## Step 2 — Issue-Role Classification

Determine FE/BE/Common based on each unassigned issue's labels:

| Label pattern | Classification |
|--------------|----------------|
| `프론트엔드`, `frontend`, `FE` | Frontend |
| `백엔드`, `backend`, `BE`, `API` | Backend |
| `디자인`, `design` | Design |
| None of the above | Common (both FE/BE are candidates) |

---

## Step 3 — Matching Recommendation Table Output

```
## 👤 Unassigned Issue Assignment Recommendations

### Team Status
| Member | Role | Current Load | Availability |
|--------|------|-------------|--------------|
| [{name}]({profile}) | {role} | {open_count} issues | {available/moderate/overloaded} |
| ... |

Availability criteria:
  0~3 issues: 🟢 Available
  4~6 issues: 🟡 Moderate
  7+ issues:  🔴 Overloaded

### Recommended Assignments

{for each unassigned issue:}

#### [{issue_icon}] #{number} {title}  [Shortcut]({url})
  Classification: {Frontend/Backend/Common}
  
  Recommended assignee: [{name}]({profile}) ({role}, currently {open_count} issues)
  Reason: {role matches and has the highest availability}
  
  Alternative: [{name2}]({profile}) ({open_count2} issues)

{/for}

---

Assign all at once?

[Y] Assign all as recommended above
[E] Review and assign one by one
[S] Select specific issues only
[B] Go back
```

STOP and WAIT for user input.

---

## Step 4 — Execution

### [Y] Bulk Assignment

```bash
# Preview first for each issue:
echo "Assigning as follows:"
echo "  #{n1} {title} → {assignee1}"
echo "  #{n2} {title} → {assignee2}"
echo ""
echo "Proceed? [Y/N]"
```

After confirmation:
```bash
gh issue edit {number} --add-assignee "{login}" --repo $REPO
```

### [E] Review One by One

For each issue:
```
#{number} {title}  [Shortcut]({url})
  Recommended: {name} ({role}, {open_count} issues)

  [Y] Assign as recommended
  [C] Choose a different member → enter member number
  [S] Skip
```

### [S] Select Specific Issues

```
Enter issue numbers (comma-separated):
```

Process only the entered issues using the [E] flow.

---

## Step 5 — Result Report

```
✅ Assignment Complete

| Issue | Title | Assigned To |
|-------|-------|-------------|
| #{n} | {title} | [{name}]({profile}) |
| ... |

Remaining unassigned: {remaining_count} issues
{if remaining > 0}
  → [A] Assign the rest too
  → [B] Return to PM dashboard
{else}
  → All issues have been assigned! 🎉
  → [B] Return to PM dashboard
{/if}
```

---

## 🔙 Return — Recommendation Loop Return (MANDATORY)

**Regardless of which path completes**, the following flow must be executed:

### Return Step 1 — Completion Summary

```
✅ {action_summary}
   (e.g., "5 issues assigned", "2 assigned, 3 skipped")
```

### Return Step 2 — State Change Detection + Next Recommendation

```
📊 State Change:
  Unassigned: {before_count} → {after_count} ({diff})

{if after_count > 0}
There are still {after_count} unassigned issues remaining.

  A. Assign the rest → re-run assign-recommend
  B. Check other tasks → re-evaluate pm-recommend
  C. Return to PM dashboard

  Recommendation: {A if after_count > 3, else B}
{else}
All issues have been assigned! 🎉

  A. Check other tasks → re-evaluate pm-recommend
  B. Return to PM dashboard

  Recommendation: A — Shall we check if there are other items needing attention?
{/if}
```

STOP and WAIT.

| Input | Action |
|-------|--------|
| `A` (assign rest) | Re-run this workflow from Step 1 |
| `A` or `B` (pm-recommend) | Re-run `07-pm-recommend.md` from Step 1 (re-collect state + re-evaluate) |
| `B` or `C` (dashboard) | Return to agent.md menu |

---

## ✅ Success Criteria

- Member lookup based on team-roles.yaml
- Automatic FE/BE classification based on labels
- Recommend the most available member via workload comparison
- [Shortcut] URL included for all issues
- Preview + user confirmation required before assignment

## ❌ Failure Criteria (MUST NOT)

- Recommend based on code analysis (PM does not read code)
- Auto-assign without user confirmation
- Omit GitHub URLs
- Recommend members not in team-roles.yaml

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-21
