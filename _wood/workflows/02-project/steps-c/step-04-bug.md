<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Case 4 — Add Bug

---

## 4-1. Collect Info (interactive)

```
[1] Title: "Describe the bug in one line:"
[2] Reproduction steps: "How to reproduce? (step by step, empty line to finish):"
[3] Expected result: "What is the correct behavior?"
[4] Actual result: "What actually happens?"
[5] Error log: "Paste error message if any (press Enter if none):"
```

---

## 4-2. Priority Recommendation

Auto-suggest based on keywords:

| Keyword | Recommended |
|---------|------------|
| crash, white screen, data loss | `순위:최상` |
| error, failure, broken | `순위:높음` |
| slow, inconvenient, intermittent | `순위:중간` |
| typo, minor, trivial | `순위:하위` |

Ask user to confirm or override.

---

## 4-3. Create

Template:
```markdown
## Reproduction Steps

1. {step_1}
2. {step_2}

## Expected Result

{expected}

## Actual Result

{actual}

## Environment
- Browser:
- OS:
- Screen size:

## Error Log

{error_log}
```

```bash
gh issue create --repo BangCheck/BangCheck \
  --title "[bug] {title}" \
  --label "유형:버그,{priority}" \
  --body "{rendered}"
```

---

## 4-4. PM Escalation (Important)

After registering a bug, if PM needs to be aware:

```bash
# If priority is critical, mention @PM
gh issue comment {new_bug_number} \
  --body "@{pm_github_login} Urgent review needed" \
  --repo BangCheck/BangCheck

# If my work is blocked by this bug, add blocking label to my issue
gh issue edit {my_working_issue} \
  --add-label "상태:블로킹" \
  --repo BangCheck/BangCheck
```

PM's `04-daily-digest` automatically collects these signals.

---

## Completion

→ Return to `../workflow.md` Step 7 (Report).
