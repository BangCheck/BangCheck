# SWYP compliance-guard Action 비판적 평가와 개선안

> **보류 상태 — PR/CI-CD 구성요소를 다시 볼 때 여기부터 읽는다.**
>
> - 초안(이 문서): Claude 저작. 1차 출처 8종 축자 인용
> - 교차 검토: `codex-pr-policy-review-2026-08-03T21-22-50-949977Z.md` — **REVISE**, MAJOR 16 · MINOR 2
> - 검토 지적 중 **저장소 사실로 직접 대조해 확인한 것 3건**(아래). 이 셋은 문서 본문에 아직 반영 안 됨
>
> **먼저 고칠 것 (정책 논쟁보다 앞선다)**
> 1. `skip-compliance` 라벨이 `forbidden_files`(secret 검사)까지 통째로 끈다.
>    `compliance-guard.yml`의 모든 단계가 `if: steps.skip_check.outputs.skip != 'true'`로 막혀 있다.
>    트리거에 `labeled`가 없어 라벨을 붙여도 재검사되지 않는다.
> 2. `commit_issue_ref`는 SPEC에만 있고 워크플로에 구현이 없다 — 선언과 구현의 어긋남.
> 3. `.github/PULL_REQUEST_TEMPLATE.md`는 `PR Description/Screenshots/Notes/Checklist`인데
>    Action은 `What/Why/Test`를 찾는다. 공식 템플릿을 쓰면 반드시 경고가 뜬다.
>
> **본문에서 교정이 필요한 것** (검토가 지적, 미반영)
> - "어느 대형 프로젝트도 브랜치명을 강제하지 않는다" → 표본 3개에서 전체로 비약. GitLab push rules 등 반례 있음
> - `issue_linkage` 권장 등급이 §3·§6·§11에서 서로 다름
> - §10 예시 계산 불일치 (크기점수 1,268 표기 / 리뷰시간은 1,342 기준)
> - Linux 메일 패치 요구를 GitHub PR 조건으로 과번역 (§4)
> - §8의 `git branch -m` 서술 부정확 (로컬 rename 자체는 PR에 영향 없음)
>
> 결론 방향은 유지된다: **자동 검사는 되돌릴 수 없는 것만 막고, 나머지는 리뷰어에게 넘긴다.**


작성 2026-08-04 · 저작 패스(Claude) 초안 · Codex 교차 비판 대상

**근거 원칙**: 아래 모든 주장은 각 프로젝트의 공식 문서에서 직접 확인한 문장에 붙인다.
확인하지 못한 것은 "확인 못 함"이라고 적는다. 관행을 "글로벌 표준"이라 부르지 않는다.

## 검증한 1차 출처 (2026-08-04 실측)

| # | 출처 | 확인한 핵심 문장 |
|---|---|---|
| S1 | Linux `Documentation/process/submitting-patches` | "Separate each logical change into a separate patch." / "Whether your patch is a one-line bug fix or 5000 lines of a new feature, there must be an underlying problem that motivated you to do this work." / "take special care to ensure that the kernel builds and runs properly after each patch in the series." |
| S2 | Git `Documentation/SubmittingPatches` | 본문은 "1. explains the problem the change tries to solve … 2. justifies the way the change solves the problem … 3. alternate solutions considered but discarded, if any." / 제목은 `area: ` 접두 (`doc: clarify …`) / "If your description starts to get too long, that's a sign that you probably need to split up your commit to finer grained pieces." |
| S3 | Kubernetes contributor guide (kubernetes.dev) | "Small commits and small pull requests get reviewed faster and are more likely to be correct than big ones." / "If your pull request takes 60 minutes to review, the reviewer's eye for detail is not as keen in the last 30 minutes." / **"Do not link pull requests by `#` in a commit description, because GitHub creates lots of spam."** / LGTM + approve + OWNERS + Tide 병합 큐 |
| S4 | rustc-dev-guide contributing | "The compiler team has a special process for large changes … This process is called a Major Change Proposal (MCP)." / "Avoid updating an already-green PR under review unless necessary. During review, make incremental commits to address feedback. Prefer to squash or rebase only at the end, or when a reviewer requests it." / **"it is generally preferred to put the 'closes #123' text in the PR description rather than the commit message; particularly during rebasing, citing the issue number in the commit can 'spam' the issue in question."** / `@bors r+` 병합 큐 |
| S5 | React `how-to-contribute` | 브랜치 이름 규칙 **없음**, 커밋 메시지 형식 규칙 **없음**. "We still require that your pull request contains unit tests for any new functionality." / "If you're only fixing a bug, it's fine to submit a pull request right away but we still recommend to file an issue" |
| S6 | Conventional Commits v1.0.0 | "a lightweight convention on top of commit messages" / 목적은 "Automatically generating CHANGELOGs", "Automatically determining a semantic version bump", "Triggering build and publish processes" / FAQ: squash 워크플로면 메인테이너가 정리하면 되므로 기여자에게 부담을 주지 않는다 |
| S7 | Google eng-practices `small-cls` | **"100 lines is usually a reasonable size for a CL, and 1000 lines is usually too large, but it's up to the judgment of your reviewer."** / "A 200-line change in one file might be okay, but spread across 50 files it would usually be too large." / "You can usually count deletion of an entire file as being just one line of change" / 신뢰하는 자동 리팩토링 도구 산출물은 예외 |
| S8 | GitHub docs `managing-a-merge-queue` | 필수 리뷰는 큐 **진입 전**에 강제되고, 필수 체크는 큐 **안에서 병합된 상태**로 돌아간다. Actions를 쓰면 `merge_group` 이벤트를 트리거에 추가해야 한다 |

**방법론 경계 (혼동 금지)**
- S1·S2는 **메일 패치** 워크플로다. 거기서 "history 재작성"은 정상이다 — 재제출이 곧 새 패치이기 때문이다. GitHub PR에서 force-push는 같은 뜻이 아니다.
- S3·S4·S5는 **GitHub PR**(또는 bors) 워크플로다. Action 개선의 직접 비교 대상은 이쪽이다.
- 프로젝트마다 운영이 다르다는 것 자체가 결론의 일부다. 어느 하나를 "표준"으로 승격하지 않는다.

---

# 1. 종합 평가

## 장점

1. **규칙이 코드로 존재하고 자동으로 돈다.** 구두 합의보다 낫다. 신규 기여자가 문서를 안 읽어도 피드백을 받는다.
2. **severity를 나눈다.** error/warning/info 3단을 이미 갖고 있다 — 개선의 토대가 있다.
3. **`forbidden_files`는 정확히 옳다.** `.env`·`.pem`·`credentials.json` 차단은 되돌릴 수 없는 사고를 막는다. 이 한 규칙만으로도 Action의 존재 가치가 있다.
4. **수정 방법을 함께 준다.** 지적만 하고 끝나지 않는다.
5. **PR 코멘트로 보고한다.** 로그를 파헤치게 하지 않는다.

## 가장 큰 문제

**위험도와 severity가 반비례한다.**

이 Action에서 **머지를 막는 error 2건은 둘 다 형식**(브랜치명, `closes #N`)이고,
**실제 소프트웨어 위험은 하나도 검사하지 않는다** — 빌드도, 테스트도, breaking change도, migration도.

