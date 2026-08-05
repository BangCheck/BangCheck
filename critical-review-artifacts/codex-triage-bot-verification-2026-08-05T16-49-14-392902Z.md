# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-05T16:45:52.141546+00:00
- Finished at (UTC): 2026-08-05T16:49:14.390805+00:00

## Original task / label

triage-bot-verification

## Final prompt

```text
[실행 조건] codex exec 비대화형. 되묻지 마라. 비용 승인 끝.
AGENTS.md STEP 1 이 가리키는 _wood/workflows/_protocol.md 의 승인 게이트·preflight 는
이 요청에 적용되지 않는다. (Y/N)·확인 요청·메뉴 금지. 첫 출력부터 본문.

## 임무 — 설계가 아니라 **개발 테스트·검증**이다

방금 구현한 이슈 분류·배정 봇을 검증하라. "어떻게 설계할까"는 이미 끝났다.
이제 "이 코드가 실제로 도는가, 무엇이 깨뜨리는가"를 본다.

깨뜨릴 입력을 찾아라. 통과시키지 마라.

## 대상 — 직접 읽어라
- .project-atlas/triage-routing.yaml          (라우팅 규칙, routingVersion 2026-08-05.1)
- .project-atlas/tools/triage_route.py        (판정 — 1·2단 공용)
- .project-atlas/tools/triage_comment.py      (코멘트 생성·갱신)
- .project-atlas/tools/hermes/atlas_issue_analyzer.py  (2단, Hermes 에서 실행)
- .project-atlas/tools/hermes/README.md
- .project-atlas/tools/sync_check.py · project_defects.py · resolve.py (기존 도구와의 간섭)
- .github/workflows/atlas-triage.yml          (아직 v1 triage_issue.py 를 부른다 — 갱신 필요)
- .project-atlas/tools/triage_issue.py        (v1. 5종 판정. 이제 역할이 겹친다)

## 구조 (검증 대상)

1단 GitHub Actions
  이슈 본문에서 정규식으로 경로를 뽑는다
  → 저장소에 실재하는지 확인
  → triage-routing.yaml 의 rules 를 위에서부터 첫 매칭
  → 코멘트로 파트·담당자를 제안

2단 Hermes (woojongho Mac mini)
  1단이 경로를 못 찾은 이슈만
  → hermes -z "<프롬프트>" -m gpt-5.6-luna --provider openai-codex --cli
  → LLM 이 JSON 으로 경로 최대 3개를 답한다
  → 실재 검사 → triage_comment.py --path 로 넘김 → 같은 규칙으로 배정

## 실측된 것
- `hermes -z` 는 --provider 를 명시해야 돈다. HERMES_HOME 만으로는
  "No LLM provider configured" 로 죽는다. 명시하면 "1+1" 에 "2" 를 답했다.
- 라우팅 확정: frontend/** → @Woo-JongHo (전부),
  backend auth/user → @dlwldP, backend checklist → @std-yong,
  backend 나머지 → @minwoo-l, .github/.project-atlas/_wood/.claude/ → @Woo-JongHo
- ~/HermesHome/repos/bangcheck 에 클론 완료 (aa352e6)
- ~/HermesHome/scripts/ 의 RPA 봇 5개 저장소 폴링은 건드리지 않았다
- 로컬 dry-run 결과: 경로 있음→frontend/@Woo-JongHo, 없음→미분류,
  --path 로 BE 체크리스트 경로 주면→backend-checklist/@std-yong,
  실재하지 않는 경로 주면→미분류
- `gh api user` 는 GITHUB_TOKEN 으로 403 (앱 설치 토큰에 현재 사용자 없음)
- `gh issue view --json comments` 는 GraphQL 노드 ID 를 준다. REST PATCH 는 숫자 ID 요구

## 검증할 것

1. **깨뜨리는 입력을 찾아라.**
   PATH_RE 가 잘못 잡는 문자열은? 코드블록 안의 예시 경로, URL, 마크다운 링크,
   `frontend/**` 같은 glob 표기, 한글이 섞인 경로, 매우 긴 본문.
   decide() 가 잘못된 판정을 내는 조합은?

2. **fnmatch 로 glob 을 쓰는 것이 맞는가.**
   `frontend/**` 가 `fnmatch` 에서 의도대로 동작하는가?
   `backend/**/checklist**` 같은 패턴은? 실제로 시험해서 답하라.

3. **2단의 실패 경로.**
   LLM 이 JSON 이 아닌 것을 낼 때, 마크다운 코드펜스로 감쌀 때,
   경로를 지어낼 때, 타임아웃될 때, hermes 가 죽을 때 각각 어떻게 되는가?
   600초 타임아웃이 적절한가? 큐도 재시도도 없는데 실패하면 그 이슈는 어떻게 되는가?

4. **v1(triage_issue.py)과 v2(triage_comment.py)의 충돌.**
   워크플로는 아직 v1 을 부른다. 둘 다 돌면 이슈에 코멘트가 둘 생긴다.
   토큰이 `atlas-triage:v1` 과 `atlas-triage:v2` 로 달라 서로를 갱신하지 못한다.
   v1 을 어떻게 처리해야 하는가 — 삭제? 축소? 기존 24건의 v1 코멘트는?

5. **기존 도구와의 간섭.**
   sync_check 의 SYN-01~03, project_defects 의 마커 회수, resolve 의 ISS-01 이
   이번 변경으로 깨지는 곳이 있는가?

6. **테스트가 없다.**
   resolve.py 에는 test_resolve.py 가 있는데 이번 3개 파일에는 없다.
   무엇을 붙들어야 하는가 — 구체적 케이스 목록으로 답하라.

## 출력
1) 사실 오류
2) **깨뜨리는 입력** — 재현 가능한 형태로. 추측이면 추측이라 적어라
3) 항목별 판정과 고칠 것
4) 테스트 케이스 목록 (파일명·케이스명·기대값)
5) 지금 배포하면 안 되는 이유가 있는가
간결하게. 근거 없는 문장을 쓰지 마라.

```

