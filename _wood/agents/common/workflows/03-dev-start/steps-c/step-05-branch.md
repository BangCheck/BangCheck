---
step: 5
title: "Branch creation + issue status update"
nextStep: "./step-06-dev.md"
---

# Step 05 — Branch Creation

READ THIS ENTIRE FILE before executing any action.

---

## 5-1. Create or Switch Branch

If existing branch found:
```bash
EXISTING=$(git branch --list "feat/{issue_number}-*" | head -1 | xargs)
[ -n "$EXISTING" ] && git checkout "$EXISTING"
```

Otherwise:
```bash
BRANCH="feat/{issue_number}-{slug}"
git checkout -b "$BRANCH"
```

```
🌿 Branch: {branch_name}
```

---

## 5-2. Issue Status Update

```bash
gh issue edit {issue_number} \
  --remove-label "상태:할일" \
  --add-label "상태:진행중" \
  --repo $REPO
```

---

## 5-3. Story Status Update

```bash
# Personal workspace story → in-progress
sed -i '' 's/| Status | ready/| Status | in-progress/' \
  _wood/workspace/_${USER_LOGIN}/stories/e{ep}-s01-*.md 2>/dev/null
```

---

## Completion

```
✅ Development ready

  Branch: {branch_name}
  Issue:  #{issue_number} → 상태:진행중
  Story:  {story_count} ready → in-progress
```

→ load `./step-06-dev.md`