**이것은 추론이 아니라 실측이다.** 2026-08-04 기준 `pull_request`에서 도는 워크플로는 **두 개뿐**이다.

```
compliance-guard.yml   pull_request   ← 형식 검사
protected-files.yml    pull_request   ← 보호 파일 승인
deploy-backend.yml     push           ← 머지된 뒤에 돈다
deploy-frontend.yml    push           ← 머지된 뒤에 돈다
```

`npm run build`는 `deploy-frontend.yml`에만 있고 트리거가 `push`다. **빌드가 깨진 PR은 머지된 뒤 배포 단계에서야 발각된다.** 테스트를 PR에서 돌리는 워크플로는 확인되지 않았다.

결과적으로 이런 PR이 초록불을 받는다.
- 테스트가 전부 깨져도 통과 (**PR에서 테스트를 안 돌린다**)
- 빌드가 깨져도 통과 (**머지 후 배포에서 발각된다**)
- API를 breaking change로 바꿔도 통과
- 되돌릴 수 없는 DB migration을 넣어도 통과
- 브랜치명이 `feat/5-x`이고 본문에 `closes #5`만 있으면 통과

반대로 이런 PR이 빨간불을 받는다.
- 테스트까지 완비된 정확한 버그 수정인데 브랜치명이 `hotfix-login`

**검사기가 리뷰어의 주의를 형식으로 돌려놓는다.** 이것이 단일 최대 결함이다.

부차적이지만 구조적인 문제 셋:

- **선언과 집행이 어긋나 있었다.** `_compliance-spec.yaml`은 "Centralized definition"이라 적혀 있지만 실제 판정은 워크플로의 인라인 정규식이었다. SPEC만 고치면 아무 일도 일어나지 않았다. (2026-08-04 확인·수정)
- **위험한 명령을 조건 없이 권한다.** `git push --force-with-lease`를 리뷰 진행 여부와 무관하게 안내한다. S4가 명시적으로 말리는 행동이다.
- **자기 PR을 자기가 승인할 수 없다.** protected-files가 Admin 승인을 요구하는데 Admin이 작성자면 GitHub이 자기 승인을 막는다. 구조적 교착이다.

## 점수

**10점 만점에 4점.**

| 항목 | 배점 | 획득 | 근거 |
|---|---|---|---|
| 실행·자동화 | 2 | 2.0 | 실제로 돌고 코멘트를 남긴다 |
| 안전 검사 | 3 | 1.0 | `forbidden_files`만. 빌드·테스트·breaking change·migration 전무 |
| severity 타당성 | 2 | 0.0 | 머지 차단 2건이 둘 다 형식 |
| 안내 품질 | 2 | 1.0 | 수정법은 주지만 위험 명령을 무조건 권함 |
| 예외 정책 | 1 | 0.0 | `admin_override: false`, `skip_labels` 미구현 상태 |

## 판정: 어디에 가까운가

**"컨벤션 검사기"다.** 품질 게이트도 리뷰 보조 도구도 아니다.

- **품질 게이트**라면 빌드·테스트·보안이 차단 조건이어야 한다 → 없다
- **리뷰 보조 도구**라면 리뷰어에게 "어디를 보라"를 줘야 한다 → 없다. 기여자에게 형식을 지적할 뿐이다

지금은 **린터를 게이트 자리에 앉혀 놓은 상태**다.

---

# 2. 핵심 오픈소스의 PR 운영 방식

Action과 비교에 필요한 축만 추린다.

| | 제출 방식 | 중요하게 보는 것 | 커밋 메시지 | 큰 변경 | 승인·병합 | 브랜치명 | 크기 제한 |
|---|---|---|---|---|---|---|---|
| **Linux** (S1) | 메일 패치 시리즈 | 문제 진술, 사용자 영향, 시리즈 각 단계의 빌드 가능성 | `Signed-off-by` 필수, `Fixes:`·`Link:`·`Closes:` | 시리즈로 분할, 각 패치가 독립 검증 가능 | 서브시스템 메인테이너 | 해당 없음 | **없음.** "5000 lines of a new feature"도 전제. 다만 "15개쯤씩 나눠 보내라" |
| **Git** (S2) | 메일 패치 | 문제 → 왜 이 해법 → 기각한 대안 | `area:` 접두 (`doc:`), 명령형, `type:` **아님** | 커밋 쪼개기 | 메인테이너 | 해당 없음 | **없음.** "설명이 길어지면 쪼갤 신호" |
| **Kubernetes** (S3) | GitHub PR | 작은 PR, release note, e2e 통과 | 명령형·50/72자, **커밋에 `#N` 금지** | SIG별 PR 분리, repo 전역 PR 금지 | LGTM + approve + OWNERS + **Tide 병합 큐** | **규칙 없음** | 숫자 상한 **없음**. "60분 걸리면 뒤 30분은 눈이 흐려진다" |
| **Rust** (S4) | GitHub PR | 리뷰 중 불필요한 갱신 회피, PR 설명에 `closes #N` | 형식 강제 없음 | **MCP(Major Change Proposal) 선행** | `@bors r+` **병합 큐** | **규칙 없음** | 숫자 상한 **없음**. 사전 논의로 분할 유도 |
| **React** (S5) | GitHub PR, `main` 직접 | **신규 기능엔 단위 테스트 필수**, prettier/lint/flow | **규칙 없음** | 이슈 선행 권장(강제 아님) | 코어 팀 | **규칙 없음** | **없음** |
| **Google** (S7) | 사내 CL | 자기완결성, 리뷰어 인지부하 | — | 스택·수평/수직 분할 | 리뷰어 | — | 100줄 권장 / 1000줄 대체로 과다 — **"it's up to the judgment of your reviewer"** |

## 이 표에서 곧바로 나오는 사실

1. **브랜치 이름 규칙을 강제하는 프로젝트가 하나도 없다.** K8s·Rust·React 모두 없다. Linux·Git은 개념 자체가 없다.
2. **`{type}: ` 형식을 요구하는 프로젝트가 없다.** Git은 `area:`(파일·영역), Linux는 서브시스템 접두, K8s는 명령형만, React·Rust는 규칙 없음. Conventional Commits는 **자동화 도구가 소비할 때** 값이 있는 opt-in 규약이다(S6).
3. **커밋 본문에 이슈번호를 넣는 것을 K8s와 Rust가 명시적으로 말린다**(S3·S4). 이 Action의 `commit_issue_ref`는 두 프로젝트 권고의 정반대다.
4. **줄 수 상한을 두는 프로젝트가 없다.** 가장 근접한 Google조차 "리뷰어 판단"이라는 단서를 붙인다(S7).
5. **대형 변경은 크기가 아니라 절차로 다룬다.** Rust는 MCP, Linux는 시리즈 분할.
6. **현대적 병합 조건은 병합 큐 + 코드오너 + 필수 체크다**(S3·S4·S8). 형식 검사가 아니다.

---

# 3. 항목별 비판적 평가

## branch_naming

### 현재 규칙의 목적
브랜치명만 보고 종류와 관련 이슈를 알게 한다. 추적성을 브랜치명에 싣는다.

### 타당한 점
- 브랜치가 수십 개 열린 저장소에서 목록 가독성이 오른다.
- `{type}` 접두로 대략의 성격을 짐작할 수 있다.