## Final response

```text
## 1) 사실 오류

- 현재 Actions는 v2가 아니라 v1만 실행합니다: [atlas-triage.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/atlas-triage.yml:84). 따라서 “1단이 라우팅 후 v2 코멘트”는 아직 사실이 아닙니다.
- 저장소 안에는 Hermes 2단을 호출·스케줄하는 연결이 없습니다. `STATE`도 선언만 되고 사용되지 않습니다: [atlas_issue_analyzer.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/hermes/atlas_issue_analyzer.py:32).
- v1은 registry 결함 연결 5종 판정, v2는 담당 라우팅입니다. 완전한 대체 관계는 아닙니다. 둘을 같이 돌리면 토큰이 달라 코멘트가 각각 생깁니다.

## 2) 깨뜨리는 입력

실제 실행으로 확인했습니다.

- 외부 URL / Markdown 링크 / 코드블록도 실제 파일 경로면 근거로 채택됩니다.

  ```md
  ```text
  frontend/src/store/use-auth-store.ts
  ```
  ```

  URL `https://…/frontend/src/store/use-auth-store.ts`도 동일합니다. `PATH_RE`가 문맥을 구별하지 않습니다: [triage_route.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/triage_route.py:36).

- 경로 탈출로 잘못 배정됩니다.

  ```text
  frontend/../.project-atlas/tools/triage_route.py
  ```

  실재 검사 통과 후 `frontend/**`에 먼저 매칭되어 frontend로 배정됩니다. 실제 대상은 Atlas입니다. `backend/../frontend/<실제파일>`은 backend로 위장할 수 있습니다. 원인은 정규화·repo 경계 검증 전 `fnmatch`를 하는 것입니다: [triage_route.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/triage_route.py:52), [113](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/triage_route.py:113).

- 한글 경로는 부분 매치됩니다.

  ```text
  frontend/src/방목록/화면.tsx
  ```

  현재 정규식은 `frontend/src/`만 뽑고, 실재하는 디렉터리라 frontend로 배정합니다. “경로를 못 찾음”이 아닙니다.

- `frontend/**`, `backend/**/checklist**` 같은 glob 표기는 경로로 인식되지 않습니다. 다만 `fnmatch` 자체는 slash도 `*`로 매치합니다. 실측상:
  - `frontend/**`는 `frontend/a`, `frontend/a/b` 모두 매치.
  - `backend/**/checklist**`는 의도한 API 경로뿐 아니라 `backend/api/checklistThing.java`, `backend/.../domain/checklist/...`도 매치.
  - `backend/checklist/Checklist.java`는 매치하지 않음.

  즉 `**`는 재귀 디렉터리 연산자가 아니라 사실상 `*`와 같은 문자열 glob입니다. API 전용 의도라면 현 패턴은 과도합니다.

- 2단은 존재하지 않는 예시 `frontend/not-real.tsx`만 있어도 “1단 소관”이라며 LLM을 호출하지 않고 성공 종료합니다: [atlas_issue_analyzer.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/hermes/atlas_issue_analyzer.py:99). 1단에서 실재 검사 후 미분류가 되었더라도 복구되지 않습니다.

- 긴 본문에는 후보 수 상한이 없습니다. 1단은 모든 정규식 매치에 대해 파일 존재 검사를 수행합니다. 2단은 본문 앞 4,000자만 LLM에 보내므로 뒤쪽의 핵심 증상은 소실됩니다: [74](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/hermes/atlas_issue_analyzer.py:74).

## 3) 항목별 판정과 고칠 것

