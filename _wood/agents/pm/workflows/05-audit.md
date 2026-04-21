<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# PM Workflow 05 — Compliance Audit

> **Agent:** PM
> **Purpose:** Detect infrastructure bypasses and track team convention compliance
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, PM]`
- GitHub Actions `compliance-guard.yml` must be active to be meaningful

---

## 🎯 What this workflow does

While `compliance-guard.yml` detects in real time at the **PR level**,
this workflow analyzes from an **aggregation/history perspective**:

1. Weekly/monthly compliance rate report
2. Repeated violation pattern detection
3. Per-violator coaching suggestions
4. Data basis for rule revision

---

## Step 1 — Time Window

```
Select analysis period:
[1] Last 7 days (weekly)
[2] Last 30 days (monthly)
[3] Current sprint (active milestone period)
[4] Custom
```

Save as `SINCE` variable.

---

## Step 2 — Fetch PR history

```bash
# REPO is set from _core.md § Environment Guard

# Query both merged + open PRs
gh pr list --repo $REPO --state all \
  --search "updated:>=$SINCE" \
  --json number,title,author,state,mergedAt,labels,body,createdAt \
  --limit 100
```

Analyze labels per PR:
- `compliance-violation` → error occurred
- `compliance-warning` → warning occurred
- Neither → passed

---

## Step 3 — Aggregate

### 3-1. Compliance rate

```
total_prs = 100
compliance_violation = 5
compliance_warning = 12
clean = 83

violation_rate = 5%
warning_rate = 12%
compliance_rate = 83%
```

### 3-2. Violation type breakdown

Query Action logs (Workflow runs) for details:

```bash
# protected-files + compliance-guard run history
gh run list --repo $REPO --workflow compliance-guard.yml \
  --limit 100 --json status,conclusion,event,headBranch,createdAt
```

Extract violated rule tags from PR comments:

| Rule | Occurrences |
|------|-------------|
| branch_naming | 3 |
| issue_linkage | 2 |
| pr_template | 8 |
| issue_labels | 5 |
| pr_size | 4 |

### 3-3. Violator patterns

```bash
# Aggregate violation PR count per author
```

| Author | Violation PRs | Rate | Notes |
|--------|--------------|------|-------|
| [dlwldP](profile) | 2 | 40% | Repeated branch naming |
| [std-yong](profile) | 1 | 20% | One-off |

(Names displayed as real_name from team-roles.yaml)

---

## Step 4 — Render Report

```markdown
📊 Compliance Audit Report — {yyyy-MM-dd}
Period: {since} ~ {now} ({days} days)

## Compliance Summary
  Total PRs:  {total}
  Clean:      {clean} ({pct}%)
  Warning:    {warning_count} ({pct}%)
  Violation:  {violation_count} ({pct}%)

## Violations by Type
| Rule | Occurrences | Severity |
|------|-------------|----------|
| branch_naming | 3 | ❌ Error |
| pr_template | 8 | ⚠️ Warning |
| issue_labels | 5 | ⚠️ Warning |

## Repeat Violators
| Author | Violations | Primary Type |
|--------|-----------|-------------|
| [Woo Jong-ho](profile) | 0 | - |
| [Lee Min-woo](profile) | 2 | branch_naming |
| [Lee Ji-ye](profile) | 1 | pr_template |

## Violation PR Details (latest first)
- [PR #{n} {title}]({url}) — [{author}]({profile}) ({time_ago})
  Violations: {rules}
  Status: {merged / open}

## 📋 Recommended Actions
- [T1] Coach Lee Min-woo on branch_naming (repeated)
- [T2] High pr_template violations → team announcement + consider auto-fill
- [T3] Audit whether skip-compliance label is being overused
```

---

## Step 5 — Action Options

```markdown
## Action Options

[1] Post coaching comment to repeat violators (preview required)
    → Friendly guide + documentation link on the relevant PR or issue
[2] Create issue to propose rule revision
    → Discuss relaxing/tightening repeatedly violated rule
[3] Team-wide announcement (create issue)
    → Remind team of frequently missed rules
[4] Audit skip-compliance usage history
    → Who applied the label, when, and why
[B] Return to PM dashboard
```

### Option 1 — Coaching Comment

Template example:

```
@{login} Hi! The {rule} violation has been recurring in recent PRs.

Reference: [_CODING-GUIDE.md]({url})
Please follow {specific fix} from the next PR onward 🙏
```

**`_safety.md` § Comment Safety strictly required** — send after preview + Y/N/E confirmation.

### Option 4 — skip-compliance Audit

```bash
# Track PRs with skip-compliance label
gh pr list --repo $REPO --state all \
  --label "skip-compliance" \
  --json number,title,author,labels,createdAt
```

If skip is overused, the rule itself may be the problem → consider rule revision.

---

## Step 6 — Audit Trail Storage (optional)

If Admin chooses, save this report as a file:

```
_wood/agents/pm/audits/{yyyy-MM-dd}-audit.md
```

Protected file — only Admin can commit. PM can only request export.

---

## Policy Change Path

If this audit reveals rules are excessive or insufficient:

```
PM proposal → Admin review → _wood/workflows/_COMPLIANCE-SPEC.yaml revision PR
  ↓
CODEOWNERS review + team consensus
  ↓
Reflected in compliance-guard.yml immediately after merge
```

**Rules themselves are traceable via git history = transparency guaranteed.**

---

## ✅ Success Criteria

- All PRs in the specified period collected
- Violation types accurately classified
- Repeat violators identified
- Report reproducible (data-based)

## ❌ Failure Criteria

- Displaying violators in a public shaming tone
- Auto-posting comments without confirmation
- Using fabricated figures instead of real GitHub data

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