### 문제가 되는 점
1. **브랜치는 수명이 짧고 병합 후 삭제된다.** 영구 기록은 커밋과 PR에 남는다. 사라질 것에 추적성을 싣는 것은 잘못된 저장 위치다.
2. **error(머지 차단)는 위험 대비 과하다.** 브랜치명이 틀려서 생기는 최악은 "찾기 불편함"이다. 되돌릴 수 없는 손해가 없다.
3. **수정에 force-push를 요구한다.** 형식 하나를 위해 히스토리 조작을 시킨다(§8 참조).
4. **이슈번호를 강제하므로 이슈 없는 정당한 작업을 막는다.** 긴급 hotfix, 최초 import, 운영 조치.
5. **자동화 도구와 충돌한다.** Dependabot/Renovate는 `dependabot/npm_and_yarn/...` 형식을 쓴다. 이 정규식으로는 전부 위반이다.

### 실제 오픈소스 표준과의 차이
**K8s·Rust·React 어느 곳도 브랜치 이름 규칙이 없다**(S3·S4·S5). "글로벌 표준"이라 부를 근거가 없다.

### 권장 severity
**Info** (또는 검사 제외)

### 개선된 판정 기준
- 자동화 봇 브랜치는 검사 제외
- 형식 위반은 정보성 안내만. 머지에 영향 없음
- 정규식을 넓힌다: `^[a-z0-9][a-z0-9._/-]*$` 정도(공백·대문자·특수문자만 차단)

### 개선된 안내 문구 예시
> ℹ️ 브랜치명 `atlas/page-canvas` — 팀 권장 형식은 `{type}/{slug}`입니다.
> 머지에는 영향이 없습니다. **다음 브랜치부터** 적용하시면 됩니다.
> 이미 PR이 열려 있으면 이름을 바꾸지 마세요 — force-push는 리뷰 맥락을 잃게 합니다.

---

## issue_linkage

### 현재 규칙의 목적
모든 변경을 요구사항까지 역추적 가능하게 한다.

### 타당한 점
- 추적성은 실질 가치다. "이 코드가 왜 있나"에 답할 수 있어야 한다.
- 이슈 자동 종료로 상태 동기화가 준다.

### 문제가 되는 점
1. **`closes #N`만이 추적성의 형태라고 전제한다.** 추적 대상은 이슈일 수도, ADR일 수도, 사고 보고서일 수도, 스크린 ID일 수도 있다.
2. **이슈가 없어야 정상인 작업이 있다.** 오타 수정, 최초 import, 의존성 봇 PR, 운영 조치. 이때 규칙은 **이슈를 만들게 강요**한다 — 추적성이 아니라 서류 작업이 는다.
3. **error라서 이 강요가 머지를 막는다.**
4. **BangCheck 실측: 열린 이슈가 0건이다.** 규칙을 지키려면 반드시 이슈를 새로 만들어야 한다. 규칙이 스스로 일을 만든다.

### 실제 오픈소스 표준과의 차이
React는 "it's fine to submit a pull request right away"라며 **권장에 그친다**(S5). K8s는 이슈 링크 요구가 없고, 오히려 커밋에 `#`를 쓰지 말라고 한다(S3). Rust도 PR 설명 쪽을 권할 뿐 강제하지 않는다(S4).

### 권장 severity
**Warning** (단, 변경 성격에 따라 Error로 승격)

### 개선된 판정 기준
"추적 근거"를 넓게 인정한다. 아래 중 **하나라도** 있으면 통과.
- `closes|fixes|resolves #N`
- `Refs: <ADR/RFC/문서 경로>`
- `Atlas: <pageId 또는 route>`
- `Incident: <ID>`
- `No-issue: <한 줄 사유>` ← 명시적 면제. 빈 칸과 "해당 없음"을 구별한다

**Error로 승격하는 경우**: `breaking-change` 라벨이 붙었거나 migration 파일이 포함된 PR. 이때는 추적 근거가 없으면 막는다.

### 개선된 안내 문구 예시
> ⚠️ 이 PR의 추적 근거를 찾지 못했습니다.
> 아래 중 **하나**를 본문에 넣어주세요.
> `closes #12` · `Refs: docs/adr/0007-atlas-card.md` · `Atlas: /custom` · `No-issue: 오타 수정`
> 이슈가 없는 작업이면 이슈를 새로 만들지 말고 `No-issue:`를 쓰세요.

---

## commit_type

### 현재 규칙의 목적
커밋 메시지를 기계가 읽을 수 있게 해 changelog·버전 자동화의 토대를 만든다.

### 타당한 점
- 제목만 보고 성격을 짐작할 수 있다.
- **자동화 소비자가 있다면** 실질 가치가 크다.

### 문제가 되는 점
1. **이 저장소에 소비자가 없다.** semantic-release도, changelog 생성기도, 자동 배포 트리거도 확인되지 않았다. **소비자 없는 형식은 비용만 남는다.** Conventional Commits 자신이 목적을 "changelog 생성 / semver bump / build·publish 트리거"로 명시한다(S6) — 셋 다 없으면 규약의 근거가 사라진다.
2. **좋은 커밋 메시지와 Conventional Commits는 다른 것이다.** Git(S2)이 요구하는 것은 접두가 아니라 **내용**이다 — 문제 진술, 해법 정당화, 기각한 대안. `feat: add button`은 형식은 맞고 내용은 비었다. **이 규칙은 형식만 검사하므로 내용이 빈 커밋을 통과시킨다.**
3. **수정 방법이 `git rebase -i` + force-push다.** 형식 하나 때문에 히스토리를 조작시킨다.
4. **squash 병합이면 애초에 무의미하다.** S6 FAQ가 직접 말한다 — squash 워크플로면 메인테이너가 병합 시 정리하면 된다.

### 실제 오픈소스 표준과의 차이
**Git은 `type:`이 아니라 `area:` 접두를 쓴다** — `doc: clarify distinction between sign-off and pgp-signing`(S2). 여기서 `doc`은 종류가 아니라 **파일·영역 이름**이다. Linux는 서브시스템 접두, K8s는 명령형만 요구, React·Rust는 규칙 없음. **Conventional Commits를 요구하는 대형 프로젝트를 확인하지 못했다.**

### 권장 severity
**Info** — 단, 자동화를 도입하는 날 Warning으로 올린다.

### 개선된 판정 기준
형식 대신 **내용**을 검사한다(형식보다 어렵지만 값이 있다).
- 제목 72자 이내, 마침표 없음 → Info
- **본문이 아예 없는 커밋** → Info (자명한 변경이면 정상이므로 차단하지 않음)
- 접두 형식 → **검사하지 않음**

### 개선된 안내 문구 예시
> ℹ️ 커밋 메시지 참고
> 이 저장소는 `feat:`/`fix:` 접두를 요구하지 않습니다 — 소비하는 자동화가 없기 때문입니다.
> 대신 본문에 **왜**를 남겨주세요: 무슨 문제가 있었고, 왜 이 방법인지.
> **이미 push된 커밋의 메시지를 고치려고 rebase하지 마세요.** 리뷰 중이면 특히요.

---

## pr_template

### 현재 규칙의 목적
PR 설명의 최소 품질을 보장한다.

### 타당한 점
- **방향은 옳다.** 설명 없는 PR은 리뷰 불가다. S1·S2 모두 "문제를 먼저 써라"를 요구한다.
- 섹션이 있으면 작성자가 빠뜨리기 어렵다.

