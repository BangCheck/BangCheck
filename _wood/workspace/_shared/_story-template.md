# Story Template — 08_SWYP

> Copy this file, rename to `e{ep}-s{st}-{name}.md`, fill in each section.
> Decomposition is **developer's choice** — merge or split sections freely.

---

## Metadata

| Field | Value |
|---|---|
| Epic | E{ep} — {epic-title} |
| Story | S{st} |
| GitHub Issue (Epic) | #{page-issue} |
| GitHub Issue (Task) | #{task-issue} *(create if needed)* |
| Screen ID | SCR-* |
| Status | draft / ready / in-progress / done |
| Assignee | — |

---

## Goal

One sentence: what does this story deliver, and why does it matter to the user?

---

## Scope

### In
- Specific UI elements / behaviors included in this story

### Out
- Explicitly excluded (deferred to another story or epic)

---

## Acceptance Criteria

```
Given <context>
When  <action>
Then  <expected result>
And   <additional constraint>
```

*(Add as many Given/When/Then blocks as needed. Keep each testable.)*

---

## Implementation Hints

> Non-mandatory. Delete if not useful.

- Relevant components / files to touch
- Auth state branches to handle (Guest / Logged-in)
- API endpoints involved
- Edge cases worth noting

---

## Definition of Done

- [ ] AC above are met
- [ ] PR created with `Closes #{task-issue}`
- [ ] No console errors / lint warnings
- [ ] Reviewed and merged

---

## Story Log

| Date | Note |
|---|---|
| YYYY-MM-DD | Story created |
