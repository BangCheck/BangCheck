<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Tester Workflow 02 — Define Test Cases

> **Agent:** Tester
> **Purpose:** Add new TCs to page issues (suggested based on functional spec)
> **Base:** [_core.md](../../_core.md) · [_ux.md](../../_ux.md) · [_safety.md](../../_safety.md)

---

## 🛑 Pre-flight

- User role in `[Admin, Tester]`
- Target page issue exists

---

## Step 1 — Select Page

```
Select a page to define TCs for:

[1] Existing page (add TCs)
[2] Scan all pages (auto-recommend pages without TCs)
```

---

## Step 1-B — Basic Information Collection (at once)

**[If selecting existing page]** Enter issue number and auto-load.

**[If registering a new page]** Collect the following items all at once:

```
📋 Please enter page information all at once.

  Page name:
  Key features (comma-separated):
  Routing path (press Enter if none):
  API endpoints (press Enter if none):
  Priority: [P0] Immediate / [P1] Same day / [P2] Next sprint ← recommended / [P3] Backlog
```

STOP and WAIT for user input.

→ Proceed to Step 1-C after input is complete.

---

## Step 1-C — Follow-up Questions (to deepen scenario coverage)

Present the following follow-up questions all at once based on the input received:

```
🔍 A few questions to deepen the scenarios.
   Feel free to skip items that are hard to answer by pressing Enter.

  Q1. What part of this page worries you most?
      Whether it's a simple rendering issue, routing/permissions issue,
      or an intermittent error that only occurs in specific conditions —
      please be as specific as possible.
      (e.g., "Loading breaks when network is slow", "Button doesn't work on a specific browser")

  Q2. If a real user were using this page, what order would they take actions?
      Describe the flow step by step from entry to goal completion.
      Also mention edge users (not logged in, no permissions, first-time visitor, etc.) if applicable.
      (e.g., "Not logged in → direct access to /woojongho → redirect? or visible?")

  Q3. Have there been past bugs or issues with this page or similar features?
      If so, briefly describe the situation and how it was resolved.
      If similar patterns might recur, we'll include them as regression scenarios.
      (e.g., "Previously, going back left the page in an empty state")

  Q4. Are there any edge cases or conditions you'd like specifically verified?
      Cases where you're curious about "how it looks in this situation" are fine too.
      (e.g., "Mobile notch area intrusion", "Layout breaks with very long text",
           "Input with spaces only", "Animation stutter on low-end devices")
```

STOP and WAIT for user input.

→ Incorporate answers into Step 4 TC suggestions with priority.
→ Fill in uncovered areas with default categories.

---

## Step 2 — Reference Sources

AI references the following sources for TC suggestions:

### 2-1. Functional spec

```bash
# Load spec xlsx (read-only)
# docs/spec/functional-spec-v2.1.1.xlsx
```

Extract feature fields from the screen ID for the target page:
- Input values
- Behavior (conditions/logic)
- Output values
- Exception handling

→ Each of these is a potential TC

### 2-2. Issue body (existing description)

```bash
gh issue view {page_num} --json body --jq .body
```

- Default checklist items
- Feature sub-issue list
- Already existing TCs

---

## Step 3 — TC Generation Categories

SWYP standard TC categories:

### ✅ Happy Path

```
- All required inputs + normal server → success response
- Full completion of key user flow
```

### ⚠️ Validation

```
- Empty input
- Format errors (email, phone number)
- Length limits (min/max)
- Special characters, Unicode
```

### ❌ Exception Handling

```
- Network error → retry UI
- Server 5xx → error message
- 401/403 → redirect to login
- 404 → appropriate guidance
- Duplicate submission prevention
```

### 🔐 Auth/Permissions

```
- Access without login
- Access to other user's data
- Token expiry
```

### 📱 Mobile/Responsive

```
- Display at 360px width
- Touch target size
- Safe area (notch)
- Portrait/landscape rotation
```

### ♿ Accessibility

```
- Keyboard navigation
- Screen reader readability
- Focus indicator
- Color contrast
```

### 🔙 State Restoration

```
- Form retained after back navigation
- State after page refresh
- Return after tab switch
```

---

## Step 4 — AI Suggests TCs

AI suggests TCs based on page type + spec content:

```markdown
## Login Page (#4) TC Suggestions

### ✅ Happy Path (3)
- TC-LOGIN-NEW-01: Naver OAuth successful login → navigate to home
- TC-LOGIN-NEW-02: Google OAuth successful login → navigate to home
- TC-LOGIN-NEW-03: Re-login after logout

### ⚠️ Validation (2)
- TC-LOGIN-NEW-04: Naver permission denied → error message
- TC-LOGIN-NEW-05: Same email different social → merge guidance

### ❌ Exception (3)
- TC-LOGIN-NEW-06: Network offline → retry button
- TC-LOGIN-NEW-07: Server 5xx → "Temporary error" message
- TC-LOGIN-NEW-08: OAuth window mid-flow cancellation → page remains

### 📱 Mobile (2)
- TC-LOGIN-NEW-09: No button overlap at 360px
- TC-LOGIN-NEW-10: iOS Safari Safe Area applied

### ♿ Accessibility (1)
- TC-LOGIN-NEW-11: Login button reachable via keyboard Tab

[A] Approve all and add to issue body
[E] Edit individually (select number)
[N] Cancel
```

---

## Step 5 — Apply to Issue Body

Add approved TCs to issue body:

```markdown
### 🧪 Test Cases

| ID | Case | Linked Issue | Status |
|----|------|-------------|--------|
| TC-LOGIN-01 | (existing) | #5 | ✅ |
| TC-LOGIN-NEW-01 | Naver OAuth successful login → navigate to home | #6 | ⬜ |
| TC-LOGIN-NEW-02 | ... | #7 | ⬜ |
| ... | | | |
```

ID auto-assignment rules:
- Page code (LOGIN) + sequential number
- Start from last_number + 1 to avoid collisions with existing IDs

```bash
# Update issue body
gh issue edit {page_num} --body "$(cat /tmp/new_body.md)" --repo SWYP-Backend/project
```

---

## Step 6 — Link to sub-issues

Map which sub-issues (features) each TC verifies:

```
TC-LOGIN-NEW-01: Naver OAuth success
  → Linked: #6 (Naver social login)

TC-LOGIN-NEW-06: Network offline
  → Linked: multiple tasks (shared exception handling)
```

Add a comment mentioning this TC to each sub-issue body (optional):

```
💬 "TC-LOGIN-NEW-01 added — verification planned upon completion of this issue"
(send after preview, follow 02-activity.md § Comment Safety)
```

---

## Step 7 — Report

```markdown
🧪 TC Definition Complete

Page: [#{n} {title}]({url})

### TCs Added
  ✅ Happy Path:    {count}
  ⚠️ Validation:   {count}
  ❌ Exception:    {count}
  📱 Mobile:       {count}
  ♿ Accessibility: {count}

  Total {total} added

### Next Action
  [R] Start execution flow immediately → 01-run-tc.md
  [D] Define for another page
  [B] Return to agent
```

---

## ✅ Success Criteria

- Suggestions based on spec + issue body
- Auto-assigned IDs (no collisions)
- Balance across categories
- Applied only after user approval

## ❌ Failure Criteria

- Generate TCs arbitrarily (without spec reference)
- Duplicate IDs
- Modify issue body without approval
- Missing categories (especially accessibility/mobile)

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-16
