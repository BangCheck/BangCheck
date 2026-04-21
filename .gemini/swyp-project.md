# /swyp-project — 프로젝트 보드 생성 및 관리

GitHub Project 보드, 라벨, 마일스톤을 생성하고 관리합니다.

---

## 사전 점검

1. `gh auth status` — 미인증이면 중단
2. `git remote get-url origin` — repo 확인
3. 기존 라벨/마일스톤/보드 상태 스캔

---

## 케이스 선택

인자 없으면 메뉴 표시:

```
SWYP Project 관리

1. [init]      프로젝트 초기화 (라벨 + 마일스톤 + 보드 + 페이지 일괄 등록)
2. [add]       페이지/기능 추가 (기존 프로젝트에 확장)
3. [status]    현재 프로젝트 상태 조회 (테스트 진행률 포함)
4. [update]    이슈 상태 변경 (진행 중/대기/블로킹 등)
5. [milestone] 마일스톤 생성/종료
6. [label]     라벨 추가/수정
```

---

## init — 프로젝트 초기화

### 라벨 일괄 생성 (이미 존재하면 스킵)

유형: `page`(#1D76DB), `task`(#0E8A16), `bug`(#D73A4A), `improvement`(#A2EEEF)
우선순위: `P0-critical`(#B60205), `P1-urgent`(#D93F0B), `P2-normal`(#FBCA04), `P3-backlog`(#0E8A16)
역할: `frontend`(#7057FF), `backend`(#0052CC), `design`(#F9D0C4)
상태: `status:backlog`(#EDEDED), `status:todo`(#D4C5F9), `status:progress`(#0075CA), `status:blocked`(#E11D48), `status:review`(#F59E0B), `status:done`(#0E8A16)

```bash
gh label create "{name}" --color "{color}" --description "{desc}" --repo {repo} 2>/dev/null || true
```

### 마일스톤 생성

사용자에게 이름 입력 요청 (기본값: "Sprint 1"):

```bash
gh api repos/{repo}/milestones -f title="{name}" -f state="open"
```

### 프로젝트 보드 생성

```bash
gh project create --owner {owner} --title "SWYP 자취방 체크리스트"
```

안내: GitHub 웹에서 칼럼 설정 → `Backlog` → `Todo` → `In Progress` → `Review` → `Done`

---

## status — 상태 조회

```bash
gh issue list --repo {repo} --state open --json number,title,labels,assignees,milestone --limit 100
gh pr list --repo {repo} --state open --json number,title,author,reviewRequests
gh api repos/{repo}/milestones --jq '.[] | {title, open_issues, closed_issues}'
```

출력:

```
SWYP 프로젝트 현황 — {날짜}

## 우선순위별 Open 이슈
| 우선순위 | Open | 할당됨 | 미할당 |
|---------|------|--------|-------|

## 마일스톤 진행
| 마일스톤 | Open | Closed | 진행률 |
|---------|------|--------|-------|

## Open PR
| PR | 제목 | 작성자 | 리뷰 상태 |
|---|------|--------|----------|
```

## 테스트 진행률
| 페이지 | 전체 | 통과 | 진행률 |
|--------|------|------|-------|
```

경고 조건: P0 미해결, 미할당 P1, 리뷰어 없는 PR, 라벨 없는 이슈

---

## add — 페이지/기능 추가

기존 프로젝트에 페이지나 기능을 추가합니다:
1. 페이지 추가 (page issue + task + 테스트 시나리오 일괄)
2. 독립 task 추가
3. 인프라 작업 추가

기존 마일스톤에 배치, 담당자 배분, 테스트 시나리오 자동 생성

---

## update — 이슈 상태 변경

```
/swyp-project update #12

현재: status:progress
1. [backlog]   백로그
2. [todo]      할 예정
3. [progress]  진행 중
4. [blocked]   블로킹 (사유 입력)
5. [review]    리뷰 대기
6. [done]      완료
```

기존 status:* 라벨 제거 후 새 라벨 부여:
```bash
gh issue edit {number} --remove-label "status:progress" --add-label "status:review" --repo {repo}
```

blocked: 사유 입력 → 이슈 코멘트 추가
done: 미통과 테스트 있으면 경고

---

## milestone — 마일스톤 관리

- `create` — 이름 입력 → 생성
- `close` — open 이슈 있으면 경고 → 다음 마일스톤으로 이동 또는 강제 닫기
- `list` — 현재 마일스톤 목록 + 진행률

---

## 안전 장치

- 이미 존재하는 라벨/마일스톤 재생성 안 함
- 마일스톤 닫기 전 open 이슈 확인
- 프로젝트 보드 중복 생성 방지
