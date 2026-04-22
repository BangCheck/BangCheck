---
name: step-01-coverage
description: "TC Coverage Validation"
---


# Validate — TC Coverage

### V1-1. TC count vs feature count per page

```bash
# Query feature (sub-issue) count from page issues
for page in $(gh issue list --repo $REPO --label "유형:페이지" --state open --json number --jq '.[].number'); do
  sub_count=$(gh api repos/$REPO/issues/$page/sub_issues --jq length 2>/dev/null || echo 0)
  tc_count=$(gh issue view $page --repo $REPO --json body --jq .body | grep -c "^| TC-" || echo 0)
  echo "$page: features=$sub_count TCs=$tc_count"
done
```

### V1-2. Coverage table

```
## 📊 TC Coverage

| Page | Features | TCs | Ratio | Verdict |
|------|----------|-----|-------|---------|
{for each page:}
| [#{n} {title}]({url}) | {features} | {tcs} | {ratio} | {✅ Sufficient / ⚠️ Low / ❌ No TCs} |
{/for}

Verdict criteria:
  ✅ TC/feature ≥ 2.0 (average 2+ TCs per feature)
  ⚠️ TC/feature 1.0~1.9 (minimum coverage)
  ❌ TC/feature < 1.0 or 0 TCs

### Pages with No TCs
{for each no_tc_page:}
  ⚠️ [#{n} {title}]({url}) — 0 TCs
     {feature_count} features are unverified
{/for}

## Recommendations

{if no_tc_pages > 0}
  A. Request TC definition for pages with no TCs (comment on developer issue)
  B. Suggest additional TCs for low-coverage pages
  C. Record report only

  Recommendation: A — No TCs means no verification is possible.
{elif low_coverage > 0}
  A. Request TC additions for low-coverage pages
  B. Record report only

  Recommendation: A
{else}
  ✅ All pages have sufficient TC coverage!
{/if}
```


> 🛑 **STOP** — Wait for user input before continuing.

