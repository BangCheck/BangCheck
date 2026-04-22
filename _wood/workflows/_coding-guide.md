<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# SWYP Coding Guide — Agile-based Development Conventions

> This guide defines how we develop features in SWYP.
> All workflows (`01-entry.md` ~ `05-pr.md`) reference this document.
> AI assistants MUST respect these conventions when recommending code changes.

---

## 🎯 Philosophy

1. **Small, vertical slices** — ship value in tiny, shippable increments
2. **Trace everything** — every change links to an issue (`closes #`)
3. **Document as you code** — update spec + checklist in the same PR
4. **Mobile-first + Korean UX** — SWYP's core constraint

---

## 🏃 Milestone-based Delivery (a.k.a. Sprint)

SWYP adopts a lightweight approach using **GitHub Milestones as a project unit**
rather than formal Agile sprint ceremonies (planning/velocity/commitment).

The table below is for reference — SWYP's actual implementation is based on GitHub Milestones.


| Agile | GitHub | SWYP Convention |
|-------|--------|----------------|
| **Sprint** | Milestone | 1~2 weeks, named `Sprint N` or `Page Feature Composition` |
| **Epic** | (not used) | Too heavy for our team size |
| **Story** | Page Issue (`유형:페이지`) | Maps 1:1 to a user-facing page/screen |
| **Task** | Sub-issue (`유형:작업`) | Single-PR sized work unit |
| **Bug** | Bug Issue (`유형:버그`) | Discovered during/after story work |
| **Improvement** | Improvement (`유형:개선`) | Backlog-able enhancement |

### Sprint Flow

```
Sprint start
  ↓
[1] Admin/PM: create milestone + page issues + sub-issues
  ↓
[2] Devs: swyp-todo → pick issue → branch → code
  ↓
[3] Devs: commit (small, atomic) → PR (closes #)
  ↓
[4] Reviewer: review → approve → merge
  ↓
[5] Sub-issue auto-closed → parent progress updates
  ↓
[6] Sprint end: retrospective + milestone close
```

---

## 📖 Story (Page Issue) Structure

Each page issue = one user-facing story.

### Body Layout

A page issue's body has **3 levels**:

```markdown
## {Page Name}

{Description}

### Default Checklist
(default checklist — NOT created as sub-issues)
- [ ] Routing setup
- [ ] Responsive layout (360px~)
- [ ] Loading state
- [ ] Error state
- [ ] Accessibility basics

### Feature Issues
(feature sub-issues — created as `유형:작업` issues)
- [ ] #N {Feature 1}
- [ ] #N {Feature 2}

### Bugs
(bugs discovered during story — `유형:버그` sub-issues)
- (added as they're found)

### Done Criteria
(Definition of Done)
- [ ] All default checklist ✓
- [ ] All feature sub-issues closed
- [ ] Zero open bugs (or explicitly deferred)
- [ ] Design review passed
- [ ] Responsive verified (mobile/tablet/desktop)
```

### Default Checklist Rules

- ❌ **NEVER** create GitHub sub-issues for default checklist items
- ✅ Track via markdown checkboxes in page issue body
- ✅ Update via `swyp-project` → `Issue Management` → `Page Checklist Update`
- ✅ GitHub automatically shows progress (e.g., `3/5 ████░░`)

### Page Type Presets

Default checklist varies by page type. Presets live in:
`docs/spec/page-presets.md`

Types:
- **Common** (all pages)
- **Form pages** (login, signup, settings) — adds form validation, submit logic
- **List pages** (search, feed) — adds pagination, filter, empty state
- **Map pages** — adds marker rendering, location permission
- **Detail pages** (profile, room detail) — adds fetch+cache, 404 handling
- **Dashboard** — adds data fetch + auto-refresh

---

## ⚙️ Task (Sub-issue) Structure

Each task = **one PR** worth of work.

### Sizing Heuristics

| Too small | Just right | Too large |
|-----------|------------|-----------|
| 1 line change | 1 page's login button OAuth | Entire login page + all OAuth providers |
| 30-min work | 0.5–2 day work | 1-week+ work |
| No test needed | 1–3 test cases | Would need 10+ tests |

If a task feels larger than **2 days**, split it.

### Task Body Layout

```markdown
Parent: #{parent_page}

## Implementation Details
{what exactly to build}

## Implementation Checklist
- [ ] {detail 1}
- [ ] {detail 2}

## Edge Cases to Consider
- [ ] Edge case 1
- [ ] Error case 1

## Test Scenarios
- [ ] {test 1}
- [ ] {test 2}

## Done Criteria
- [ ] Feature works as spec
- [ ] No regressions
- [ ] Code conventions followed
```

---

## 🌱 Branch Strategy

### Naming

```
{type}/{issue-number}-{short-slug}

Examples:
  feat/5-login-form-ui
  fix/12-naver-oauth-error
  refactor/18-api-client-retry
  docs/22-readme-update
```

### Type mapping (from issue label)

| Issue label | Branch prefix |
|-------------|--------------|
| `유형:페이지`, `유형:작업` | `feat` |
| `유형:버그` | `fix` |
| `유형:개선` | `refactor` |
| docs-only PRs | `docs` |

### Rules

