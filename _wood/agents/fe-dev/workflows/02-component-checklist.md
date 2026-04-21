<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# FE Workflow 02 — Component Checklist

> **Agent:** Frontend Developer
> **Purpose:** Checklist to verify before completing a new component/page
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, Frontend]`
- Component/page currently being worked on exists

---

## 🎯 How to use

Run this checklist at the wrap-up stage (just before PR).

The AI reads the diff and **automatically inspects + reports** each item.

---

## Step 1 — Target Selection

```
Select the target to inspect:

[1] All changes on current branch (recommended)
[2] Specify a particular file
[3] Specific component (directory)
```

### Auto-detection

```bash
# List of diff files
git diff --name-only main..HEAD | grep -E '\.(tsx|ts|jsx|js)$'
```

---

## Step 2 — Checklist Run

### 2-1. Mobile Responsive

```
✓ Mobile-first Tailwind classes (base → sm: → md: → lg:)
✓ No breakage at 360px width
✓ Tap target ≥ 44x44px
✓ Safe area considered (top/bottom)
```

Heuristic:
- Frequency of `sm:`, `md:`, `lg:` in `className`
- Whether `w-`, `h-` values are hardcoded
- Minimum size of `button`, `a` tags

### 2-2. Accessibility

```
✓ Semantic HTML (button, a, form, label)
✓ Label association (htmlFor + id)
✓ aria-* attributes where needed
✓ Alt text on images
✓ Keyboard navigable
✓ focus-visible (outline preserved)
```

Heuristic:
- `<div onClick>` pattern detected → should use `<button>`
- Presence of `<label>` next to `<input>`
- `alt` attribute on `<img>`
- `outline: none` without alternative focus style

### 2-3. Korean UI

```
✓ User-facing text in Korean
✓ Error messages in polite tone
✓ Button text in verb form
✓ Loading state in "...중" format
✓ Empty state UI exists
```

Heuristic:
- English text found (assuming no i18n applied)
- Exposed "Error", "Loading", etc.
- Presence of empty state component

### 2-4. State Management

```
✓ Loading state
✓ Error state
✓ Empty state (0 data items)
✓ Success feedback
```

Heuristic:
- Usage pattern of `isLoading`, `isPending`, `error`
- Branch `if (data.length === 0)` exists

### 2-5. Type Safety

```
✓ TypeScript strict mode compliance
✓ No any
✓ Optional chaining (?.) used appropriately
✓ Type assertion (as) minimized
```

Heuristic:
- `: any`, `as any` found
- Use of `@ts-ignore`, `@ts-expect-error`

### 2-6. Next.js Patterns

```
✓ Server vs Client Component used appropriately
✓ Is 'use client' truly necessary?
✓ Image component used (instead of <img>)
✓ Link component used (instead of <a>)
✓ useEffect minimized
```

Heuristic:
- Ratio of `'use client'` files
- Direct use of `<img>`, `<a href="/...">`
- Number of `useEffect` instances

### 2-7. Performance

```
✓ No unnecessary re-renders (useMemo/useCallback used appropriately)
✓ Large images use lazy loading
✓ Consider dynamic import (bundle size)
```

Heuristic:
- Large components (500+ lines)
- Many inline objects/functions

### 2-8. Tests

```
✓ Tests exist for critical flows
✓ Test files co-located (same directory)
✓ TC ID convention (TC-{PAGE}-{NN})
```

---

## Step 3 — Report

```markdown
🔍 Component Checklist — {branch} / {files_count} files

## Summary
  ✅ Passed:   {count}/8 sections
  ⚠️ Warnings: {count}
  ❌ Issues:   {count}

## Detailed Results

### ✅ Mobile Responsive
  - Responsive classes used in all components
  - Files found: {list}

### ❌ Accessibility (Fix Required)
  - `src/components/LoginForm.tsx:34` — `<div onClick>` found → change to `<button>`
  - `src/components/Input.tsx:12` — label missing
  - How to fix: [workflows/01-nextjs-patterns.md § Accessibility]

### ⚠️ Korean UI
  - `src/components/ErrorToast.tsx:8` — "Error" exposed → recommend "일시적인 오류..."

...

## 📊 Verdict
  {overall_icon} {summary}

  e.g. "✅ Most checks passed. Fix 2 accessibility issues and PR is ready."
```

---

## Step 4 — Quick Actions

```markdown
[F] Open problematic file (auto open in editor) → $EDITOR {file}
[C] Add checklist to issue body → 02-project.md
[P] Create PR when all checks pass → 05-pr.md
[B] Return to agent
```

---

## Step 5 — Definition of Done Verification

Compare against the `Acceptance Criteria` section of the linked issue:

```bash
gh issue view {issue_number} --json body --jq .body
```

Search for evidence of implementation in the diff for each checklist item. Warn for unimplemented items.

---

## ✅ Success Criteria

- All 8 sections inspected
- Each issue found includes file:line + fix suggestion
- DoD comparison performed

## ❌ Failure Criteria

- References to non-existent files/lines
- Confusing code quality issues with accessibility issues
- Mistranslation of Korean content

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
