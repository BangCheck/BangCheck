---
story:
  id: 1.1
  title: "swyp-master agent.md 신설"
  status: Draft
  epic: 1
  owner: "@Woo-JongHo"
  estimate: "S (1-2h)"
---

# Story 1.1: swyp-master agent.md 신설

## Status
Draft

## Story

**As a** Admin (Woo-JongHo)
**I want** `_wood/agents/master/agent.md` 파일을 신설해서 top-level 오케스트레이터로 동작시키고
**so that** `/swyp-entry` 진입 시 사용자 역할을 자동 감지하고 적절한 sub-agent(pm / fe-dev / be-dev / tester / quick-dev)로 라우팅할 수 있다.

## Acceptance Criteria

1. `_wood/agents/master/agent.md` 파일이 존재한다.
2. 파일은 기존 `pm/agent.md`와 동일한 XML 구조를 따른다 (`<agent>`, `<activation>`, `<persona>`, `<menu>`).
3. frontmatter에 `agent_id: master`, `agent_name: "SWYP Master Orchestrator"`, `allowed_roles: [Admin, PM, Frontend, Backend, Tester, Design, Guest]` 포함.
4. activation 단계에서:
   - `_core.md`, `_safety.md`, `_ux.md` 로드 명시
   - `team-roles.yaml`에서 사용자 role 조회
   - `role_menus[role].greeting` 가져와 인사
5. 메뉴는 사용자 role에 따라 동적 표시:
   - Admin → 모든 sub-agent + 보드 액션
   - PM → pm-agent 진입 + project 액션
   - Frontend / Backend → fe-dev / be-dev 진입 + quick-dev 옵션
   - Tester → tester 진입
   - Design → 안내 메시지 (제한된 메뉴)
   - Guest → 미등록 안내
6. 각 메뉴 항목은 `exec="_wood/agents/{role}/agent.md"` 또는 `exec="_wood/agents/quick-dev/agent.md"`로 sub-agent 위임.
7. 메뉴에 명시적 **`[Q] Quick Dev`** 출구 항목 포함 (worflow에 안 맞을 때).
8. 메뉴에 **`[E] Exit master mode`** 항목 포함.
9. activation 마지막 step에 "STOP and WAIT" 명시 (`pm/agent.md` 패턴 준용).

## Tasks / Subtasks

- [ ] **Task 1**: 디렉토리 생성 (AC: 1)
  - [ ] `mkdir -p _wood/agents/master/`
- [ ] **Task 2**: agent.md 본체 작성 (AC: 1, 2, 3, 4)
  - [ ] frontmatter (agent_id, agent_name, allowed_roles, forbidden_actions)
  - [ ] AI-PROTECTED-FILE 헤더 + 한국어 응답 노트
  - [ ] `<activation>` 블록 — _core/_safety/_ux 로드 + role 검증 + 인사
- [ ] **Task 3**: persona 블록 작성 (AC: 4, 9)
  - [ ] role: dispatcher / orchestrator
  - [ ] identity: 역할 라우터, 본인은 작업 안 함
  - [ ] communication_style: 간결, fact-first
  - [ ] principles: role boundary 절대 준수, 페르소나 유지
- [ ] **Task 4**: menu 블록 작성 (AC: 5, 6, 7, 8)
  - [ ] role별 동적 메뉴 분기 (XML 컨디션 또는 step에서 분기)
  - [ ] sub-agent exec 경로 정확히 매핑
  - [ ] [Q] Quick Dev 출구 박기
  - [ ] [E] Exit 박기
- [ ] **Task 5**: 검증 (AC: 1~9)
  - [ ] 파일 존재 확인 (`ls _wood/agents/master/agent.md`)
  - [ ] 구조 검증 — `pm/agent.md`와 비교해 동일 패턴인지
  - [ ] AC 9개 항목 체크리스트로 자가 검증

## Dev Notes

### 참고 파일
- `_wood/agents/pm/agent.md` — XML 구조 정확한 참조 (activation, persona, menu, menu-handlers)
- `_wood/agents/_core.md` — Foundation Protocol (§1 로드 순서, §3 Role Gate, §8 Response Style)
- `_wood/agents/_ux.md` — §3 Menu Format, §4 SWYP Hierarchy, §5 Dashboard Structure
- `_wood/team-roles.yaml` — `role_menus[role].greeting` 인사말, member metadata