- ❌ NEVER commit to `main` directly
- ❌ NEVER force-push to shared branches
- ✅ ALWAYS branch from latest `main`
- ✅ DELETE branch after PR merge

---

## 💾 Commit Convention

### Format

```
{type}: {summary in Korean, <50 chars}

#{issue-number}
```

### Types

| Type | When |
|------|------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructure without behavior change |
| `chore` | Build, deps, config |
| `design` | UI styling/layout without logic change |
| `comment` | Comments added/changed |
| `remove` | Pure deletions |

### Rules

- **Subject**: imperative, Korean, ≤50 chars
- **Body**: optional, bullet points in Korean
- **Footer**: always `#{issue_number}` for traceability
- **Atomicity**: one logical change per commit
- Split mixed changes into separate commits

### Examples

✅ Good:
```
feat: 로그인 폼 레이아웃 및 입력 유효성 검사 추가

#5
```

✅ Good (with body):
```
fix: 네이버 OAuth 콜백 시 토큰 저장 실패 수정

- 쿠키 도메인 설정 오류로 저장 실패
- 로컬 개발 환경 localhost 대응 추가

#12
```

❌ Bad:
```
update code    (no type, English, vague)
fix: 다양한 버그 수정 (너무 막연)
feat: 로그인 + 회원가입 + 토큰 (3개 논리 단위 섞임)
```

---

## 🔀 PR Convention

### Title

```
{type}: {summary} (#{issue_number})

Example:
  feat: 로그인 폼 UI 구현 (#5)
```

### Body Template

```markdown
## What
{what this PR does, 1-3 bullets}

## Why
closes #{issue_number}

## How
{implementation approach, key decisions}

## Test
- [ ] Tested scenario 1
- [ ] Tested scenario 2

## Checklist
- [ ] Issue feature spec satisfied
- [ ] Default checklist unaffected (update if applicable)
- [ ] Mobile responsive (360px~)
- [ ] Korean UI consistency
- [ ] Accessibility basics (keyboard/screen reader)
```

### Rules

- **One issue per PR** (closes #N in body)
- **Small PRs** — <400 lines changed preferred, <800 hard limit
  - Exception: renames, automated refactors
- **Review before merge** — at least 1 reviewer
- **Squash or merge commit** — per team preference (SWYP uses **merge commit** for history clarity)

### When to split a PR

- Covers multiple issues
- >800 lines changed
- Mixes refactor + feature
- Mixes different layers (UI + API in one PR for unrelated parts)

---

## 🧪 Testing Approach

SWYP is early-stage; testing strategy is pragmatic:

### What we test (for now)

- ✅ **Critical flows** (auth, checklist save, compare)
- ✅ **Regression-prone areas** (OAuth edge cases, offline)
- ⚠️  Optional for pure UI if covered by manual QA

### What we don't test (yet)

- ❌ Every component in isolation
- ❌ Pixel-perfect screenshot tests
- ❌ E2E for non-critical paths

### Test file convention

```
src/components/LoginForm.tsx
src/components/LoginForm.test.tsx    ← co-located
```

### Test case naming

Align with page issue TC:
```
TC-LOGIN-01: Email format validation
TC-LOGIN-02: Naver OAuth success flow
```

---

## 📱 SWYP-specific UX Rules

### Mobile-first

- Design for **360px width** first
- Tap targets ≥ 44x44px
- Consider Safe Area (iOS notch, Android nav bar)
- Body text ≥ 14px for readability

### Korean UI

- User-facing text: **Korean**
- Error messages: **Korean with polite tone**
  - ❌ "Error"
  - ❌ "오류"
  - ✅ "일시적인 오류가 발생했습니다. 다시 시도해주세요."
- Form labels: **Korean**
- Button text: **verb-form Korean** (e.g., "로그인", "저장하기")

### Accessibility baseline

- Keyboard navigation works
- Semantic HTML (button, a, form)
- Alt text on images
- Focus visible (not `outline: none` without replacement)

---

## 🛑 Definition of Done (DoD)

A task is **done** when:

1. ✅ Feature works as spec
2. ✅ All acceptance criteria checked
3. ✅ Test cases pass (manual or automated)
4. ✅ No regressions in dependent areas
5. ✅ Code reviewed + approved
6. ✅ Merged to `main`
7. ✅ Issue auto-closed via `closes #`
8. ✅ Parent page issue progress updated

A page issue is **done** when:

1. ✅ All default checklist items checked
2. ✅ All feature sub-issues closed
3. ✅ Zero open bugs (or defer-labeled)
4. ✅ Design review passed
5. ✅ Responsive verified

---

## 🔁 Retrospective (Sprint End)

At the end of each milestone:

1. What went well?
2. What was painful?
3. What will we change next sprint?

Record decisions in `_wood/workflows/retrospective-{date}.md` (optional template).

---

## 📚 Related Documents

- [AGENTS.md](../../AGENTS.md) — AI policy
- [_PROTOCOL.md](_PROTOCOL.md) — AI execution protocol
- [team-roles.yaml](../team-roles.yaml) — Roles and permissions
- [team-conventions.md](../team-conventions.md) — Team-specific rules
- [CLAUDE.md](../../CLAUDE.md) — Next.js specific guidance
- Spec: `docs/spec/functional-spec.xlsx`

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
**Policy version:** v1.0