### 문제가 되는 점
1. **`## What`은 대체로 불필요하다.** diff가 이미 what이다. Git(S2)이 요구하는 순서는 **문제 → 왜 이 해법 → 기각한 대안**이지 what이 아니다.
2. **정확한 헤딩 문자열을 요구한다.** `## 무엇`이나 `### Why`는 위반이다. 내용이 아니라 문자열을 검사한다.
3. **크기와 무관하게 같은 템플릿을 요구한다.** 오타 한 글자 PR에 What/Why/Test 3절은 과하다.
4. **`## Test`가 "있음"만 확인한다.** `## Test\n없음`도 통과한다. **검증의 존재가 아니라 헤딩의 존재를 검사한다.**

### 실제 오픈소스 표준과의 차이
K8s는 release note를 요구하지만 What/Why/Test 3절 강제는 확인되지 않았다(S3). React·Rust는 템플릿 강제가 없다(S4·S5). 다만 **설명을 요구하는 방향 자체는 S1·S2와 일치**한다 — 문제는 형태다.

### 권장 severity
**Warning** (크기·위험도에 따라 Error로 승격)

### 개선된 판정 기준
- **본문 길이가 실질적인가**를 먼저 본다(예: 공백 제외 100자 미만이면 Warning)
- 섹션 이름은 **여러 표기를 허용**한다(`Why`/`왜`/`Problem`/`문제`)
- 소형 PR(§7의 위험 점수 낮음)은 템플릿 검사 **제외**
- `breaking-change`·migration 포함 PR은 `Risks`·`Rollback` 섹션을 **Error로 요구**

### 개선된 안내 문구 예시
> ⚠️ PR 설명이 너무 짧습니다(현재 42자).
> 리뷰어가 알아야 할 것은 **무엇을 바꿨나**가 아니라 **무슨 문제가 있었나**입니다 — diff가 이미 전자를 말합니다.
> 최소한 이 한 줄이라도: `문제: 로그인 후 /rooms로 갈 때 온보딩 모달이 두 번 뜬다`

---

## pr_size

### 현재 규칙의 목적
리뷰 가능한 크기를 유지한다.

### 타당한 점
- **문제의식은 정확하고 근거도 있다.** S3의 "60분 리뷰면 뒤 30분은 눈이 흐려진다", S7의 "1000줄은 대체로 너무 크다"는 실재하는 인지 한계다.
- 큰 PR이 리뷰를 형해화한다는 것은 널리 관찰된 사실이다.

### 문제가 되는 점
1. **`additions + deletions` 단일 숫자는 위험을 재지 못한다.** 아래가 전부 같은 무게로 계산된다.
   - 파일 이름 변경 500줄 (위험 ≈ 0)
   - `package-lock.json` 3000줄 (위험 ≈ 0)
   - prettier 재포맷 2000줄 (위험 ≈ 0)
   - 인증 로직 200줄 (위험 **높음**)
2. **삭제를 추가와 같게 센다.** S7은 "파일 전체 삭제는 1줄로 쳐도 된다"고 명시한다.
3. **파일 수와 분산도를 무시한다.** S7: "A 200-line change in one file might be okay, but spread across 50 files it would usually be too large."
4. **분할이 항상 옳다고 전제한다.** 반쪽 상태로 머지되는 PR은 **더** 위험하다(§4 참조).
5. **BangCheck 실측 사례**: 9072줄 중 상당수가 신규 파일 추가와 CSS 토큰 치환이었다. 위험도는 줄 수에 비례하지 않았다.

### 실제 오픈소스 표준과의 차이
**숫자 상한을 두는 프로젝트를 확인하지 못했다.** 가장 근접한 S7조차 "**it's up to the judgment of your reviewer**"로 끝난다. Linux는 5000줄 신기능을 정상 전제로 다룬다(S1).

### 권장 severity
**Warning** (3000줄 초과 실질 변경은 Error로 승격 가능)

### 개선된 판정 기준
§7의 위험 가중 점수로 대체한다. 요지: **줄 수가 아니라 "리뷰어가 판단해야 할 양"**을 잰다.

### 개선된 안내 문구 예시
> ⚠️ 실질 변경 1,240줄 (전체 9,072줄 중 생성 파일·이동·포맷 7,832줄 제외)
> 파일 27개 · 최대 파일 398줄 · production 코드 비중 62%
> 리뷰가 60분을 넘길 가능성이 있습니다. 본문에 **`Review focus:`** 한 줄을 넣어 어디부터 볼지 알려주세요.
> 분할이 항상 정답은 아닙니다 — 나눈 조각이 각각 빌드·테스트를 통과하지 못하면 나누지 마세요.

---

# 4. 현대적인 PR의 핵심 표준

## 좋은 PR은 무엇인가

**리뷰어가 "이 변경이 안전하다"를 PR 안에서 판단할 수 있는 PR.** 세 요소가 필요하다.

1. **문제가 적혀 있다** — S1: "there must be an underlying problem that motivated you to do this work." S2: "explains the problem the change tries to solve."
2. **해법 선택 이유가 적혀 있다** — S2: "justifies the way the change solves the problem", "alternate solutions considered but discarded, if any."
3. **검증이 붙어 있다** — React(S5): 신규 기능엔 단위 테스트 필수. K8s(S3): e2e 통과.

## "하나의 논리적 변경"의 의미

S1의 "Separate each logical change into a separate patch"는 **파일 수나 줄 수가 아니라 되돌림 단위**를 말한다.

판별 시험 셋:
- **되돌림 시험**: 이 PR을 revert했을 때 남는 것이 일관된 상태인가? 절반만 되돌아가면 논리 단위가 아니다.
- **설명 시험**: 제목 한 문장으로 써지는가? S2: "If your description starts to get too long, that's a sign that you probably need to split up your commit."
- **독립 검증 시험**: 이 PR만으로 검증 가능한가, 다음 PR을 기다려야 하는가?

**S1의 예외도 규칙의 일부다** — "if you make a single change to numerous files, group those changes into a single patch." 파일 100개에 같은 rename을 적용하는 것은 **하나의** 논리 변경이다.

## 몇 줄부터 큰 PR인가

숫자 하나로 답할 수 없다. 확인된 유일한 준거는 S7의 "100줄 권장 / 1000줄 대체로 과다"이고, **여기에도 "리뷰어 판단" 단서가 붙는다.**

실무적 환산: **리뷰 예상 시간 60분**(S3)이 실질 임계다. 줄 수는 그 대리 지표일 뿐이다.

## 줄 수보다 중요한 지표

우선순위 순으로:

1. **위험 표면** — 인증·권한·결제·PII·migration·보안 설정을 건드리는가
2. **되돌릴 수 있는가** — revert로 원복되는가, 데이터가 이미 변형됐는가
3. **의미적 결합도** — 몇 개의 독립 관심사가 섞여 있는가
4. **분산도** — 파일 수, 디렉터리 수 (S7)
5. **검증 가능성** — 테스트가 이 변경을 실제로 덮는가
6. **생성물 비중** — lockfile·snapshot·자동 생성 코드 비율
7. 줄 수

## 작은 PR로 나누면 안 되는 경우

