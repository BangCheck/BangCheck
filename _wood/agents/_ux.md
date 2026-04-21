<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Agent UX Protocol

> Applies to all agents under `_wood/agents/`.
> Load after `_core.md`.

---

## 1. Clickable Links

Always render issue/PR numbers as clickable markdown links:

```
❌ Bad:   "#5 Login Form UI"
✅ Good:  "[#5 Login Form UI](https://github.com/SWYP-Backend/project/issues/5)"
```

Always render member names with profile links:

```
❌ Bad:   "Woo-JongHo is working on it"
✅ Good:  "[Woo JongHo](https://github.com/Woo-JongHo) is working on it"
```

---

## 2. Status Icons

| Icon | Meaning |
|------|---------|
| 🟢 | On track |
| 🟡 | Caution |
| 🔴 | At risk / Blocked |
| ⚪ | Idle / Waiting |
| ✅ | Done |
| ⚠️ | Warning |
| 🚫 | Blocked |
| ⏰ | Schedule concern |
| 💬 | Comment |
| 🌐 | Web link |
| 💾 | Commit |
| 🔥 | Active |
| ➕ | Add / Assign |
| 📊 | Stats |

---

## 3. Menu & Choice Format

### General Rules

1. **Do not expose file paths to users** (internal reference only)
2. **Avoid Y/N binary choices** — provide 3+ options except for confirmation-only cases
3. **Always show recommended choice** — highlight with `▶️ Recommended:` marker
4. **Mark inputs explicitly** — use "(input)" placeholder

### Menu Format Template

```
{1-2 line situation summary}

▶️ Recommended: [1] {most common next action}

Other options:
  [2] {option 2} — {brief description}
  [3] {option 3} — (input required)
  [B] Back / Cancel

Enter number or type directly:
```

### Forbidden Pattern (Y/N binary)

```
# ❌ Bad — no alternatives
[Y] Proceed
[N] Cancel
```

### Replacement Patterns

#### 3-option set

```
▶️ Recommended: [1] Return to previous menu (already prepared)

Other options:
  [2] Add missing items only
  [3] Custom input (input required)
  [B] Cancel
```

#### Input + choice hybrid

```
Select or type project name:

▶️ Recommended: [1] "Sprint 2" (based on previous name)

Other options:
  [2] Type directly → Name: ___
  [B] Cancel
```

#### Safety confirmation (Y/N exception)

Only allowed for truly destructive/irreversible actions:

```
⚠️ Closing issue #5. Reopen requires manual action.
  [Y] Confirm
  [N] Cancel
```

### Menu Order Rules

1. **Recommended item at top** (`▶️ Recommended:` or ⭐ marker)
2. **Frequent → rare** order
3. **Group related items** — use `── Group ──` separator if needed
4. **Cancel/Back always last** (`[B]`, `[X]`)

### Input Notation

| Notation | Meaning |
|----------|---------|
| `(number)` | Integer only |
| `(input)` | Free text required |
| `(optional input)` | Enter to skip |
| `YYYY-MM-DD` | Date format required |

Example:
```
[3] Milestone name (input required): ___
[4] Due date (optional, YYYY-MM-DD): ___
```

### Free Text Detection Logic

When user types free text instead of a number:
1. Interpret as the most recent "type directly" option
2. If no matching option → `"Unrecognized input. Please enter a number."`

---

## 4. SWYP Hierarchy (display at entry)

All agent entries and `01-entry.md` dashboards **include this diagram at the top of the first screen**.
Purpose: orient non-developers (PM, Design) and new team members.

### Display Format (at entry)

```
📐 SWYP Structure

  🗂️ Project Board (GitHub Project)       → "SWYP Checklist for Studio Apartments"
   └─ 🗓️ Sprint (Milestone)               → Period + goal (e.g. "Sprint 1")
        └─ 📄 Page Issue (유형:페이지)     → Screen-level story
             └─ 🔧 Task (유형:작업)        → Single PR unit
```

### Level Definitions

| Level | GitHub Term | SWYP Label | Role |
|-------|-------------|------------|------|
| Board | Project (V2) | Project Board | Overall kanban (1 board) |
| Sprint | Milestone | Sprint | Period + goal (groups pages) |
| Page | Issue (유형:페이지) | Page Issue | Screen-level story |
| Task | Sub-issue (유형:작업) | Task | Single PR-sized work unit |

### Display Rules

- **Include the full 4-line diagram** at the top of every agent dashboard
- If the current active item is known, add `← current` marker to that line
- Compact form allowed for non-entry screens:
  ```
  📐 Board > Sprint > Page > Task
  ```
  But **agent entry first screen always uses the full diagram**.

### Example (PM agent entry)

```
👑 Admin Woo JongHo, welcome!

📐 SWYP Structure

  🗂️ Project Board (GitHub Project)       → "SWYP Checklist for Studio Apartments"
   └─ 🗓️ Sprint (Milestone)               → Period + goal
        └─ 📄 Page Issue (유형:페이지)     → Screen-level story
             └─ 🔧 Task (유형:작업)        → Single PR unit

## Current Sprint
...
```

---

## 5. Agent Dashboard Structure

```
{role_greeting from team-roles.yaml}

## {Situation Summary}
{1-3 key metrics based on role's concerns}

## What would you like to do?

{follows menu format rules above}
```

**Maximum 5-7 items**. Group if more (`── Section ──`).

---

**Admin:** @Woo-JongHo
**Last reviewed:** 2026-04-20
