# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-05T10:25:41.235044+00:00
- Finished at (UTC): 2026-08-05T10:28:51.697383+00:00

## Original task / label

hooks-and-sync-design

## Final prompt

```text
[실행 조건 — 먼저 읽어라]
codex exec 비대화형 실행이다. 되묻는 순간 답할 사람이 없어 통째로 실패한다.
- 비용 승인은 끝났다. 진행 여부를 묻지 마라.
- 이 저장소 AGENTS.md STEP 1이 가리키는 _wood/workflows/_protocol.md 의 승인 게이트
  ("Do you want to proceed with this action? (Y/N)")와 preflight 는 이 요청에 적용되지 않는다.
- (Y/N) 질문·확인 요청·메뉴 출력 금지. 첫 출력부터 본문으로 시작해라.

너는 반박 담당이다. 아래는 Claude 저작이다. 통과시키지 말고 REVISE 관점으로 보되,
마지막에 실행 가능한 확정안을 하나 내라.

## 대상 — 직접 읽어라 (read-only)
- .project-atlas/tools/sync_check.py        (오늘 신규)
- .project-atlas/tools/project_defects.py   (오늘 신규)
- .project-atlas/tools/resolve.py           (RTE-02/03 오늘 추가)
- .project-atlas/tools/test_resolve.py
- .project-atlas/schema.yaml, registry/defects.yaml
- .github/workflows/atlas-resolve.yml       (sync_check 배선 포함)
- .claude/settings.json, .claude/hooks/*.sh, .claude/hooks/context-inject.mjs
- .claude/commands/swyp-pr.md, swyp-project.md, swyp-sync.md
- .github/scripts/compliance-rules.mjs 와 그 테스트

## 이미 끝난 교차검증 (반복 금지)
critical-review-artifacts/ 아래 3건. 수용된 결론:
정합 후 점진 강제, changed-files↔implementedBy 대조 불가, PR은 provenance/registry는 현재 귀속,
guard 수정 범위(A·C·D·E·F·G + Rule 5 비활성화), skip-compliance 제거,
확정 순서(runtime→baseline + RTE-02 → 브랜치보호 → Issue/PR 선언형식 → PR 선언 대조).

## 오늘 이후 상황 (사실)
- main 이 atlas/baseline 을 흡수했다. /project-map 이 프로덕션에 공개됐다.
- 프론트 자동 배포가 처음 성공했다. 전용 IAM 사용자(bangcheck-fe-deploy, 최소 권한) 사용.
- 배포 중 사고: workflow 가 빈 VITE_API_URL 을 주입해 .env.production 을 덮었고
  프로덕션이 런타임 throw 로 백지가 됐다. secret 채워 복구, 이후 env 주입 자체를 제거(PR #223).
- defects.yaml 27건. BC-DEPLOY-01 을 Issue #222 로 투영하고 번호를 역기입했다(멱등 확인).
- 열린 이슈: #217 baseline 게이트, #220 훅 결함, #221 승인 데드락, #224 깨진 스킬 3개.
- protected-files 는 브랜치 보호가 없어 빨간불만 켜고 머지를 못 막는다.

## 반박할 주장

주장 1 — sync_check.py 를 resolve.py 와 분리한 것
  근거: resolve.py 는 오프라인 결정론이어야 하고, GitHub 조회를 넣으면 API 장애가
  "registry 가 어긋났다"로 보고돼 검사기를 믿을 수 없게 된다.
  반박 지점: 분리가 옳은가? 두 도구가 따로 돌면 "resolve 는 통과인데 sync 는 실패"
  같은 상태가 생기는데 그 조합의 의미를 사람이 읽을 수 있는가?
  SYN-01~04 의 규칙 경계가 겹치거나 빠진 것은 없는가?
  gh 실패를 exit 2 로 내고 job 을 실패시키는 것이 맞는가 — API 장애로 PR 이 막히는 것과
  검사를 건너뛰는 것 중 어느 쪽이 나은가?
  sync_check.py 에는 자체 테스트가 없다. resolve.py 는 test_resolve.py 가 붙들고 있는데
  이쪽은 없다 — 이게 치명적인가?

주장 2 — 역방향(GitHub→registry)은 보고까지만 한다
  근거: registry 항목은 evidence 경로·심볼·severity·disposition 을 요구하는데
  자유 서술 이슈에서 기계가 만들 수 없다. 지어내면 registry 가 거짓을 담는다.
  반박 지점: 정말 자동화 불가인가? 부분 자동화(초안 생성 후 사람 승인)는 왜 배제됐는가?
  SYN-05(미등재 열린 이슈)를 --suggest 로만 내는 것이 옳은가 — 기본에서 빼면
  아무도 안 보게 되지 않는가?

주장 3 — 훅은 강제가 아니라 "빠른 피드백" 층이다
  근거: 훅은 Claude Code 사용자에게만 도달하고 우회 가능하다. 강제는 CI 가 한다.
  반박 지점: 그렇다면 protected-gate.sh(#220)를 고칠 가치가 있는가?
  막지 못하는 훅과 우회 가능한 훅은 실질적으로 같지 않은가?
  commit-guard 를 PostToolUse → PreToolUse 로 옮기자는 제안은 기술적으로 가능한가 —
  Claude Code 의 PreToolUse(Bash) 가 실제로 명령을 차단할 수 있는지 코드/문서로 확인해라.

주장 4 — 신규 훅 2개 제안
  (a) atlas-guard: PostToolUse(Write|Edit) on .project-atlas/registry/** → resolve.py 자동 실행
  (b) branch-guard: PreToolUse(Bash) on `git checkout -b` → 브랜치명 컨벤션 확인
  반박 지점: (a)는 매 편집마다 1047건 검사를 돌린다. 실제 비용은 얼마이고 가치가 있는가?
  registry 를 여러 번 편집하는 중간 상태는 당연히 어긋나는데 그때마다 경고하면
  경고가 배경이 되지 않는가?
  (b)는 브랜치를 이미 판 뒤에는 무용하다. 더 나은 지점이 있는가?

주장 5 — 순서: ①깨진 스킬 수정 ②protected-gate 반영 ③훅 테스트 하네스 ④훅 확장
  반박 지점: ③을 ②보다 뒤에 두는 것이 맞는가? 테스트 없이 훅을 고치면
  그 수정이 맞는지 무엇으로 아는가?
  그리고 이 순서가 이미 확정된 순서(브랜치 보호 → Issue/PR 선언형식 → PR 선언 대조)와
  어떻게 맞물리는가 — 둘이 경쟁하는가?

## 추가로 봐라
- 오늘 만든 것 중 죽은 배선·검사되지 않는 선언이 새로 생겼는가
- project_defects.py 의 write_back 이 YAML 을 텍스트로 조작한다. 깨질 조건은?
- 브랜치 보호가 없는 상태에서 required check 를 켜는 것 말고
  지금 당장 실효가 있는 강제 수단이 있는가

## 출력
1) 사실 오류 (있으면)
2) 주장별 판정 — 유지/수정/폐기 + 한 줄 근거
3) 확정 순서 하나
4) 놓친 결함
간결하게. 동의는 한 줄.

```