1. **나눈 조각이 빌드를 깨뜨릴 때.** S1이 가장 강하게 말하는 지점 — "take special care to ensure that the kernel builds and runs properly after each patch in the series. Developers using `git bisect` … will not thank you if you introduce bugs in the middle."
2. **원자적 rename/이동.** 절반만 옮기면 중간 상태가 깨진다.
3. **보안 수정.** 쪼개면 취약점 노출 창이 길어지고 공격자에게 지도를 준다.
4. **기계적 대량 치환.** S7: 신뢰하는 자동 도구 산출물은 통째 검토가 오히려 효율적이다.
5. **breaking change와 그 호출부 수정.** 갈라 놓으면 중간 커밋에서 컴파일이 깨진다.

## 안전하게 분할하는 방법

- **수평 분할(계층)**: 스키마 → 서비스 → API → UI
- **수직 분할(기능)**: 기능 A 전체 → 기능 B 전체
- **선행 분리**: 리팩토링만 먼저(동작 불변, 테스트 그대로 통과) → 그 위에 기능
- **다크 런치**: 비활성 플래그 뒤에 코드를 먼저 넣고, 활성화는 별도 PR
- **스택 PR**: 각 PR이 앞 PR을 base로. GitHub에서는 base 브랜치를 지정

## 각 중간 PR이 반드시 만족해야 하는 조건

**S1이 규정한 그대로다.** 각 단계에서:
1. **빌드된다**
2. **테스트가 통과한다**
3. **사용자에게 보이는 동작이 깨지지 않는다** (플래그 뒤에 숨겨도 됨)
4. **되돌려도 안전하다**

이 넷 중 하나라도 못 지키면 그 분할은 하지 않는 게 낫다.

## 문제·설계 결정·검증·위험·롤백·리뷰 포인트 작성법

| 항목 | 어디에 | 무엇을 |
|---|---|---|
| 문제 | PR 본문 첫 문단 | 현재 코드가 **무엇을 잘못하는가**를 현재형으로. S2: "The code does X when it is given input Y" |
| 설계 결정 | 본문 또는 ADR 링크 | 왜 이 방법인가 + **기각한 대안**. 커밋에 전사를 복제하지 않는다 |
| 검증 | 본문 `Verification` | 실행한 명령과 결과. "테스트 추가함"이 아니라 "`npm test` 132 passed" |
| 위험 | 본문 `Risks` | 무엇이 깨질 수 있나, 누가 영향받나. **없으면 "없음"이라고 쓴다** |
| 롤백 | 본문 `Rollback` | revert로 충분한가. migration이면 되돌릴 수 있는가 |
| 리뷰 포인트 | 본문 `Review focus` | "어디부터 보라". 큰 PR에서 가장 값이 큰 한 줄 |

---

# 5. PR 템플릿 개선안

## 소형 PR

오타·단순 버그·작은 UI 수정·설정 변경·의존성 패치

```markdown
## 문제
<!-- 현재 무엇이 잘못돼 있나. 한 줄이면 충분하다 -->

## 검증
<!-- 무엇으로 확인했나. 예: npm test 통과 / 화면 확인 -->

Atlas: <pageId 또는 route, 해당 없으면 `없음`>
```

## 일반 PR

```markdown
## Summary
<!-- 한 문장. 제목보다 조금 더 -->

## Problem
<!-- 현재 코드가 무엇을 잘못하는가. 현재형으로.
     "X를 추가한다"가 아니라 "Y일 때 Z가 안 된다" -->

## Changes
<!-- 어떻게 고쳤나. diff를 나열하지 말고 접근을 설명한다.
     기각한 대안이 있으면 한 줄 -->

## Verification
<!-- 실행한 것과 결과. 명령과 숫자를 적는다
     예: npm run typecheck 0 / npm test 132 passed / 라이트·다크 렌더 확인 -->

## Risks
<!-- 무엇이 깨질 수 있나. 없으면 "없음"이라고 명시한다 -->

## Related
<!-- closes #N / Refs: docs/adr/xxxx.md / No-issue: 사유 -->

Atlas: <pageId 또는 route>
```

## 대형·설계 변경 PR

```markdown
## Summary

## Context / Problem
<!-- 왜 지금 이걸 하는가. 배경과 증상 -->

## Goals
<!-- 이 PR이 달성하는 것 -->

## Non-goals
<!-- 의도적으로 하지 않는 것. 리뷰어의 "이건 왜 안 했나"를 미리 막는다 -->

## Design decisions
<!-- 결정과 그 이유. 결정마다 한 문단 -->

## Alternatives considered
<!-- 검토하고 기각한 것과 기각 이유.
     Git SubmittingPatches가 명시적으로 요구하는 항목이다 -->

## Migration / Compatibility
<!-- 기존 데이터·API·설정이 어떻게 되는가. breaking이면 명시 -->

## Verification
<!-- 실행한 검증 전부. 자동·수동 구분 -->

## Risks
<!-- 위험과 완화책 -->

## Rollback
<!-- 되돌리는 방법. revert로 되는가, 데이터 복구가 필요한가 -->

## Review focus
<!-- 리뷰어가 어디부터 봐야 하나. 파일·함수 단위로 지목한다 -->

## Related RFC / ADR / Issue

Atlas: <pageId 또는 route>
```

---

# 6. Compliance Action 정책 재설계

## 등급 정의

| 등급 | 뜻 | 머지 |
|---|---|---|
| **Blocker** | 되돌릴 수 없거나 시스템을 깨뜨린다 | **차단** |
| **Error** | 추적성·검증 가능성이 없어 리뷰가 성립하지 않는다 | **차단**(면제 가능) |
| **Warning** | 품질이 낮지만 판단은 리뷰어가 한다 | 통과 |
| **Info** | 참고. 다음에 반영하면 된다 | 통과 |

## 규칙 재분류

| 규칙 | 현재 등급 | 권장 등급 | 차단 | 이유 |
|---|---|---|---|---|
| `forbidden_files` (secret) | error | **Blocker** | O | 원격에 남으면 되돌릴 수 없다. 키 회전이 필요해진다 |
| 빌드 실패 | 없음 | **Blocker** | O | 머지되면 main이 깨진다 |
| 테스트 실패 | 없음 | **Blocker** | O | 회귀를 그대로 들인다 |
| migration 미검증 | 없음 | **Blocker** | O | 데이터는 revert로 안 돌아온다 |
| 필수 승인 누락 (CODEOWNERS) | 부분(protected-files) | **Blocker** | O | 소유자 동의 없는 변경 |
| 심각 취약점 (의존성 CVE) | 없음 | **Blocker** | O | 배포되면 노출된다 |
| breaking change 미고지 | 없음 | **Error** | O | 소비자가 대비할 수 없다. 라벨 또는 본문 명시로 해소 |
| 추적 근거 없음 (`issue_linkage` 확장) | error | **Error** | O | 단, 인정 형태를 넓히고 `No-issue:` 면제 허용 |
| PR 설명 실질 부재 | 없음 | **Error** | O | 100자 미만 등. 리뷰가 성립하지 않는다 |
| 테스트 증적 누락 (신규 기능) | 없음 | **Error** | O | React가 강제하는 항목(S5) |
| `pr_size` (위험 가중) | warning | **Warning** | X | 판단은 리뷰어. 3000줄 초과 실질 변경만 Error |
| `pr_template` (섹션) | warning | **Warning** | X | 형태보다 내용. 소형 PR은 면제 |
| `commit_type` | warning | **Info** | X | 소비하는 자동화가 없다(S6) |
| `commit_issue_ref` | warning | **검사 제외** | X | K8s·Rust가 명시적으로 말린다(S3·S4) |
| `branch_naming` | error | **Info** | X | 어느 대형 프로젝트도 강제하지 않는다 |
| `issue_labels` | warning | **Info** | X | 이슈 위생 문제. PR 머지와 무관 |
| 스크린샷 누락 (UI 변경) | 없음 | **Warning** | X | 리뷰 효율. 강제할 것은 아님 |
| `Review focus` 누락 (대형 PR) | 없음 | **Warning** | X | 큰 PR에서만 |
| 생성 파일 비중 | 없음 | **Info** | X | 크기 판단의 맥락 제공 |

