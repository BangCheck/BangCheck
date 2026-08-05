# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-04T23:17:52.073766+00:00
- Finished at (UTC): 2026-08-04T23:20:35.684539+00:00

## Original task / label

issue-pr-harness-design

## Final prompt

```text
너는 반박 담당이다. 아래 설계 판단은 Claude가 저작했다. 통과시키지 말고 REVISE 관점으로 봐라.
근거가 결론을 지탱하는지, 놓친 대안이 있는지, 진단 자체가 틀렸는지를 본다.

## 대상 저장소
현재 디렉터리(read-only). 다음 파일들을 직접 읽고 판단해라:
- AGENTS.md (프로젝트 AI 가이드, 보호 파일 목록, 역할 체계)
- .github/CODEOWNERS
- .github/workflows/compliance-guard.yml (7개 규칙)
- .github/workflows/protected-files.yml
- .github/PULL_REQUEST_TEMPLATE.md
- _wood/team-roles.yaml
- _wood/workflows/_protocol.md
- _wood/workflows/_compliance-spec.yaml
- _wood/templates/ (issue 템플릿 4종)
- .claude/commands/, .claude/hooks/
- _wood/agents/ 구조 (150여 파일, 840K)

## 배경 — 사용자가 원하는 것
팀원(6~8명, 역할: Admin/PM/Frontend/Backend/Tester/Design)이 다음 플로우를 잘 따라가게 하는 하네스.
  "발견된 결함 → 이슈 등록 → PR로 해결 → 의견은 Bot → 최종은 사람이 확인 후 머지"
질문: 이 하네스를 Claude Code 플러그인으로 만들 것인가, _wood를 정제해 레포에 꽂을 것인가.

## Claude가 실측한 것 (사실 주장 — 이것도 검증 대상)
- `gh api repos/SWYP-Backend/BangCheck/branches/main/protection` → 404 Branch not protected
- `.github/ISSUE_TEMPLATE` 디렉터리 없음
- compliance-guard는 실제로 돌고 있음 (2026-08-03 실행 기록: 성공/실패 혼재)
- 팀 PR은 대부분 2026-05월, 최근 2건(#213 #214)은 CLOSED (머지 안 됨)
- `claude plugin` CLI: marketplace를 URL/path/GitHub repo로 add한 뒤 per-user install

## 반박할 주장 4개

주장 1 — 진단: "main 브랜치 무보호가 진짜 병목이다."
  근거: 보호가 없으면 compliance-guard가 exit 1로 죽어도 머지를 막을 게 없고,
  CODEOWNERS도 브랜치 보호의 Require review from Code Owners가 켜져야 강제된다.
  반박 지점: 이게 정말 병목인가? 팀이 8명이고 최근 PR이 2건뿐인데,
  강제 장치 부재가 원인인가 아니면 결과인가? 우회 가능하다는 것과 실제로 우회되고 있다는 것은 다르다.
  브랜치 보호를 켰을 때 생기는 역효과(Admin 1인 CODEOWNERS 병목, 리뷰 대기 적체)는 계산됐는가?

주장 2 — 정본 위치: "규칙 정본은 _wood(레포)에 두고, 플러그인은 배제하거나 래퍼로만."
  근거: AGENTS.md가 이 팀은 Claude/Gemini/Copilot/Cursor/Windsurf/Aider 6종을 쓴다고 선언했고,
  플러그인은 Claude Code 사용자에게만, 그것도 각자 install 실행 후에 도달한다.
  반박 지점: AGENTS.md의 6개 툴 선언이 실제 사용 현황의 증거인가, 아니면 작성자의 희망인가?
  실제로 6종을 쓰는지 저장소에서 확인 가능한가? 만약 사실상 Claude Code만 쓴다면 결론이 뒤집히는가?
  _wood 840K/150파일이 레포에 있는 것 자체의 비용(모든 AI 세션 컨텍스트 오염, 신규 팀원 진입장벽)은?
  제3의 선택지 - 규칙을 GitHub 네이티브 표면(ISSUE_TEMPLATE, PR template, Actions, CODEOWNERS)에만 두고
  _wood와 플러그인 양쪽을 얇게 만드는 것 - 은 왜 후보에 없었는가?

주장 3 — 매핑: "시나리오 4단계 중 양 끝(이슈 진입점, 사람 승인 게이트)이 비어 있고 가운데만 서 있다."
  반박 지점: compliance-guard의 7개 규칙이 정말 '가운데 한 칸'만 채우는가?
  이슈 라벨 검사(Rule 5)와 issue linkage(Rule 2)는 첫 칸에 걸치지 않는가?
  '비어 있음' 판정이 과장인지 확인해라. 반대로 가운데도 사실은 비어 있는지도 봐라.

주장 4 — 순서: "강제 층(브랜치 보호·required checks·ISSUE_TEMPLATE) 먼저, 안내 층(_wood 정제)은 그다음."
  근거: 안내를 다듬어도 우회 가능하면 안 지켜진다.
  반박 지점: 규칙이 정제되지 않은 상태에서 강제부터 켜면 무슨 일이 나는가?
  compliance-guard 7규칙 중 지금 상태로 강제해도 되는 것과 안 되는 것을 구별해라.
  실측: PR #213 #214가 CLOSED로 끝났고 compliance-guard가 failure였다 - 이게 순서 주장에 대한 반증인가?

## 출력 형식
REVISE 항목별로:
- 어느 주장에 대한 반박인지
- 근거(읽은 파일 경로/줄 인용)
- 왜 치명적인지 또는 왜 사소한지
- 놓친 대안이 있으면 그것

동의하는 주장은 "동의"로 짧게 처리하고 이유만 한 줄. 지면을 반박에 써라.

```

