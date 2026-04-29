<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Case 1 — Repo Infrastructure Setup (one-time)

---

## 1-1. Check existing infrastructure

If labels/milestones already exist, ask:

```
{n} labels and {m} milestones already exist — mostly ready.

▶️ Recommended: [1] Return to previous menu (already sufficient)

Other options:
  [2] Create only missing items
  [3] Full re-initialization (keep existing + fill missing)
  [B] Cancel
```

- `1` → Return to Step 2 menu
- `2` → Analyze missing items and create only those labels/milestones
- `3` → Re-run full 1-2 steps (skip existing items)

---

## 1-2. Create Labels

Create ONLY missing labels. Defined set:

| Label | Color | Description |
|-------|-------|-------------|
| `유형:작업` | `0E8A16` | Task |
| `유형:버그` | `D73A4A` | Bug |
| `유형:개선` | `A2EEEF` | Improvement |
| `순위:최상` | `B60205` | P0 |
| `순위:높음` | `D93F0B` | P1 |
| `순위:중간` | `FBCA04` | P2 |
| `순위:하위` | `0E8A16` | P3 |
| `상태:백로그` | `EDEDED` | Backlog |
| `상태:할일` | `D4C5F9` | Todo |
| `상태:진행중` | `0075CA` | In progress |
| `상태:블로킹` | `E11D48` | Blocked |
| `상태:리뷰` | `F59E0B` | In review |
| `상태:완료` | `0E8A16` | Done |
| `모바일` | `FF6B6B` | Mobile |
| `백엔드` | `0052CC` | Backend |
| `디자인` | `F9D0C4` | Design |

Command (skip existing):
```bash
gh label create "{name}" --color "{color}" --description "{desc}" --repo SWYP-Backend/project 2>/dev/null || true
```

---

## 1-3. Create first milestone

Ask user:
```
Please enter the first milestone name (default: Sprint 1):
```

Create:
```bash
gh api repos/SWYP-Backend/project/milestones \
  -f title="{name}" -f state="open" \
  -f description="SWYP — {name}"
```

---

## 1-4. Create project board

Check existing:
```bash
gh project list --owner SWYP-Backend --format json
```

If none for SWYP:
```bash
gh project create --owner SWYP-Backend --title "SWYP Room Checklist"
```

Instruct user:
```
Project board has been created. Please add the following columns on GitHub web:
Backlog → Todo → In Progress → Review → Done
```

---

## Completion

→ Return to `../workflow.md` Step 7 (Report).