## Final response

```text
## 1) 사실 오류

- `protected-gate.sh`와 `commit-guard.sh`는 실제 Hook 입력인 `.tool_input.*`가 아니라 최상위/`.input.*`을 읽는다. 실제 형식 입력으로 둘 다 통과했다. 즉 #220은 “약한 훅”이 아니라 현재 **죽은 훅**이다. Claude Code의 `PreToolUse(Bash)`는 exit 2로 실제 차단 가능하다. [공식 Hooks 문서](https://code.claude.com/docs/en/hooks-guide)
- `BC-DEPLOY-01`은 `issue: 222`, `FIX_PLANNED`인데 현재 브랜치의 수정 커밋이 `closes #222`다. 머지 후 다음 PR에서 SYN-04가 정상 해결을 위반으로 막는다. disposition은 해결 상태가 아니라 처리 방침이다.
- SYN-05는 `--suggest` 전용이라는 설명과 달리 `--json`에서는 항상 `unregistered_open`을 출력한다.
- 브랜치 보호가 없으므로 실패한 Protected Files/Compliance/Atlas check는 merge를 막지 않는다. workflow의 “equivalent enforcement” 설명은 사실이 아니다.

## 2) 주장별 판정

- 주장 1 — **수정**: `resolve`/`sync` 분리는 유지한다. `exit 2`도 fail-closed가 맞다. 다만 sync 단위테스트, 300건 절단 제거, malformed marker 처리, SYN-04 재정의가 선행돼야 한다.
- 주장 2 — **수정**: GitHub→registry 자동 확정은 금지한다. 대신 `--suggest`는 정기 보고/PR artifact로 노출하고, 사람이 선택한 항목만 “초안” 생성하도록 한다.
- 주장 3 — **수정**: 훅 수정 가치는 있다. CI 대체물이 아니라 빠른 피드백이기 때문이다. 다만 현재는 입력 파싱 오류로 작동하지 않는다. commit guard의 PreToolUse 전환은 가능하지만 CI/브랜치 규칙이 최종 권위여야 한다. [공식 PreToolUse 차단 계약](https://code.claude.com/docs/en/hooks)
- 주장 4(a) — **폐기**: resolver는 실측 0.10–0.14초라 비용은 작지만, registry 중간 편집마다 1,047건 검사 경고를 내는 신호 품질이 나쁘고 PostToolUse라 차단도 못 한다.
- 주장 4(b) — **폐기**: `git checkout -b`만 막아도 `git switch -c` 등으로 비켜 간다. 이미 만든 브랜치에도 무력하다. PR head를 보는 compliance 규칙을 required check로 승격하는 편이 맞다.
- 주장 5 — **수정**: 훅 테스트 하네스는 protected-gate 수정보다 먼저다.

동의: 오프라인 결정론 검사와 네트워크 정합 검사는 분리하는 편이 맞다.

## 3) 확정 순서

1. SYN-04 계약 수정, `test_sync_check.py` 추가, `project_defects.py` write-back 테스트 추가.
2. #224의 죽은 `/swyp-sync` 참조 4개를 복구.
3. 실제 Hook JSON fixture 기반 하네스 추가.
4. 그 하네스로 protected/commit guard를 수정하고, 신규 훅 2개는 추가하지 않음.
5. 확정 순서대로 runtime → baseline(#217) + RTE-02 확인.
6. 브랜치 보호/ruleset에 Atlas Resolve·Compliance Guard·Protected Files를 required로 등록.
7. Issue/PR 선언 형식 정리.
8. PR 선언 대조를 추가.

브랜치 보호 전 즉시 실효 있는 강제는 일반 기여자의 direct-push/merge 권한을 제거하고 Admin만 merge하게 하는 접근 제어뿐이다. Actions, CODEOWNERS, 로컬 훅만으로는 막지 못한다.

## 4) 놓친 결함

- [`sync_check.py`](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/sync_check.py:65)의 닫히지 않은 marker는 `ValueError` traceback으로 끝난다.
- Issue 목록/중복 회수 검색이 각각 300/100건으로 잘려 SYN-01 오탐 또는 중복 Issue 생성이 가능하다.
- [`project_defects.py`](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/project_defects.py:126)는 `issue: null/0/false`에서 중복 키를 삽입하고, 비원자적 텍스트 overwrite라 중단 시 YAML을 손상시킬 수 있다.
- [`test_resolve.py`](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/test_resolve.py:45)는 sync를 전혀 시험하지 않는다.
- schema의 `auth`, `rerunSafe`, `switchedOver`, evidence `line` 타입과 `uses.operationId` 실제 참조는 resolver가 검사하지 않는다.
- [`swyp-sync.md`](/Users/jonghoPro/woo/00_project/08_BangCheck/.claude/commands/swyp-sync.md:3)의 참조 workflow 4개는 모두 없다.
- compliance 테스트는 리스트/임계값을 spec에서 완전히 파싱하지 않고 하드코딩으로 보정하므로, “같은 spec을 검사한다”는 선언이 부분적으로만 참이다.
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
