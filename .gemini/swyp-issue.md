# /swyp-issue — GitHub Issue 등록

유형·우선순위·라벨을 대화형으로 결정하고 구조화된 이슈를 생성합니다.

---

## 사전 점검

1. `gh auth status` — 미인증이면 중단
2. 라벨 존재 확인 — 없으면 "/swyp-project init 먼저 실행하세요"
3. 중복 확인 — 유사 제목 검색 후 경고

---

## 케이스 선택

```
SWYP Issue 등록

1. [page]        페이지 단위 이슈 (부모 — 작업 체크리스트 포함)
2. [task]        작업 단위 이슈 (자식 — 부모 이슈 연결)
3. [bug]         버그 신고
4. [improvement] 개선 제안
```

직접 호출: `/swyp-issue page 로그인 페이지`, `/swyp-issue task #10 로그인 폼`, `/swyp-issue bug 카카오 로그인 실패`

---

## 공통: 우선순위 추천

모든 케이스에서 대화형으로 결정합니다. 자동 추천 로직:

| 조건 | 추천 |
|------|------|
| bug + 크래시/데이터 손실/무한 로딩 | P0-critical |
| bug + 에러/실패/안됨/깨짐 | P1-urgent |
| page 이슈 | P2-normal |
| task 이슈 | 부모 우선순위 상속 |
| improvement | P3-backlog |

```
우선순위 선택:
1. [P0] 즉시 차단 — 데이터 손실, 서비스 중단
2. [P1] 당일 처리 — 핵심 기능 불가
3. [P2] 다음 스프린트 — 일반 기능 개발
4. [P3] 백로그 — 급하지 않은 개선
추천: P2-normal
```

## 공통: 마일스톤 + 담당자

open 마일스톤 목록 표시 → 선택 (또는 skip)
담당자: 본인 / 팀원 선택 / skip

---

## page — 페이지 단위 이슈

정보 수집:
1. 페이지 이름
2. 주요 기능 나열 (엔터로 구분)
3. 테스트 시나리오 (자동 추천 + 사용자 수정)
4. API endpoint (선택)

자동 제안 작업 항목:
- 페이지 레이아웃 + 라우팅
- 핵심 UI 컴포넌트
- API 연동
- 에러 핸들링
- 로딩 상태
- 반응형 레이아웃

폼 페이지면 추가: 유효성 검사, 제출 로직, 성공/실패 피드백
리스트 페이지면 추가: 페이지네이션, 필터/정렬, 빈 상태 UI

```bash
gh issue create --repo {repo} --title "[page] {title}" \
  --label "page,{priority},frontend" --milestone "{milestone}" \
  --body "{본문: 설명 + 작업 목록 + API + 테스트 케이스 + 완료 기준}"
```

생성 후: "작업 목록을 개별 task 이슈로 생성하시겠습니까?" → Y면 일괄 생성

---

## task — 작업 단위 이슈

부모 확인:
- 인자로 부모 번호 → 확인
- 없으면 open page 이슈 목록 표시 → 선택 (또는 독립 생성)

```bash
gh issue create --repo {repo} --title "[task] {title}" \
  --label "task,{priority},frontend" --milestone "{milestone}" \
  --body "Parent: #{parent}\n\n## 구현 내용\n{desc}\n\n## 완료 기준\n- [ ] 기능 정상 동작\n- [ ] 코드 컨벤션 준수"
```

생성 후 부모 체크리스트에 이슈 번호 자동 추가

---

## bug — 버그 신고

대화형 수집: 재현 방법 → 기대 결과 → 실제 결과 → 에러 로그(선택)

키워드 기반 우선순위 추천:
- 크래시/화이트스크린/데이터 손실 → P0
- 에러/실패/안됨/깨짐 → P1
- 느림/불편/간헐적 → P2
- 오타/미세/사소한 → P3

```bash
gh issue create --repo {repo} --title "[bug] {title}" \
  --label "bug,{priority},frontend" \
  --body "{재현 방법 + 기대/실제 결과 + 환경 + 스크린샷}"
```

---

## improvement — 개선 제안

수집: 현재 상황 → 개선 방향 → 이유
우선순위 기본: P3-backlog

---

## 생성 후 공통 처리

1. 이슈 URL 보고
2. 다음 단계 안내: `/swyp-entry pick #{n}` 또는 `/swyp-issue task #{n}`

---

## 안전 장치

- 중복 이슈 감지 → 경고
- 라벨 미존재 → /swyp-project init 안내
- 부모 없이 task → 경고 후 허용
- closed 부모에 연결 → 경고 후 확인