- `fnmatch`: 경로 문자열 규칙으로는 동작하지만, 디렉터리 경계를 지키지 않아 라우팅 보안 경계로는 부족합니다. 후보를 `PurePosixPath`로 검증하고 `..`, 절대경로, repo 밖 resolve 결과를 거부한 뒤 정규화된 경로로 판정해야 합니다. 파일 또는 명시적으로 허용한 디렉터리만 근거로 삼으십시오.
- JSON 아닌 출력: `llm-failed`, exit 1. fenced JSON은 현재 통과합니다. 그러나 JSON 두 개나 prose의 `{…}`가 섞이면 greedy `\{.*\}` 때문에 파싱 실패합니다: [82](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/hermes/atlas_issue_analyzer.py:82).
- 환각 경로: 일반적인 존재하지 않는 경로는 `not-found`, exit 0, 코멘트 없음입니다. 그러나 `../` 위장은 통과합니다.
- timeout / Hermes 실행 파일 없음: `TimeoutExpired`, `FileNotFoundError`가 잡히지 않아 traceback 종료합니다. 제가 모킹으로 재현했습니다. Hermes가 non-zero를 반환하는 경우만 `llm-failed`로 처리됩니다.
- v2 코멘트 실행 실패: 2단은 `check=False`라 실패해도 `routed`, exit 0을 출력합니다: [123](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/hermes/atlas_issue_analyzer.py:123).
- 600초: 적절하다고 검증할 근거가 없습니다. 한 건이 10분 동안 실행을 점유하며, 큐·재시도·durable state가 없습니다. 실패 이슈는 다음 명시적 재실행 전까지 유실됩니다. `STATE`를 실제로 써서 attempt/status/nextRetry를 남기고, 짧은 timeout + 제한 재시도를 둬야 합니다.
- v1/v2: 즉시 v1 호출을 workflow에서 제거하고 v2를 호출해야 합니다. 다만 v1의 registry 판정이 계속 필요하다면 v2 코멘트에 병합한 뒤 단일 토큰으로 마이그레이션해야 합니다. 기존 v1 24건은 삭제하지 말고, 마이그레이터로 v1 봇 코멘트를 v2 형식의 단일 라이브 코멘트로 전환하거나 “legacy 1건 + v2 1건”을 명시적으로 허용해야 합니다.
- 기존 도구: v2는 이슈 본문·registry를 수정하지 않으므로 `sync_check`의 SYN-01~03, `project_defects`의 본문 마커 회수, `resolve`의 ISS-01을 직접 깨지는 않습니다. [sync_check.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/sync_check.py:56)는 본문 `atlas-defect` 마커만 봅니다. 단, v2 라우팅은 미등재 이슈를 registry에 연결하지 않으므로 `--suggest` 목록은 계속 남습니다.

## 4) 필요한 테스트

| 파일 | 케이스 | 기대값 |
|---|---|---|
| `test_triage_route.py` | `test_reject_path_traversal` | `frontend/../.project-atlas/...` 미분류 |
|  | `test_external_url_is_not_evidence` | URL만 있으면 미분류 |
|  | `test_fenced_example_is_not_evidence` | 코드블록 예시는 미분류 |
|  | `test_korean_path_no_partial_directory_match` | `frontend/src/` 부분 경로 채택 금지 |
|  | `test_glob_text_is_not_path` | `frontend/**` 미분류 |
|  | `test_auth_checklist_backend_frontend_order` | 각 확정 담당자와 파트 |
|  | `test_multi_part_conflict` | frontend+backend면 conflict |
| `test_triage_comment.py` | `test_v2_comment_updates_only_own_numeric_rest_comment` | 봇 v2 하나만 PATCH |
|  | `test_malformed_v2_token_does_not_crash` | 새 코멘트 또는 안전 실패 |
|  | `test_legacy_v1_migration_policy` | 이슈당 라이브 봇 코멘트 하나 |
| `test_atlas_issue_analyzer.py` | `test_fenced_json_accepted` | 경로 목록 반환 |
|  | `test_multiple_json_objects_rejected` | 구조화된 `llm-failed` |
|  | `test_timeout_and_missing_hermes_are_handled` | traceback 없이 재시도 가능 실패 기록 |
|  | `test_nonexistent_body_path_does_not_skip_llm` | 2단 호출 |
|  | `test_paths_schema_and_max_three` | list[str] 최대 3개만 허용 |
|  | `test_comment_failure_is_not_routed` | non-zero, 실패 상태 |
| `test_atlas_triage_workflow.py` | `test_workflow_invokes_v2_not_v1` | v2 호출, v1 없음 |

## 5) 지금 배포하면 안 되는 이유

안 됩니다.

1. Actions가 v2를 전혀 실행하지 않습니다.  
2. `../` 입력으로 실제 Atlas 파일을 frontend로 오배정할 수 있습니다.  
3. 2단은 존재하지 않는 경로에도 skip하고, timeout·Hermes 사망·코멘트 실패를 신뢰성 있게 처리하지 않습니다.  
4. v1/v2 단일 코멘트·마이그레이션 정책이 구현돼 있지 않습니다.
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
