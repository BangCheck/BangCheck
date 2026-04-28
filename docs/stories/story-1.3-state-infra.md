---
story:
  id: 1.3
  title: "State 인프라 — `_wood/state/`"
  status: Draft
  epic: 1
  owner: "@Woo-JongHo"
  estimate: "XS (30분)"
---

# Story 1.3: State 인프라 — `_wood/state/`

## Status
Draft

## Story

**As a** master agent
**I want** 현재 mode/step/role을 영속화할 state 파일 구조와 `.gitignore` 설정이 갖춰지길
**so that** Story 1.2의 hook들이 state를 읽고 매 turn 페르소나·step 정보를 정확히 재주입할 수 있고, 세션이 끊겨도 다음 진입 시 어디서 재개할지 알 수 있다.

## Acceptance Criteria

1. `_wood/state/` 디렉토리가 존재한다.
2. `_wood/state/.gitkeep` 파일이 있어 빈 디렉토리도 git에 트래킹된다.
3. `_wood/state/.gitignore`가 있고 `*.md`와 `*.json`은 무시 (state 내용은 commit 안 됨).
4. state 파일 형식이 정의된다:
   - 경로: `_wood/state/session.md`
   - frontmatter (YAML): `mode`, `step`, `role`, `agent_id`, `session_id`, `last_updated`
   - body: 사람이 읽을 수 있는 현재 상태 요약 (선택)
5. 신규 세션 진입 시 자동 생성을 위한 init 명령이 master agent.md에 명시된다 (Story 1.1과 연동 — 이 Story에선 명령만 정의, 실제 호출은 Story 1.1에서).
6. read 명령이 잘못된 형식 / 누락 필드도 안전하게 처리한다 (silent default fallback).
7. atomic write 패턴 사용 (`tmp 파일 → mv`)으로 race 방지.

## Tasks / Subtasks

- [ ] **Task 1**: 디렉토리·gitignore 생성 (AC: 1, 2, 3)
  - [ ] `mkdir -p _wood/state/`
  - [ ] `_wood/state/.gitkeep` 파일 생성 (빈 파일)
  - [ ] `_wood/state/.gitignore` 파일 생성:
    ```
    *.md
    *.json
    !.gitkeep
    !.gitignore
    ```
- [ ] **Task 2**: state 파일 schema 문서화 (AC: 4)
  - [ ] `_wood/state/README.md` 작성 — frontmatter 필드 설명 + 예시
  - [ ] 예시 파일 (commit 안 됨, 참고만):
    ```markdown
    ---
    mode: master/menu
    step: idle
    role: Admin
    agent_id: master
    session_id: 7c2e1a8f
    last_updated: 2026-04-28T14:30:00+09:00
    ---

    # Current Session State

    Master menu 표시 중. 사용자 입력 대기.
    ```
- [ ] **Task 3**: read/write 헬퍼 명령 정의 (AC: 5, 6, 7)
  - [ ] read 명령 — yq로 frontmatter 파싱, 누락 시 default fallback
  - [ ] write 명령 — atomic write (`tmp → mv`)
  - [ ] master agent.md (Story 1.1)에 init 시 호출하도록 명령 박기 (Story 1.1과 협업)
- [ ] **Task 4**: 검증 (AC: 1~7)
  - [ ] `ls _wood/state/` — .gitkeep, .gitignore만 있는지
  - [ ] `git status` — `_wood/state/.gitkeep`만 추적되는지
  - [ ] 임의 state.md 작성 후 read/write 헬퍼 동작 확인
  - [ ] race 시뮬레이션 — 동시 write 2회 후 최종 파일 일관성 확인

## Dev Notes

### 파일 구조

```
_wood/state/
├── .gitkeep          ← 디렉토리 트래킹용
├── .gitignore        ← *.md, *.json 무시
├── README.md         ← schema 문서 (gitignore에 의해 제외)
└── session.md        ← 실제 state (gitignore에 의해 제외)
```

> ⚠️ README.md도 *.md 패턴에 걸려서 commit 안 됨. **README는 일부러 commit하려면 schema는 다른 위치에 (예: `_wood/agents/_state-schema.md`).**

