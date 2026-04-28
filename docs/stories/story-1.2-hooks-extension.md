---
story:
  id: 1.2
  title: "Hook 확장 — 세션 지속성"
  status: Draft
  epic: 1
  owner: "@Woo-JongHo"
  estimate: "S (1h)"
---

# Story 1.2: Hook 확장 — 세션 지속성

## Status
Draft

## Story

**As a** Admin
**I want** `Stop`과 `UserPromptSubmit` 훅을 확장해서 매 turn 끝/시작에 master persona와 현재 step 정보를 자동 주입하고
**so that** 세션 전체에 걸쳐 master agent 페르소나가 유지되어 ad-hoc free 모드로 흘러내리지 않는다.

## Acceptance Criteria

1. `Stop` 훅에 master persona 재주입 명령이 추가된다.
   - 매 응답 끝에 `[swyp-master] 현재 mode={mode}, step={step}, role={role}, 다음 메뉴=...` 형식의 systemMessage 출력.
2. `UserPromptSubmit` 훅에 master 컨텍스트 주입이 추가된다.
   - 사용자 입력 직전 `[swyp-master 모드] role={role}, current step={step}` 형식의 additionalContext 주입.
3. 두 훅 모두 `_wood/state/session.md` 파일을 read해서 현재 mode/step 가져옴 (Story 1.3 의존).
4. state 파일이 없으면 `mode=idle, step=none, role=detected` 기본값 사용 (silent fallback).
5. 훅 명령은 lightweight (200ms 이내 실행).
6. 기존 hook(`branch=...; dirty=N`)을 깨지 않고 **추가**만 한다 — 기존 명령은 그대로.
7. 훅 추가 후 새 사용자 입력 시 두 컨텍스트(branch info + master info)가 모두 주입된다.

## Tasks / Subtasks

- [ ] **Task 1**: state 파일 read 헬퍼 (AC: 3, 4)
  - [ ] state 파일 경로 결정: `_wood/state/session.md` 또는 `.claude/state/session.json`
  - [ ] read 명령 작성 (jq/yq로 파싱)
  - [ ] silent fallback 처리 (`|| echo {default}`)
- [ ] **Task 2**: `Stop` 훅 명령 작성 (AC: 1, 5)
  - [ ] systemMessage JSON 구조: `{"systemMessage": "[swyp-master] mode={...}, step={...}"}`
  - [ ] state 파일에서 값 가져와 substitute
- [ ] **Task 3**: `UserPromptSubmit` 훅 확장 (AC: 2, 6)
  - [ ] 기존 명령(branch+dirty 주입) 그대로 두고 새 hook entry 추가
  - [ ] additionalContext 형식: `[swyp-master 모드] role=..., step=...`
- [ ] **Task 4**: settings.local.json 패치 (AC: 6)
  - [ ] 기존 hooks 객체에 새 entries 추가 (replace 아님)
  - [ ] jq로 검증 (`.hooks.Stop[] | .hooks[]`)
- [ ] **Task 5**: 동작 검증 (AC: 7)
  - [ ] 새 turn 시작 시 두 systemMessage가 모두 보이는지
  - [ ] state 파일 없을 때도 안 깨지는지
  - [ ] 무한 루프 없는지 (Stop hook이 자기 자신 트리거 X)

## Dev Notes

### Hook JSON Structure (참고)

**Stop 훅 — systemMessage**
```json
{"systemMessage": "[swyp-master] mode=master/menu, step=idle, role=Admin\n다음: [1] PM [2] FE [3] BE [4] Tester [Q] QuickDev [E] Exit"}
```

**UserPromptSubmit 훅 — additionalContext**
```json
{"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": "[swyp-master 모드] role=Admin, current_step=master/menu"}}
```

### 명령 예시 (bash)

```bash
# state 파일 read 헬퍼
read_state() {
  local file="$CLAUDE_PROJECT_DIR/_wood/state/session.md"
  if [ -f "$file" ]; then
    yq '. | tojson' "$file" 2>/dev/null || echo '{"mode":"idle","step":"none","role":"unknown"}'
  else
    echo '{"mode":"idle","step":"none","role":"unknown"}'
  fi
}

# Stop hook
state=$(read_state)
mode=$(echo "$state" | jq -r '.mode')
step=$(echo "$state" | jq -r '.step')
role=$(echo "$state" | jq -r '.role')
jq -n --arg msg "[swyp-master] mode=${mode}, step=${step}, role=${role}" '{systemMessage: $msg}'
```

### 설계 결정

- **상태 파일 형식**: Markdown frontmatter (yq로 파싱) — Story 1.3에서 정의
- **두 훅 분리**: Stop은 user에게 보임(systemMessage), UserPromptSubmit은 model에 주입(additionalContext)
- **Silent fallback**: state 없을 때 silent하게 default 사용 — 새 세션 첫 turn은 깨끗하게 동작
- **무한 루프 방지**: Stop hook은 `decision`/`continue` 필드 사용 안 함 — 단순 systemMessage만 출력

### 기존 settings.local.json 구조 (참고)

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "branch+dirty 주입 명령"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "git status --short"
          }
        ]
      }
    ]
  }
}
```

→ 각 event의 `hooks` 배열에 새 entry 추가 (기존 entry 유지).

### 의존성

- **Story 1.3 (state 인프라) 선행 필요** — state 파일 없으면 fallback만 동작. Story 1.3이 합쳐져야 의미 있는 step 추적.
- 단, **Story 1.2를 1.3보다 먼저 박아도 OK** — fallback이 silent하게 default 사용하므로 깨지지 않음.

### 검증 방법

```bash
# Stop hook 명령을 직접 파이프 테스트
echo '{}' | bash -c "$(jq -r '.hooks.Stop[1].hooks[0].command' .claude/settings.local.json)"
# → 예상 출력: {"systemMessage": "[swyp-master] mode=idle, step=none, role=Admin"}

# UserPromptSubmit 같은 방식으로 테스트
echo '{}' | bash -c "$(jq -r '.hooks.UserPromptSubmit[1].hooks[0].command' .claude/settings.local.json)"
```

## Testing

- [ ] 새 turn에서 두 컨텍스트 모두 주입 확인
- [ ] state 파일 없을 때 fallback 동작
- [ ] state 파일 있을 때 정확한 값 사용
- [ ] 무한 루프 없음 (5 turn 연속 입력해서 응답 안정성 확인)
- [ ] 200ms 이내 실행 (Stop 훅 timing)

## File List

- `.claude/settings.local.json` (수정)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-28 | 0.1 | Story 초안 | @Woo-JongHo |

## Dev Agent Record

### Agent Model Used
(실행 시 기록)

### Completion Notes
(실행 시 기록)
