# /swyp-pr — Issue 연동 PR 생성

---

## 사전 점검

1. **브랜치** — main/master면 차단
2. **uncommitted changes** — 있으면 /swyp-commit 안내
3. **gh 인증** — 미인증이면 중단
4. **커밋 확인** — `git log main..HEAD` 커밋 없으면 중단
5. **기존 PR** — 같은 브랜치로 open PR 있으면 알림

---

## Step 1: 이슈 번호 확인

우선순위:
1. 인자로 명시: `/swyp-pr #12`
2. 브랜치명에서 추출: `feat/12-login-page` → `#12`
3. 커밋 메시지에서 추출
4. 사용자에게 질문 (없으면 skip 가능)

이슈 확인: `gh issue view {number}` — 존재/상태 확인

### 테스트 시나리오 확인

이슈 body에서 "## 테스트 케이스" 파싱:

```
이슈 #{number} 테스트 시나리오:
  ✅ 통과 항목
  ❌ 미확인 항목      ← 경고
```

미확인 있으면: "미확인 테스트 {n}건. 그래도 PR 생성하시겠습니까?"

### 상태 라벨 자동 변경

PR 생성 시 → `status:review`로 변경:
```bash
gh issue edit {number} --remove-label "status:progress" --add-label "status:review" --repo {repo}
```

---

## Step 2: 변경 범위 분석

```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
```

---

## Step 3: PR 제목

- 커밋 1개 → 커밋 메시지 사용
- 여러 개 → 전체 요약 (72자 이내)
- 사용자 확인 후 확정

---

## Step 4: PR 본문

```markdown
## 요약
- {bullet 1~3}

## 연결 이슈
Closes #{number}

## 변경 사항
| 파일 | 변경 |
|------|------|
| {path} | 신규/수정/삭제 |

## 스크린샷 (UI 변경 시)
| Before | After |
|--------|-------|
| | |

## 체크리스트
- [ ] 기능 정상 동작 확인
- [ ] 기존 기능에 영향 없음
- [ ] 코드 컨벤션 준수
- [ ] 반응형 확인 (해당 시)
```

이슈 없으면 "연결 이슈" 생략. 복수 이슈면 각각 `Closes #N`

---

## Step 5: 리뷰어 지정

```bash
gh api repos/{repo}/collaborators --jq '.[].login'
```

본인 제외 팀원 목록 → 번호로 선택 (쉼표로 복수 가능, skip 가능)
draft PR은 리뷰어 생략

---

## Step 6: push + PR 생성

```bash
git push -u origin {branch}  # upstream 없을 때
gh pr create --title "{title}" --body "{body}" --base main --reviewer "{reviewers}"
```

draft면 `--draft` 추가

---

## Step 7: 종료 보고

```
PR 생성 완료
- PR: #{number} — {url}
- base ← head: main ← feat/12-login-page
- 연결 이슈: #12
- 리뷰어: @teammate

머지 후:
  1. 이슈 #12 자동 닫힘
  2. git checkout main && git pull
  3. git branch -d feat/12-login-page
```

---

## 안전 장치

| 규칙 | 처리 |
|------|------|
| main에서 PR | 차단 |
| uncommitted changes | /swyp-commit 안내 |
| 기존 open PR | 중복 방지 |
| force push | 금지 |
| 이슈 없이 PR | 경고 후 허용 |
| 리뷰어 없음 | 경고 후 허용 |
