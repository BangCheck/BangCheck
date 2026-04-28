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

## 5-4. Sprint Status — in-progress 기록 (MANDATORY)

개발 시작 시점을 personal sprint-status에 기록한다.

```bash
PERSONAL_DIR="_wood/workspace/_${USER_LOGIN}"
PERSONAL_SPRINT="$PERSONAL_DIR/sprint-status.yaml"

mkdir -p "$PERSONAL_DIR/stories" "$PERSONAL_DIR/epics"

if [ ! -f "$PERSONAL_SPRINT" ]; then
  cat > "$PERSONAL_SPRINT" << EOF
# Sprint Status
login: ${USER_LOGIN}
stories: []
EOF
fi

# Add in-progress entry (AI: append to stories list)
# Entry format:
# - story_id: {story_id}
#   issue: {issue_number}
#   branch: {branch_name}
#   status: in-progress
#   started: {YYYY-MM-DD}
```

**규칙:**
- 이미 동일 `issue` 항목이 존재하면 `status`만 `in-progress`로 갱신 (중복 추가 금지)
- `story_id`는 step-04에서 생성한 Story 파일명 기준 (없으면 `issue-{issue_number}` 형식)

---

## Completion

```
✅ Development ready

  Branch: {branch_name}
  Issue:  #{issue_number} → 상태:진행중
  Story:  {story_count} ready → in-progress
```

→ load `./step-06-dev.md`