## 핵심 이동

```
error 2건(형식) → Blocker 6건(위험) + Error 4건(리뷰 성립성)
형식 규칙 5건 → Warning/Info/제외
```

**차단하는 것이 형식에서 위험으로 옮겨간다.** 이것이 재설계의 전부다.

---

# 7. PR 크기 정책 개선

## 파일 종류별 가중치

줄 수를 세기 전에 **무엇이 바뀌었는지**로 나눈다.

| 종류 | 판별 | 가중치 | 근거 |
|---|---|---|---|
| production 코드 | 나머지 전부 | **×1.0** | 기준 |
| test 코드 | `*test*`, `*spec*`, `__tests__/` | **×0.3** | 검토는 필요하나 위험이 낮다. 있어서 감점되면 안 된다 |
| 문서 | `*.md`, `docs/` | **×0.2** | |
| 생성 파일 | `*.generated.*`, `*.pb.go`, `openapi.json` | **×0.05** | S7: 신뢰하는 도구 산출물 |
| lockfile | `*-lock.json`, `*.lock`, `Cargo.lock` | **×0.0** | 사람이 읽지 않는다 |
| snapshot | `__snapshots__/`, `*.snap` | **×0.05** | |
| **migration** | `db/migration/`, `migrations/` | **×3.0** | 되돌릴 수 없다. 줄 수가 적어도 위험이 크다 |
| rename/이동 | 유사도 90%↑ | **×0.05** | S7: 파일 이동은 리뷰 부담이 작다 |
| 순수 삭제 | 삭제만 있는 파일 | **파일당 1줄** | S7 명시 |
| 포맷 전용 | 공백/따옴표만 변경 | **×0.0** | |

## 위험 가중 점수

```
실질변경 = Σ(파일별 줄수 × 가중치)
분산도   = 파일수 × 2 + 디렉터리수 × 5          (S7의 "50 files" 문제)
위험표면 = 다음에 해당하는 파일당 +50
           auth · payment · PII · security config · migration · 권한
크기점수 = 실질변경 + 분산도 + 위험표면
```

## 단계별 정책 — 현재안 평가와 개선

| 사용자 제시안 | 평가 | 개선안 |
|---|---|---|
| 800줄 초과 → 사유·review focus 요구 | **방향은 옳다.** 다만 raw 줄 수라 lockfile 하나로 걸린다 | **크기점수 400 초과** → `Review focus:` 요구 (Warning) |
| 1500줄 초과 → 생성 파일 제외 실질 변경량 표시, 분할 가능성 설명 | **좋다.** 실질 변경량을 보여주는 것이 핵심 | **크기점수 1000 초과** → 실질/총계 분해 표시 + `분할 검토:` 한 줄 요구 (Warning) |
| 3000줄 초과 → maintainer 승인 또는 선행 설계 문서 | **타당하다.** 다만 "또는"이 중요 — 설계 문서를 항상 요구하면 대량 rename에서 무의미해진다 | **크기점수 2500 초과** → CODEOWNER 승인 **또는** ADR/RFC 링크 **또는** `대형 PR 사유:` (Error) |

**추가 제안**: migration이 포함되면 줄 수와 무관하게 **항상** `Rollback:` 섹션을 Error로 요구한다.

## 줄 수를 대체하는 위험 기반 지표

1. **리뷰 예상 시간** = 크기점수 ÷ 20 (분). 60분 초과가 실질 임계(S3)
2. **되돌림 가능성** = migration·데이터 변형 유무 (이진)
3. **위험 표면 접촉** = 인증·결제·PII 파일 수
4. **테스트 델타** = 테스트 증가분 ÷ production 증가분. 0에 가까우면 경고
5. **관심사 수** = 최상위 디렉터리 수 (여러 관심사가 섞였다는 신호)
6. **결합 깊이** = 변경된 public API·export 수

---

# 8. 안전한 수정 가이드

## 현재 안내의 위험성 평가

Action은 세 명령을 **상황 구분 없이** 권한다.

```bash
git branch -m
git rebase -i
git push --force-with-lease
```

위험은 셋이다.

1. **리뷰 맥락 손실.** force-push하면 리뷰어가 이미 본 커밋이 사라진다. "지난번 이후 뭐가 바뀌었나"를 볼 수 없게 된다. S4가 정확히 이것 때문에 말린다 — "Avoid updating an already-green PR under review unless necessary."
2. **동시 작업 유실.** 다른 사람이 그 브랜치에 커밋했으면 `--force-with-lease`는 막아주지만, **로컬이 이미 fetch한 뒤라면 막지 못한다.** 안전장치가 만능이 아니다.
3. **`git branch -m` 후 push는 새 브랜치를 만든다.** PR의 head가 따라오지 않아 **PR을 새로 열어야 한다.** 기존 리뷰 코멘트가 통째로 사라진다. Action은 이 사실을 안내하지 않는다.

**형식 위반 하나를 고치려고 리뷰 이력을 버리는 것은 손익이 맞지 않는다.**

## 상황별 수정 방법

| 상황 | 커밋 메시지 수정 | 브랜치명 수정 |
|---|---|---|
| **개인 브랜치, 미공유** | `git commit --amend` 또는 `rebase -i` 후 `push --force-with-lease` — 안전 | `git branch -m` 후 새로 push. 안전 |
| **PR 열림, 리뷰 전** | 위와 동일하되, 리뷰어가 이미 봤을 수 있으니 코멘트 한 줄 남긴다 | 가능. 단 **PR을 새로 열어야 한다**. 그럴 값이 있는지 판단 |
| **리뷰 진행 중** | **하지 않는다.** 추가 커밋으로 보완하고 병합 시 squash한다(S4) | **하지 않는다** |
| **공유 브랜치(2인 이상)** | **절대 하지 않는다.** 남의 로컬을 깨뜨린다 | **절대 하지 않는다** |
| **squash merge 저장소** | **불필요하다.** 병합 시 제목을 다시 쓴다 | 무관 |
| **merge commit 유지 저장소** | 개별 커밋이 영구히 남으므로 **머지 전에** 정리할 값이 있다. 단 리뷰 중이면 마지막에 |

## 히스토리 재작성이 필요 없는 경우 (대부분이 여기다)

- **squash merge를 쓴다** → 커밋 메시지 형식은 병합 시 정리된다. **BangCheck가 squash를 쓴다면 `commit_type` 규칙 자체가 무의미하다.**
- **브랜치명이 마음에 안 든다** → 브랜치는 병합 후 삭제된다. 그냥 둔다.
- **PR 본문이 부족하다** → 본문 편집은 히스토리와 무관하다. GitHub UI에서 고친다.
- **커밋을 하나 더 쌓으면 되는 경우** → 리뷰 중에는 이게 정답이다(S4).

