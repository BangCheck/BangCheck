---
story:
  id: 1.4
  title: "Slash command thin wrapper화"
  status: Backlog
  epic: 1
  owner: "@Woo-JongHo"
  estimate: "M (3-4h)"
---

# Story 1.4: Slash command thin wrapper화

## Status
Backlog (Phase B — Epic 1 완료 후 진행)

## Story

**As a** Admin (Woo-JongHo)
**I want** `.claude/commands/swyp-*.md`를 포인터만 남기는 thin wrapper로 전환하고 실제 워크플로우를 `.claude/skills/swyp-*/SKILL.md`로 분리해서
**so that** 커맨드가 하네스 실행 단위로 동작하고, 워크플로우 로직이 보호 파일 변경 없이 `_wood/` 하위에서 독립 관리된다.

## Background

현재 `.claude/commands/swyp-*.md`는 워크플로우 전체 내용을 인라인으로 포함한다.
하네스화 방향은 다음과 같다:

```
현재:
  commands/swyp-entry.md  ← 전체 워크플로우 인라인

목표:
  commands/swyp-entry.md  ← "load _wood/workflows/01-entry.md" 포인터만
  skills/swyp-entry/
    SKILL.md              ← 실제 워크플로우 본체
```

이 구조에서 commands는 하네스 진입점, skills가 실행 단위가 된다.

## Acceptance Criteria

1. `.claude/commands/swyp-*.md` 각 파일이 포인터 역할만 수행한다 (실행 로직 없음).
2. `.claude/skills/swyp-{name}/SKILL.md`에 실제 워크플로우가 위치한다.
3. 기존 슬래시 커맨드(`/swyp-entry`, `/swyp-commit` 등) 동작이 깨지지 않는다.
4. `_wood/workflows/`와 `SKILL.md` 간 단방향 참조 — SKILL.md가 `_wood/` 파일을 로드하는 방식.
5. 보호 파일 변경이므로 Admin 직접 작업 또는 별도 PR + Admin 검토.

## Dev Notes

### 하네스 실행 모델

SKILL.md 구조 (참고):
```markdown
---
name: swyp-entry
description: '세션 진입 + 상태 파악. /swyp-entry 호출 시 사용.'
---

## On Activation
1. Load config
2. exec _wood/workflows/01-entry.md
```

### 주의
- Phase A (Story 1.1~1.3)는 `_wood/agents/master/` 추가만 — 기존 commands 무변경
- 이 Story는 commands 파일을 직접 변경하므로 **반드시 Phase A 완료 후** 진행
- `.claude/commands/`는 보호 파일 범위 (`_wood/workflows/**`도 동일)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-28 | 0.1 | Backlog 초안 — 하네스화 방향 반영 | @Woo-JongHo |