**대안 1**: `.gitignore`를 더 정교하게:
```
session.md
session-*.md
session.json
*.tmp
```
→ README.md는 commit 가능, session 파일만 무시.

**대안 2**: schema 문서를 `_wood/agents/_state-schema.md`로 분리 → state 디렉토리는 순수히 런타임 데이터만.

→ **대안 2 권장** (관심사 분리).

### state 파일 schema (frontmatter)

| 필드 | 타입 | 예시 | 설명 |
|------|------|------|------|
| mode | string | `master/menu`, `pm/01-project-view`, `quick-dev/scope` | 현재 활성 agent 및 단계 |
| step | string | `idle`, `step-04-story`, `done` | mode 내부의 step ID |
| role | string | `Admin`, `PM`, `Frontend` | team-roles.yaml의 role |
| agent_id | string | `master`, `pm`, `fe-dev` | 활성 agent ID |
| session_id | string | `7c2e1a8f` | Claude Code 세션 ID (hook의 stdin에서 받음) |
| last_updated | ISO 8601 | `2026-04-28T14:30:00+09:00` | atomic write 시각 |

### read 헬퍼 (bash)

```bash
read_state() {
  local file="$CLAUDE_PROJECT_DIR/_wood/state/session.md"
  if [ -f "$file" ]; then
    # frontmatter만 추출 (sed로 ---~--- 사이)
    sed -n '/^---$/,/^---$/p' "$file" | sed '1d;$d' \
      | yq -p yaml -o json 2>/dev/null \
      || echo '{"mode":"idle","step":"none","role":"unknown","agent_id":"none"}'
  else
    echo '{"mode":"idle","step":"none","role":"unknown","agent_id":"none"}'
  fi
}
```

### write 헬퍼 (bash, atomic)

```bash
write_state() {
  local mode="$1" step="$2" role="$3" agent_id="$4" session_id="$5"
  local file="$CLAUDE_PROJECT_DIR/_wood/state/session.md"
  local tmp="${file}.tmp.$$"
  cat > "$tmp" <<EOF
---
mode: ${mode}
step: ${step}
role: ${role}
agent_id: ${agent_id}
session_id: ${session_id}
last_updated: $(date -Iseconds)
---

# Current Session State

Mode: ${mode} / Step: ${step} / Role: ${role}
EOF
  mv "$tmp" "$file"
}
```

### 보안·정합성

- state 파일은 **commit 안 됨** — 본인 로컬에만 존재
- session_id별 분리 안 함 — 세션 1개만 추적 (단순화). 동시 다중 세션 사용 안 함 가정.
- atomic write로 partial-write 방지. 실패 시 이전 상태 유지.

### 의존성

- **Story 1.1**과 협업 — master agent.md가 init 시 `write_state mode=master/menu step=idle role=$ROLE` 호출
- **Story 1.2** read 헬퍼와 동일 함수 사용 — 중복 정의 피하려면 공통 위치로 추출 가능 (예: `_wood/agents/_state-helpers.sh`)

### 검증 방법

```bash
# 디렉토리 + gitignore
ls -la _wood/state/
git check-ignore _wood/state/session.md   # → 무시 확인
git check-ignore _wood/state/.gitkeep     # → 트래킹 확인 (no output = ignored 아님)

# read/write
write_state "master/menu" "idle" "Admin" "master" "test-session"
cat _wood/state/session.md
read_state | jq .
```

## Testing

- [ ] `_wood/state/.gitkeep`만 git에 트래킹됨
- [ ] `_wood/state/session.md` 작성 후 git status에 미등장
- [ ] read 헬퍼 — 정상 파일/없는 파일/깨진 파일 모두 안전
- [ ] write 헬퍼 — atomic 동작 (race 안 깨짐)

## File List

- `_wood/state/.gitkeep` (신규)
- `_wood/state/.gitignore` (신규)
- `_wood/agents/_state-schema.md` (신규, 대안 2 채택 시)
- `_wood/agents/_state-helpers.sh` (신규, 옵션 — 헬퍼 공통화)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-28 | 0.1 | Story 초안 | @Woo-JongHo |

## Dev Agent Record

### Agent Model Used
(실행 시 기록)

### Completion Notes
(실행 시 기록)