## Final response

```text
판정: **REVISE**. Claude의 결론은 “강제 장치가 필요하다”는 점만 제한적으로 맞지만, 병목 진단·정본 위치·단계 매핑·도입 순서는 현재 증거와 맞지 않습니다.

라이브 GitHub 검증은 이 환경에서 `error connecting to api.github.com`으로 실패했습니다. 따라서 branch protection 404, 8/3 Actions 실행, PR #213·#214 상태는 **독립 검증 불가**입니다. 더구나 로컬 `origin`은 `BangCheck/BangCheck`인데, Claude가 조회한 대상은 `SWYP-Backend/BangCheck`입니다. 이 불일치부터 해소해야 합니다.

## REVISE — 주장 1: “main 무보호가 진짜 병목”

- 근거: 실제 원격은 `https://github.com/BangCheck/BangCheck.git`인 반면, 역할 정본은 `SWYP-Backend/BangCheck`를 primary repo로 선언합니다. [_wood/team-roles.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/_wood/team-roles.yaml:35) Claude의 404는 현재 운영 대상이 아닌 저장소를 조회한 결과일 수 있습니다.

- 근거: CODEOWNERS는 AI 거버넌스와 일부 문서 경로만 소유자로 지정하며, 애플리케이션 전체를 포괄하는 `*` 규칙이 없습니다. [.github/CODEOWNERS](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/CODEOWNERS:9) “Require review from Code Owners”만 켜면 일반 FE/BE PR에 사람 리뷰가 요구된다는 결론은 성립하지 않습니다.

- 왜 치명적인가: “required check + CODEOWNERS”를 켜도 원하는 “Bot 의견 → 사람 최종 확인”이 일반 코드 PR에 구현되지 않을 수 있습니다. 반대로 전체 1인 승인으로 묶으면 Admin 병목을 새로 만듭니다. 현재 CODEOWNERS 구조상 Admin 병목은 일반 코드가 아니라 거버넌스 파일 변경에만 생깁니다.

- 놓친 대안: 실제 운영 repo를 먼저 확정한 뒤, 일반 PR에는 `1명 승인`을 요구하고, CODEOWNERS는 거버넌스 파일에만 적용하십시오. 코드 영역별 owner를 둘 수 없다면 “Admin 승인”을 일반 PR의 필수 조건으로 삼으면 안 됩니다.

**동의(제한적):** required check가 실패해도 branch/ruleset에서 그 check를 필수화하지 않으면 기술적으로 merge 차단이 되지 않는다는 조건부 설명은 맞습니다. 다만 그 전제인 “현재 main 무보호”는 검증되지 않았습니다.

## REVISE — 주장 2: “규칙 정본은 _wood, 플러그인은 래퍼”

