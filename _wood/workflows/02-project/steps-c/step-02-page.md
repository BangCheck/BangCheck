<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Case 2 — Add Page (Story Issue)

---

## 2-1. Spec Reference

```
Would you like to reference the functional spec?

[Y] Create based on functional spec (recommended)
[N] Manual input
```

If `Y` → read `docs/spec/functional-spec.xlsx` (or .md version if available), extract page list.

Display:
```
Pages found in functional spec:

| # | Page | Path | Issue exists? |
|---|------|------|---------------|
| 1 | Login | /login | ✗ |
| 2 | Home | /home | ✗ |
...

Select page numbers to create (comma-separated, or "all"):
```

---

## 2-2. Page Type Detection

For each selected page, ask:
```
Select this page's type:

[1] Form page (login, signup, settings)
[2] List page (search results, listings)
[3] Map page
[4] Detail page (profile, detail view)
[5] Dashboard page
[6] General page
```

---

## 2-3. Default Checklist

Based on type, load preset from `docs/spec/page-presets.md`.
Show to user for confirmation/edit:

```
Default checklist (included in body without separate issues):

- [ ] Page routing setup
- [ ] Responsive layout (360px~)
- [ ] Loading state UI
- [ ] Error state UI
- [ ] Accessibility basics (keyboard navigation, semantic tags)
{type-specific items}

Add/modify/delete? (Enter edits or press Enter to confirm):
```

---

## 2-4. Feature Issues List

Ask user:
```
List the features for this page (to be created as sub-issues):
(separate with Enter, empty line to finish)

Example: Login form UI / Naver social login / Google social login / Token management
```

---

## 2-5. Priority + Milestone + Assignee

```
Select priority:
[1] 순위:최상  [2] 순위:높음  [3] 순위:중간 (default)  [4] 순위:하위
```

```
Select milestone: {list open milestones or [skip]}
```

```
Assignee:
[1] Myself (@{user_login})
[2] Select team member
[3] Assign later
```

---

## 2-6. Duplicate Check

```bash
gh issue list --repo SWYP-Backend/project --state open --search "{title}" --json number,title --limit 5
```

If similar exists:
```
⚠️ Similar issues found:
  #{n} {title}

▶️ Recommended: [1] View existing issue (avoid duplicates)

Other options:
  [2] Create anyway (intentional)
  [3] Create with modified title (input): ___
  [B] Cancel
```

---

## 2-7. Create Page Issue

```markdown
## {title}

{description}

---

### Default Checklist

{default_checklist}

### Feature Issues

{feature_issues_list}

### Bugs

(added during development)

### Done Criteria

- [ ] All default checklist items completed
- [ ] All feature issues closed
- [ ] Zero bugs (or deferred)
- [ ] Design review completed
- [ ] Responsive verified (mobile/tablet/desktop)
```

Create:
```bash
gh issue create --repo SWYP-Backend/project \
  --title "{title}" \
  --label "{priority}" \
  --milestone "{milestone}" \
  --assignee "{assignee}" \
  --body "{rendered_template}"
```

---

## 2-8. Sub-issue Generation Prompt

```
Would you like to create individual task issues from the feature list?

[Y] Bulk create tasks (recommended)
[N] Later
[A] Add another page
[D] Done
```

If `Y` → load `./step-03-task.md` with `parent_number` and `task_list`.

---

## Completion

→ Return to `../workflow.md` Step 7 (Report).
