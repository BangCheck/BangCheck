# /swyp-entry — 세션 진입점

현재 상태를 파악하고 작업을 시작합니다.

---

## 사전 점검

1. `git remote get-url origin` — repo 확인
2. `git branch --show-current` — 현재 브랜치
3. `git status --short` — uncommitted changes 확인
4. `gh auth status` — 미인증이면 로컬 정보만 표시

uncommitted changes가 있으면:
> 1. stash하고 계속
> 2. 현재 브랜치에서 이어서 작업
> 3. /swyp-commit으로 커밋

---

## 케이스

- `/swyp-entry` — 일일 현황 (기본)
- `/swyp-entry pick #12` — 이슈 선택 + 브랜치 생성
- `/swyp-entry resume` — 기존 브랜치 이어서 작업
- `/swyp-entry backlog` — 미할당 이슈 목록

---

## daily — 일일 현황 (기본)

### 현재 작업 상태

```bash
git branch --show-current
git log --oneline -3
```

### 내 이슈 목록 (우선순위 순)

```bash
gh issue list --repo {repo} --assignee @me --state open --json number,title,labels,milestone --limit 20
```

```
| # | 우선순위 | 유형 | 제목 | 마일스톤 |
|---|---------|------|------|---------|
```

### 내 PR 상태

```bash
gh pr list --repo {repo} --author @me --state open --json number,title,reviewDecision
```

### 다음 행동 자동 추천

- PR APPROVED → "merge하세요"
- feature 브랜치 → "이어서 작업하세요"
- main + 할당 이슈 → "/swyp-entry pick #{n}"
- 할당 없음 → "/swyp-entry backlog"

---

## pick — 이슈 선택 + 브랜치 생성

1. 이슈 확인: `gh issue view {number} --repo {repo}`
2. 이슈 정보 + **테스트 시나리오 표시**:
   ```
   이슈 #{number}: {title}
   - 우선순위: {priority}
   - 마일스톤: {milestone}

   테스트 시나리오 (이 작업에서 검증해야 할 것):
     □ {test_1}
     □ {test_2}
     □ {test_3}
   ```
   테스트 섹션 없으면: "/swyp-test add #{n}으로 추가하세요"
3. self-assign (assignee에 본인 없으면 제안)
4. 브랜치명 생성:
   - 라벨 기반 type: task/page → `feat`, bug → `fix`, improvement → `refactor`
   - 형식: `{type}/{number}-{short-description}`
   - 사용자 확인 후 생성
5. **상태 라벨 자동 변경**: → `status:progress`

```bash
git checkout main && git pull origin main && git checkout -b {branch}
gh issue edit {number} --remove-label "status:backlog,status:todo" --add-label "status:progress" --repo {repo}
```

이미 브랜치 존재 → checkout만

---

## resume — 기존 작업 재개

```bash
git branch --list "feat/*" --list "fix/*" --list "refactor/*"
```

로컬 feature 브랜치 목록 표시 → 번호로 선택 → checkout
remote 동기화 확인 (behind/ahead 표시)

---

## backlog — 미할당 이슈

```bash
gh issue list --repo {repo} --no-assignee --state open --json number,title,labels,milestone --limit 20
```

우선순위 순 표시 → 번호 입력 시 pick으로 자동 전환

---

## 안전 장치

- uncommitted changes → stash/commit/무시 선택
- main에서 직접 작업 시도 → feature 브랜치 생성 안내
- closed 이슈 pick → 차단
- gh 미인증 → 로컬 정보만 표시 (degraded mode)
