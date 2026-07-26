# BangCheck — _wood / _woo Architecture Note

last_updated: 2026-06-14

---

## 1. 역할 경계 확정

| Layer | Location | Role |
|-------|----------|------|
| 본사 (HQ) | `_woo/` | 알람 발송·진행상황 수집·종료 시 문서 정리 |
| 지사 (Branch) | `_wood/` | 프로젝트 에이전트·킥오프·버전 컨텍스트·시나리오 처리 |
| 결과물 | `docs/` | 노트·impl·qa·릴리즈 (팀 공개 문서) |

---

## 2. 확정된 결정

### D1 — 데일리 브리핑 실행 주체 = `_woo`
- `_woo/agents/secretariat/messenger/poc/collect-brief.mjs` 가 실행 주체.
- `_wood/agents/pm/workflows/04-daily-digest/` 는 중복 → 폐기 대상.
- 합성 엔진: `claude -p` (Max 구독, API 과금 0).
- 스케줄: `/schedule` 또는 `/loop` (GHA 기각 — 외부 API 키 = 과금).

### D2 — `_wood/` 슬림화 방향
- 진입점: `/swyp-entry`, `/swyp-commit` 위주로 남김.
- 역할 라우팅: `master/agent.md` → `team-roles.yaml` 기반 유지.
- 복잡도 정리: pm 워크플로우 10개·be-dev 4개·fe-dev 4개 중 실사용 확인 후 dead weight 제거.
- `_wood/` = "프로젝트 두뇌" — 킥오프 컨텍스트·버전·시나리오 처리·문서 생성.

### D3 — 문서 위치
- 결과물(노트·impl) → `docs/` (현재 위치 유지).
- 패치 히스토리 → `_wood/patches/` 유지 (과거 이력) + `docs/release-note-{ver}.md` 병존.
- 향후 `docs/`로 통일 검토.

---

## 3. 핵심 갭 (미해결)

### GAP-1 — `collect-brief.mjs`가 `docs/`를 읽지 않음
현재 읽는 것: `team-roles.yaml`, `milestone-meta.yaml`, GitHub API.
읽어야 할 것:
- `docs/kickoff-note-ver1.1.md` — 버전 방향·목표
- `docs/개발자노트-ver1.1.md` — 체크박스 진척 (`- [x]` count)
- `docs/impl/ver1.1/be.md` — IDOR P1 진척 등

→ 조치: `collect-brief.mjs`에 docs 읽기 섹션 추가.

### GAP-2 — `milestone-meta.yaml`에 ver1.1 연결 없음
`kickoff_doc`, `retrospective` 필드가 예시만 있고 실제 값 없음.
→ 조치: `milestone-meta.yaml`에 ver1.1 milestone 항목 등록.

### GAP-3 — impl-note 체크박스 진척이 sprint-status와 분리
`docs/impl/ver1.1/be.md`의 `- [ ]` 체크박스와
`_wood/workspace/*/sprint-status.yaml` (GitHub 이슈 기반) 연동 없음.
→ 조치 후보: collect-brief가 체크박스 count 파싱 / 또는 sprint-status 직접 연동.

---

## 4. 연동 흐름 (목표 상태)

```
[_woo/messenger/collect-brief.mjs]
  읽기
    ├── _wood/team-roles.yaml          (팀원·역할)
    ├── _wood/milestone-meta.yaml      (ver1.1 kickoff_doc 링크 포함)
    ├── docs/kickoff-note-ver1.1.md    (방향·목표)
    ├── docs/개발자노트-ver1.1.md       (체크박스 진척)
    ├── docs/impl/ver1.1/be.md         (P1 시나리오 상태)
    └── GitHub API (이슈·PR·커밋)
  합성 → claude -p → MD 브리핑
  발송 → Discord (post-to-discord.mjs)

[_wood/master/agent.md]
  역할 감지 → team-roles.yaml
  라우팅
    ├── /swyp-entry → 진입 체크
    ├── /swyp-commit → 커밋 가이드
    └── tester/be-dev/fe-dev/pm → 서브에이전트 (슬림화 후)

[docs/impl/ver1.1/*.md]
  pm.md  → PM 체크 완료 시 이슈 등록 → FE 전달
  be.md  → 체크박스 - [ ] → - [x] (담당자 직접)
  fe.md  → 피그마 연동 완료 시 PR
  qa.md  → 교차 검증 완료 시 릴리즈 게이트
```

---

## 5. 다음 액션 (우선순위 순)

| Priority | Action | Owner |
|----------|--------|-------|
| P1 | `milestone-meta.yaml` — ver1.1 항목 등록 (kickoff_doc 링크) | Admin |
| P1 | `collect-brief.mjs` — docs/ 읽기 섹션 추가 | Admin |
| P2 | `_wood/agents/pm/04-daily-digest/` — 폐기 또는 리디렉트 | Admin |
| P2 | `_wood/` 에이전트 실사용 감사 — dead weight 정리 | Admin |
| P3 | `_wood/patches/` vs `docs/` 패치 위치 통일 결정 | Admin |