- 근거: AGENTS의 6개 도구 열거는 “모두 읽어야 한다”는 정책 선언이지 사용 로그가 아닙니다. [AGENTS.md](/Users/jonghoPro/woo/00_project/08_BangCheck/AGENTS.md:5) 역할 파일에서 실제 LLM 값이 있는 구성원은 Claude Code 1명, Copilot 1명, Claude 2명뿐이며 PM·FE·일부 BE는 미기재입니다. [_wood/team-roles.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/_wood/team-roles.yaml:74)

- 근거: `_wood/agents`는 Claude 주장처럼 “150여 파일·840K”가 아니라 현재 **118 파일·약 612 KiB**입니다. 전체 `_wood`가 **165 파일·약 840 KiB**입니다. 비용 추정의 단위가 섞였습니다.

- 근거: 플러그인 CLI도 “각자 per-user install만”은 과장입니다. 로컬 도움말상 marketplace 추가는 `user` 외에 `project`, `local` scope를 지원하고, install도 세 scope를 지원합니다. 다만 기본 scope가 user인 것은 맞습니다.

- 왜 치명적인가: “6종 도구를 쓰므로 `_wood`가 정본”은 증명되지 않았고, 반대로 “Claude만 쓰므로 플러그인”도 증명되지 않았습니다. 더 큰 문제는 이미 정본이 하나가 아니라는 점입니다. 예를 들어 root PR 템플릿은 `PR Description/Screenshots/Notes`를 요구합니다. [.github/PULL_REQUEST_TEMPLATE.md](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/PULL_REQUEST_TEMPLATE.md:1) 그러나 가드는 `What/Why/Test`를 검사하고, [.github/workflows/compliance-guard.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/compliance-guard.yml:121) Claude 명령은 또 `Summary/Linked Issue/Changes`를 만듭니다. [.claude/commands/swyp-pr.md](/Users/jonghoPro/woo/00_project/08_BangCheck/.claude/commands/swyp-pr.md:82)

- 놓친 대안: **GitHub 네이티브 표면을 집행 정본**으로 두십시오. 즉 Issue form/template, PR template, branch/ruleset, Actions를 한 계약으로 맞춥니다. `_wood`는 사람·AI용 운영 가이드, Claude 플러그인은 선택적 UX 래퍼로 축소합니다. 이 구조면 Claude 사용자에게만 설치 의무를 지우지 않으면서도 도구 간 행동은 일치합니다.

## REVISE — 주장 3: “양 끝은 비고 가운데만 서 있다”

- 근거: GitHub native issue template이 없는 것은 사실입니다. `.github`에는 `ISSUE_TEMPLATE`가 없습니다. 그러나 이슈 진입 자체가 비어 있는 것은 아닙니다. `/swyp-issue`는 page/task/bug/improvement 생성 흐름을 제공하고, [.claude/commands/swyp-issue.md](/Users/jonghoPro/woo/00_project/08_BangCheck/.claude/commands/swyp-issue.md:56) `_wood/templates`에는 화면·FE/BE sub-issue·task 템플릿이 있습니다. 예: 화면 템플릿은 Done Criteria와 리뷰를 포함합니다. [issue-screen.template.md](/Users/jonghoPro/woo/00_project/08_BangCheck/_wood/templates/issue-screen.template.md:22)

- 왜 치명적인가: 문제는 “첫 칸이 비었다”가 아니라 **첫 칸의 생성기·템플릿·검증기가 연결되지 않았다**는 것입니다. `/swyp-issue`는 오히려 라벨을 절대 쓰지 말라고 합니다. [.claude/commands/swyp-issue.md](/Users/jonghoPro/woo/00_project/08_BangCheck/.claude/commands/swyp-issue.md:35) 반면 guard Rule 5는 연결 이슈에 `유형:/순위:/상태:` 라벨을 기대합니다. [.github/workflows/compliance-guard.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/compliance-guard.yml:134)

- 근거: Rule 2와 Rule 5는 분명 첫 단계에 걸칩니다. 다만 둘 다 **이슈 생성 시점이 아니라 PR 생성 뒤**에 검사합니다. Rule 5는 warning이고, API 조회 실패도 조용히 건너뜁니다. [.github/workflows/compliance-guard.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/compliance-guard.yml:152)