### 설계 결정
- **master는 직접 작업 안 함** — 라우팅만. `forbidden_actions: [direct_work]` 명시.
- **메뉴는 role-conditional** — role에 따라 보이는 항목 다름. XML 안에 step 분기로 표현하거나 메뉴 표시 단계에서 필터링.
- **sub-agent 진입 = exec="path"** — 기존 PM agent의 menu-handlers 패턴 그대로 사용.
- **Quick Dev 위치** — 메뉴 하단(거의 마지막), `[Q]` shortcut. forbidden role 없음.
- **Guest fallback** — `team-roles.yaml`의 `unregistered_user.show_message` 활용.

### 코드 구조 예시 (참고용, 실제 구현 시 조정)
```xml
<agent id="swyp-master" name="SWYP Master" title="Orchestrator" icon="🎯">

  <activation critical="MANDATORY">
    <step n="1">Load _core.md, _safety.md, _ux.md</step>
    <step n="2">USER_LOGIN=$(gh api user --jq .login)
                Lookup role in team-roles.yaml
                If Guest → show unregistered_user message + STOP</step>
    <step n="3">GREETING=$(yq ".role_menus.${role}.greeting" team-roles.yaml)
                Echo $GREETING with {name} substituted</step>
    <step n="4">Show role-conditional menu (see <menu> below)</step>
    <step n="5">STOP and WAIT for user input</step>
    <step n="6">On input: match item → exec sub-agent</step>
  </activation>

  <persona>
    <role>SWYP Master Orchestrator. Routes user to appropriate role agent.</role>
    <identity>Dispatcher. Does not perform work directly — delegates to sub-agents.</identity>
    <principles>
      - NEVER perform tasks directly — always delegate
      - NEVER violate role boundary — refuse if role mismatch
      - ALWAYS show numbered menu at every interaction
    </principles>
  </persona>

  <menu>
    <!-- Admin sees all -->
    <item role="Admin" cmd="1" exec="_wood/agents/pm/agent.md">[1] PM Agent</item>
    <item role="Admin" cmd="2" exec="_wood/agents/fe-dev/agent.md">[2] FE Dev Agent</item>
    <item role="Admin" cmd="3" exec="_wood/agents/be-dev/agent.md">[3] BE Dev Agent</item>
    <item role="Admin" cmd="4" exec="_wood/agents/tester/agent.md">[4] Tester Agent</item>

    <!-- Role-specific -->
    <item role="PM" cmd="1" exec="_wood/agents/pm/agent.md">[1] PM Workflow</item>
    <item role="Frontend" cmd="1" exec="_wood/agents/fe-dev/agent.md">[1] FE Workflow</item>
    <item role="Backend" cmd="1" exec="_wood/agents/be-dev/agent.md">[1] BE Workflow</item>
    <item role="Tester" cmd="1" exec="_wood/agents/tester/agent.md">[1] Tester Workflow</item>

    <!-- Universal -->
    <item cmd="Q" exec="_wood/agents/quick-dev/agent.md">[Q] Quick Dev (워크플로 외 자유작업)</item>
    <item cmd="E">[E] Exit master mode</item>
  </menu>
</agent>
```

### 보호 파일 처리
`_wood/agents/master/agent.md`도 `_wood/**` 보호 파일 범위에 자동 포함됨. Admin이 직접 작성 가능.

### 검증 방법
- 파일 작성 후 새 세션 열어서 `/swyp-entry` 호출 시 master 동작은 **Story 1.4(slash command thin wrapper) 완료 전엔 자동으론 안 됨**
- 검증은 Story 1.2 (Stop/UserPromptSubmit hook) 완료 후 hook이 master agent.md를 인지하는지로 가능
- 또는 임시로 `Read _wood/agents/master/agent.md` 직접 호출해 본인이 검증

## Testing

- [ ] 파일 존재
- [ ] frontmatter 검증 (yq 또는 head로 확인)
- [ ] XML 구조 well-formed (xmllint 또는 시각 확인)
- [ ] AC 9개 모두 self-review

## File List

(작성 예정 — 실행 시 업데이트)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-28 | 0.1 | Story 초안 | @Woo-JongHo |

## Dev Agent Record

### Agent Model Used
(실행 시 기록)

### Completion Notes
(실행 시 기록)
