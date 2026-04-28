---
epic:
  id: 1
  title: "swyp-master Orchestrator Infrastructure"
  status: Draft
  type: infrastructure
  owner: "@Woo-JongHo"
  created: 2026-04-28
  goal: "세션 지속형 오케스트레이터 agent 구축 — `/swyp-entry` 진입 후 페르소나 유지"
---

# Epic 1: swyp-master Orchestrator Infrastructure

## Status
Draft

## Goal
`/swyp-entry` 진입 후 세션 전체에 걸쳐 master agent 페르소나가 유지되는 오케스트레이터 구축. 현재 swyp-* 슬래시 커맨드들은 인라인이고 한 번 호출되면 세션이 끊기는데, master agent + hook 인프라로 세션 지속성을 확보한다.

## Background

### 현재 상태 (Fact)
- `_wood/agents/`에 agent 인프라 90% 완성:
  - `_core.md`, `_safety.md`, `_step-rules.md`, `_ux.md` (공통 규약)
  - `pm/`, `fe-dev/`, `be-dev/`, `tester/`, `quick-dev/` (역할별 agent.md, XML persona+menu 구조)
- `_wood/agents/master/` **부재** — top-level 오케스트레이터 없음
- `.claude/commands/swyp-*.md`는 `_wood/agents/`를 참조하지 않고 인라인 콘텐츠로 동작
- 세션 지속 메커니즘 부재 — 매 turn fresh하게 시작
- 톤 설정은 이미 `team-roles.yaml.role_menus[role].greeting`에 정의됨 (별도 작업 불필요)

### 문제점
1. `/swyp-entry` 호출 후 다음 turn에 페르소나 사라짐 → ad-hoc 대화로 흐름
2. QuickDev 분기는 `_wood/agents/quick-dev/`로 이미 정의됐으나 진입 경로 없음
3. 작업 step 상태 저장 없음 → 세션 끊기면 어디서 재개할지 불명

### 해결 방향
- master agent.md 신설 (페르소나 + 역할 라우터 + 메뉴) — 기존 `pm/agent.md`와 동일한 XML 구조 채용
- Stop / UserPromptSubmit hook으로 매 turn 페르소나·step 재주입
- `_wood/state/session.md`로 step 상태 저장

## Stories

| # | 제목 | 상태 | 파일 |
|---|------|------|------|
| 1.1 | swyp-master agent.md 신설 | Draft | story-1.1-master-agent.md |
| 1.2 | Hook 확장 — 세션 지속성 | Draft | story-1.2-hooks-extension.md |
| 1.3 | State 인프라 — `_wood/state/` | Draft | story-1.3-state-infra.md |
| 1.4 | (Phase B) Slash command thin wrapper화 | Backlog | story-1.4-thin-wrapper.md |

## Out of Scope (이 Epic에서 제외)

- Story 1.4 (slash command thin wrapper) — 보호 파일 변경이라 별도 PR + Admin 검토 필요. Phase B로 분리.
- 다른 sub-agent (pm/fe-dev/be-dev/tester/quick-dev) 내부 워크플로 변경 — master 라우팅만 신설하고 기존 sub-agent는 그대로.
- 사용자 페르소나 커스터마이즈 — 이미 `team-roles.yaml.role_menus`에 정의됨.

## Definition of Done

- [ ] Story 1.1, 1.2, 1.3 모두 Done
- [ ] 새 세션에서 `/swyp-entry` 호출 시 master persona 활성화 (수동 검증)
- [ ] 다음 turn에도 persona 유지 확인 (`Stop` hook 동작)
- [ ] state 파일이 step별로 갱신됨 확인
- [ ] 기존 `.claude/commands/swyp-*.md` 동작 깨짐 없음 (Phase A는 추가만, 변경 없음)

## Risks

| Risk | 영향 | 완화 |
|------|------|------|
| Hook 무한 루프 (Stop이 자기 자신 트리거) | 세션 무응답 | Hook 설계 시 `decision: continue`만 사용, `block` 금지 |
| state 파일 race condition (병렬 Bash 호출) | 상태 불일치 | session_id별 파일 분리, atomic write |
| 기존 슬래시 커맨드와 충돌 | 사용자 혼란 | Phase A는 `_wood/agents/master/`만 추가 — 기존 동작 무변경 |
| 보호 파일 정책 위반 | PR 차단 | `_wood/agents/master/`도 보호 파일 — Admin(@Woo-JongHo) 직접 변경 OK |

## Dependencies

- 선행: 없음
- 후행: Phase B (Story 1.4)는 이 Epic 완료 후 진행

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-28 | 0.1 | Epic 초안 작성 | @Woo-JongHo |