## 안내 문구에 반드시 들어가야 할 경고

> ⚠️ 아래 명령은 히스토리를 다시 씁니다.
> **리뷰가 시작된 뒤에는 실행하지 마세요** — 리뷰어가 본 커밋이 사라져 "지난번 이후 무엇이 바뀌었는지"를 볼 수 없게 됩니다.
> 공유 브랜치에서는 절대 실행하지 마세요.
> `git branch -m` 후 push하면 **새 브랜치**가 되어 이 PR을 다시 열어야 하고, 기존 리뷰 코멘트가 사라집니다.

---

# 9. 예외 승인 정책

## 설계 원칙

1. **예외는 표현 가능해야 한다.** 막힌 채로 두면 우회(`--no-verify`, 규칙 삭제)가 일어난다.
2. **예외는 흔적을 남겨야 한다.** 누가·왜·언제.
3. **예외의 비용은 낮되 0은 아니어야 한다.** 사유 한 줄은 쓰게 한다.
4. **자동 예외와 사람 예외를 구분한다.** 봇 PR은 자동, 사람 판단은 승인.

## 사례별 예외 방식

| 사례 | 방식 | 면제 범위 | 통제 |
|---|---|---|---|
| **긴급 hotfix** | 라벨 `emergency` + 본문 `Exception: <사유>` | Error 전부 (Blocker는 **불가**) | 머지 후 24시간 내 사후 이슈 필수. 미작성 시 다음 PR 차단 |
| **최초 코드 import** | 라벨 `initial-import` | `pr_size`, `pr_template` | 1회성. 라벨은 Admin만 부여 |
| **대규모 파일 이동** | 자동 감지(유사도 90%↑ 비중 80%↑) | `pr_size` | 자동. 본문에 감지 결과 표시 |
| **자동 생성 코드** | 경로 규칙 자동 감지 | 크기 계산에서 가중치 적용 | 자동. `.gitattributes`의 `linguist-generated` 활용 |
| **Renovate / Dependabot** | actor가 봇 | `branch_naming`, `issue_linkage`, `pr_template`, `commit_type` | 자동. **`forbidden_files`와 CVE 검사는 유지** |
| **migration** | 예외 **아님** | — | 오히려 `Rollback:` 추가 요구 |
| **spike / prototype** | 라벨 `spike` | Error 전부 | **머지 금지 라벨과 세트.** 머지하려면 라벨 제거 후 재검사 |
| **이슈 없는 운영 조치** | 본문 `No-issue: <사유>` | `issue_linkage` | 사유 문자열 10자 이상 |
| **여러 이슈를 묶는 구조 변경** | 본문에 `Refs: #1, #2, #3` | `issue_linkage`의 단일 `closes` 요구 | 그대로 인정 |

## 예외 남용 통제

1. **Blocker는 어떤 예외로도 뚫리지 않는다.** secret·빌드·테스트·migration 미검증은 라벨로 우회 불가.
2. **예외 사유는 필수 문자열이다.** 라벨만으로는 부족하고 `Exception:` 한 줄을 요구한다.
3. **감사 로그.** 예외가 적용된 PR을 월 단위로 집계해 리포트한다. 같은 예외가 반복되면 **규칙이 틀린 것**이므로 규칙을 고친다.
4. **라벨 부여 권한 제한.** `emergency`·`initial-import`는 CODEOWNERS/Admin만.
5. **만료.** `spike` 라벨은 30일 후 자동 경고.

> **핵심**: 예외가 반복되면 예외를 막을 게 아니라 규칙을 의심한다.
> 예외율이 20%를 넘는 규칙은 그 자체가 재검토 대상이다.

---

# 10. 개선된 Action 출력 예시

````markdown
## 🔍 PR 검사 결과

**머지 차단: 없음** · Blocker 0 · Error 0 · Warning 2 · Info 1
<sub>이전 실행 대비: 새 위반 0건, 해소 1건 (`pr_template`)</sub>

---

### ⚠️ Warning — 머지를 막지 않습니다

<details open>
<summary><b>pr_size</b> · 실질 변경 1,240줄 (전체 9,072줄)</summary>

**왜 보나**
리뷰가 60분을 넘으면 뒤쪽 절반의 검토 밀도가 떨어집니다.
(Kubernetes contributor guide: "If your pull request takes 60 minutes to review, the reviewer's eye for detail is not as keen in the last 30 minutes as it was in the first.")

**현재 값**
| | 줄수 | 가중치 | 반영 |
|---|---:|---:|---:|
| production | 1,102 | ×1.0 | 1,102 |
| test | 340 | ×0.3 | 102 |
| 문서 | 180 | ×0.2 | 36 |
| lockfile | 6,890 | ×0.0 | 0 |
| rename | 560 | ×0.05 | 28 |
| **크기점수** | | | **1,268** (+분산도 74) |

파일 27개 · 디렉터리 6개 · 최대 파일 398줄 · 위험 표면 접촉 0건
**리뷰 예상 67분**

**기대 값** — 크기점수 1,000 이하, 또는 `Review focus:` 명시

**안전한 수정**
본문에 한 줄 추가하세요. 히스토리를 건드리지 않습니다.
```
Review focus: ProjectAtlasPage.tsx의 측정 로직(measureDocument)부터
```

**분할이 정답이 아닐 수 있습니다**
나눈 각 PR이 빌드·테스트를 통과하지 못하면 나누지 마세요.
(Linux submitting-patches: "take special care to ensure that the kernel builds and runs properly after each patch in the series.")

**예외** — 대량 이동/생성 파일이면 자동 감지됩니다. 그 외 사유는 `Exception: <사유>`
**자동 수정** ❌ 사람 판단 필요
</details>

<details>
<summary><b>test_delta</b> · production 1,102줄 증가에 테스트 증가 0줄</summary>

**왜 보나**
신규 동작에 테스트가 없으면 이후 변경이 이 코드를 깨뜨려도 아무도 모릅니다.
(React how-to-contribute: "We still require that your pull request contains unit tests for any new functionality.")

**현재 값** production +1,102 / test +0 (비율 0.00)
**기대 값** 비율 0.1 이상, 또는 사유 명시

**안전한 수정** 테스트 추가, 또는 본문에 `No-test: <사유>`
예: `No-test: UI 레이아웃 변경으로 렌더 스크린샷으로 검증함`

**예외** 문서 전용·설정 전용 PR은 자동 제외
**자동 수정** ❌
</details>

---

### ℹ️ Info — 참고

- **branch_naming** `atlas/page-canvas` — 팀 권장은 `{type}/{slug}`입니다.
  머지에 영향 없습니다. **이미 PR이 열려 있으면 바꾸지 마세요** — `git branch -m` 후 push는 새 브랜치가 되어 이 PR을 다시 열어야 하고 리뷰 코멘트가 사라집니다.
  다음 브랜치부터 적용하시면 됩니다.

---

### ✅ 통과

`forbidden_files` (secret 없음) · `build` · `test` · `atlas_scope` (`Atlas: /custom`) · `codeowners_approval`

---