- 반대로 가운데도 비어 있습니다. `/swyp-pr`는 이슈 없이 PR을 “warn then allow”합니다. [.claude/commands/swyp-pr.md](/Users/jonghoPro/woo/00_project/08_BangCheck/.claude/commands/swyp-pr.md:181) 상태 라벨도 `status:review`라는 영문을 쓰지만, guard는 `상태:`라는 한글 접두어를 검사합니다. [.claude/commands/swyp-pr.md](/Users/jonghoPro/woo/00_project/08_BangCheck/.claude/commands/swyp-pr.md:56)

- 놓친 대안: “빈/찬 4칸” 모델 대신 `발견 → 표준 이슈 form → PR linkage → Bot check → 필수 인간 승인 → merge`의 각 전이를 하나의 필드 사전과 라벨 사전으로 연결해 검증해야 합니다.

## REVISE — 주장 4: “강제 먼저, _wood 정제 나중”

- 근거: 지금 Rule 1을 required로 만들면 현재 원격 브랜치명 `atlas/baseline`처럼 허용 목록 밖의 정상 작업 브랜치가 실패합니다. Guard의 허용 패턴은 오직 `{feat|fix|refactor|docs|chore|design}/<issue>-<slug>`입니다. [.github/workflows/compliance-guard.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/compliance-guard.yml:79)

- 근거: Rule 2도 강제 전환 불가입니다. 가드는 이슈 연결을 error로 보지만, 공식 `/swyp-pr`는 이슈 없는 PR을 허용합니다. [.github/workflows/compliance-guard.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/compliance-guard.yml:91)

- 근거: Rule 3·4·5는 현재 warning으로 남겨야 합니다. 커밋 훅은 scope와 이슈 번호를 권장하지만, guard는 훨씬 느슨한 다른 정규식을 씁니다. [.claude/hooks/commit-guard.sh](/Users/jonghoPro/woo/00_project/08_BangCheck/.claude/hooks/commit-guard.sh:24) PR 템플릿과 라벨 사전도 위에서 본 대로 서로 충돌합니다.

- 근거: Rule 7은 security error로 유지할 후보지만, 파일 조회를 `per_page: 300`으로만 가져와 그 이후 파일을 검사하지 않습니다. [.github/workflows/compliance-guard.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/compliance-guard.yml:175) 또 `skip-compliance` 라벨이 있으면 모든 검사를 건너뛰며, 실제 라벨 부여자가 Admin인지 검증하지 않습니다. [.github/workflows/compliance-guard.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/compliance-guard.yml:46)

- 추가 결함: Protected Files guard도 AGENTS가 보호한다고 한 hooks, settings, context, spec과 compliance-guard 자체를 보호 패턴에서 누락합니다. [AGENTS.md](/Users/jonghoPro/woo/00_project/08_BangCheck/AGENTS.md:40) [.github/workflows/protected-files.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/protected-files.yml:41)

- PR #213·#214가 failure 뒤 CLOSED라는 주장은 현재 확인하지 못했습니다. 설령 사실이어도 “강제부터”의 증거가 아닙니다. 실패가 규칙 위반 때문인지, 규칙 충돌 때문에 정상 PR이 거절된 것인지, 사람이 닫은 것인지를 구분하지 못합니다.

- 놓친 대안: 순서는 반대가 아니라 **정합 후 점진 강제**입니다.

  1. 실제 운영 repo와 라벨·상태·PR 섹션의 단일 계약을 확정  
  2. Issue form과 PR template 및 생성 명령을 그 계약에 맞춤  
  3. 2~4주 warning-only로 실제 PR 실패 원인을 측정  
  4. bypass 라벨의 권한·감사 경로를 고정  
  5. 그 뒤 Rule 2와 보완된 Rule 7부터 required check로 전환  
  6. 일반 PR의 1인 human approval과 거버넌스 경로의 CODEOWNERS를 분리 적용

즉, 선택지는 “플러그인 vs 거대한 `_wood`”가 아닙니다. 먼저 GitHub에서 집행 가능한 한 계약을 만들고, `_wood`와 플러그인은 그 계약을 소비하는 얇은 안내층으로 재배치해야 합니다.
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
