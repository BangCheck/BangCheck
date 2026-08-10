<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Workflow 07 — Page Docs (Functional Spec / API Spec)

> **Purpose:** Create and maintain per-page functional-spec and API spec as GitHub Issues.
> **Storage:** GitHub Issues — label `documentation` + page label (e.g. `페이지:로그인`)
> **Strategy:** One issue per page, body is the living document. FE updates FE column, BE updates BE column.

---

## Pre-flight Check

```bash
gh auth status || { echo "Not authenticated. Run: gh auth login"; exit 1; }
REPO=$(git remote get-url origin | sed -E 's|.*github.com[:/]([^/]+/[^/.]+).*|\1|')
USER_LOGIN=$(gh api user --jq .login)
```

---

## Step 1 — List Existing Page Issues

```bash
gh issue list --repo BangCheck/BangCheck \
  --label "documentation" \
  --state open \
  --json number,title,labels \
  --jq '.[] | "#\(.number) \(.title)"'
```

Display:

```
📄 페이지별 Docs 현황

[기존 이슈]
  #132 [SCR-LOGIN] 기능명세서 / API 명세서
  ...

[없는 페이지는 새로 생성 가능]
```

---

## Step 2 — Menu

```
📋 Page Docs 작업

[1] 페이지 이슈 보기       — 기존 이슈 body 출력
[2] FE 체크 갱신           — FE 컬럼 ✅ / ❌ 업데이트
[3] 새 페이지 이슈 생성    — 템플릿으로 새 이슈 작성
[4] 백로그 항목 추가       — 백로그 섹션에 항목 추가
[5] 차단 요인 업데이트     — 현재 차단 요인 섹션 수정

[B] 돌아가기
```

---

## Input Mapping

| Input | Action |
|---|---|
| `1`, `view` | → Step 3: View issue |
| `2`, `fe`, `check` | → Step 4: Update FE checks |
| `3`, `new`, `create` | → Step 5: Create new page issue |
| `4`, `backlog` | → Step 6: Add backlog item |
| `5`, `block` | → Step 7: Update blockers |
| `B` | Return to swyp-docs menu |

---

## Step 3 — View Page Issue

Ask user: "어떤 페이지 이슈를 볼까요? (번호 또는 페이지명)"

```bash
# By number
gh issue view {number} --repo BangCheck/BangCheck

# By search
gh issue list --repo BangCheck/BangCheck \
  --label "documentation" \
  --search "{page_name}" \
  --json number,title \
  --jq '.[] | "#\(.number) \(.title)"'
```

---

## Step 4 — Update FE Checks

Ask user: "이슈 번호와 업데이트할 항목을 알려주세요."

1. Fetch current body:
```bash
BODY=$(gh issue view {number} --repo BangCheck/BangCheck --json body --jq .body)
```

2. Show current table to user.
3. Ask which rows to update (✅ → ❌ or ❌ → ✅).
4. Apply changes and confirm before writing:

```
다음 변경사항을 이슈 #{number}에 적용할까요? (Y/N)
  - {필드명}: ❌ → ✅
```

5. On Y:
```bash
gh issue edit {number} --repo BangCheck/BangCheck --body "{updated_body}"
```

---

## Step 5 — Create New Page Issue

Ask user: "페이지 이름을 입력하세요. (예: rooms, settings, checklist)"

Load template from `_wood/agents/common/workflows/07-page-docs/template.md`.

Fill in:
- `{PAGE_NAME}` → user input
- `{DATE}` → today's date
- FE/BE all set to `❌` initially

Confirm before creating:
```
[SCR-{PAGE}] 기능명세서 / API 명세서 이슈를 생성할까요? (Y/N)
```

On Y:
```bash
gh issue create \
  --repo BangCheck/BangCheck \
  --title "[SCR-{PAGE}] 기능명세서 / API 명세서" \
  --label "documentation,프론트엔드" \
  --body "{filled_template}"
```

---

## Step 6 — Add Backlog Item

Ask user: "백로그에 추가할 항목 내용을 입력하세요."

1. Fetch current body.
2. Append to `## 백로그` table:
   ```
   | BL-{n+1} | {항목} | {API 영향} | {상태} |
   ```
3. Confirm → `gh issue edit`

---

## Step 7 — Update Blockers

Ask user: "차단 요인 내용을 입력하세요. (기존 내용을 교체합니다)"

1. Fetch current body.
2. Replace `## 현재 차단 요인` section.
3. Confirm → `gh issue edit`

---

## ✅ Success Criteria

- Issue body reflects current implementation state
- FE column updated by FE, BE column updated by BE
- Backlog linked to functional-spec items
- No fabricated check marks (only verified from code)

## ❌ Failure Criteria

- Marking ✅ without verifying actual code
- Overwriting BE column as FE developer
- Creating duplicate page issues