<sub>규칙 정본: [`_wood/workflows/_compliance-spec.yaml`](../blob/main/_wood/workflows/_compliance-spec.yaml) · 판정 구현: [`compliance-guard.yml`](../blob/main/.github/workflows/compliance-guard.yml) · 두 파일은 함께 고쳐야 합니다</sub>
<sub>이 검사가 잘못됐다고 생각하시면 이슈를 열어주세요. 예외율이 높은 규칙은 규칙을 고칩니다.</sub>
````

## 현재 출력 대비 추가된 것

| 요소 | 현재 | 개선 |
|---|---|---|
| 머지 차단 여부 | 불명확 | 최상단 명시 |
| 왜 이 규칙인가 | 없음 | 1차 출처 인용 |
| 현재 검출값 | 숫자 하나 | 분해된 표 |
| 기대값 | 일부 | 전부 |
| 안전한 수정 | 위험 명령 무조건 | 상황별 + 비파괴 우선 |
| 예외 방법 | 없음 | 규칙마다 명시 |
| 자동 수정 가능 여부 | 없음 | 명시 |
| 위험 명령 경고 | 없음 | 조건과 결과 명시 |
| 이전 실행 대비 | 없음 | 새 위반/해소 건수 |
| 통과 항목 | 없음 | 표시(무엇이 검사됐는지 알 수 있다) |

---

# 11. 최종 결론

## 1) 유지해야 할 규칙

| 규칙 | 조치 |
|---|---|
| `forbidden_files` | **Blocker로 승격.** 유일하게 되돌릴 수 없는 사고를 막는다 |
| `protected_files_mention` | 유지. 단 **작성자=Admin 교착을 해소**해야 한다 |
| `atlas_scope` | 유지. BangCheck 고유 추적 축이고 `없음`으로 면제를 표현할 수 있다 |

## 2) 완화해야 할 규칙

| 규칙 | 현재 | 권장 | 조치 |
|---|---|---|---|
| `issue_linkage` | error | **Error 유지, 판정 확장** | `Refs:`·`Atlas:`·`No-issue:` 인정 |
| `pr_template` | warning | Warning | 표기 다양화, 소형 PR 면제, 길이 기반 판정 |
| `pr_size` | warning | Warning | 위험 가중 점수로 대체 |

## 3) 제거하거나 Info로 낮출 규칙

| 규칙 | 조치 | 근거 |
|---|---|---|
| `branch_naming` | **error → Info** | K8s·Rust·React 모두 규칙 없음(S3·S4·S5). 브랜치는 병합 후 삭제된다 |
| `commit_type` | **warning → Info** | 소비할 자동화가 없다. Git은 `type:`이 아니라 `area:`를 쓴다(S2·S6) |
| `commit_issue_ref` | **제거** | K8s·Rust가 명시적으로 반대한다(S3·S4) |
| `issue_labels` | **warning → Info** | 이슈 위생이지 PR 품질이 아니다 |

## 4) 새로 추가해야 할 실질 품질 검사

우선순위 순.

| # | 검사 | 등급 | 구현 난이도 |
|---|---|---|---|
| 1 | **빌드 성공** (`npm run build`) | Blocker | 낮음 — 이미 CI 가능 |
| 2 | **테스트 통과** | Blocker | 낮음 |
| 3 | **secret 스캔 강화** (내용 기반, 파일명뿐 아니라) | Blocker | 중간 — gitleaks 등 |
| 4 | **의존성 취약점** (critical/high) | Blocker | 낮음 — `npm audit` |
| 5 | **migration 안전성** (되돌림 가능성 + `Rollback:` 존재) | Blocker | 중간 |
| 6 | **breaking change 고지** (public API 변경 감지) | Error | 높음 |
| 7 | **테스트 델타** (production 증가 대비) | Warning | 낮음 |
| 8 | **PR 설명 실질 길이** | Error | 낮음 |
| 9 | **CODEOWNERS 승인** | Blocker | 낮음 — GitHub 기본 |
| 10 | **병합 큐** 도입 | — | 중간 — S8 |

## 5) SWYP 팀이 우선 고칠 상위 5개

1. **`branch_naming`과 `issue_linkage`를 머지 차단에서 내린다.** 형식이 사람을 막는 상태를 먼저 끝낸다. 하루 안에 가능하다.
2. **빌드·테스트를 필수 체크로 올린다.** 지금 이 둘이 깨져도 머지된다 — 가장 큰 실질 구멍이다.
3. **`commit_issue_ref`를 제거하고 `commit_type`을 Info로 내린다.** 두 규칙 모두 강제할 근거가 없고, force-push를 유발한다.
4. **`pr_size`를 위험 가중 점수로 바꾼다.** lockfile 하나로 경고가 뜨는 상태를 없앤다.
5. **예외 표현 경로를 만든다.** `No-issue:`·`Exception:`·봇 자동 면제. 지금은 우회 말고는 길이 없다.

부수로: **protected-files의 Admin 자기승인 교착**을 해소해야 한다. 지금 Admin이 올린 보호파일 PR은 구조적으로 통과 불가다.

## 6) 최종 권장 원칙 한 문장

> **자동 검사는 되돌릴 수 없는 것만 막고, 되돌릴 수 있는 것은 리뷰어에게 넘긴다.**

부연: 형식은 되돌릴 수 있고(다음 PR에서 고치면 된다), 유출된 secret과 깨진 main과 적용된 migration은 되돌릴 수 없다. 게이트는 후자에만 서야 한다.

---

## 확인한 저장소 사실 (2026-08-04)

| 항목 | 실측값 | 결론에 미치는 영향 |
|---|---|---|
| `pull_request` 트리거 워크플로 | `compliance-guard`, `protected-files` **둘뿐** | §1의 "위험을 하나도 검사하지 않는다"는 추론이 아니라 사실 |
| 빌드 실행 시점 | `deploy-frontend.yml`, 트리거 `push` | 빌드 실패가 **머지 후** 발각된다 |
| PR 테스트 워크플로 | **없음** | 회귀가 그대로 들어온다 |
| 병합 전략 | squash·merge commit·rebase **전부 허용** | squash가 **강제되지 않으므로** 개별 커밋 메시지가 이력에 남을 수 있다. §8의 "squash면 `commit_type`이 무의미"는 **조건부**로만 성립한다 |
| 열린 이슈 | **0건** | `issue_linkage`를 지키려면 반드시 이슈를 새로 만들어야 한다 |

## 이 문서의 한계 (정직한 표기)

- **크기 정책의 가중치 수치(×0.3, ×3.0 등)는 원리에서 도출한 제안이지 실측 보정값이 아니다.** 3개월 운영 후 재조정이 필요하다.
- "예외율 20%", "크기점수 ÷ 20 = 리뷰 분" 같은 임계값도 같은 성격이다. 초기값일 뿐 근거 있는 상수가 아니다.
- 병합 전략이 셋 다 허용되어 있어 **팀이 실제로 어느 것을 쓰는지**는 확인하지 못했다. squash를 관행으로 쓴다면 `commit_type` 완화 근거가 더 강해지고, merge commit을 쓴다면 커밋 메시지 품질의 값이 올라간다.
- backend 테스트(`gradlew test`)가 로컬에서 도는지는 확인했으나 **CI에 붙일 때의 소요 시간·안정성은 측정하지 않았다.** §11-4의 "구현 난이도 낮음" 판정은 그 전제 위에 있다.
