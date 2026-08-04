# claude critical-review artifact

- Provider: claude
- Model: claude-opus-5
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/claude
- Started at (UTC): 2026-07-30T21:05:34.134958+00:00
- Finished at (UTC): 2026-07-30T21:17:41.248605+00:00

## Original task / label

project-atlas-structure-score-tree-v2

## Final prompt

```text
BangCheck Project Atlas 구조 전환 평가를 새 관점에서 비판 리뷰하라. 읽기 전용이며 파일을 수정하지 마라.

리뷰 대상 코드 디렉터리: /Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem
기준 commit: 03a4cf54de94381d2bf1ed058a0ae7ccf644887c
현재 구현 diff: git diff 03a4cf54de94381d2bf1ed058a0ae7ccf644887c 로 backend 변경분을 읽어라. 아직 commit하지 않은 working tree 변경도 반드시 포함하라.
기획 정본:
- /Users/jonghoPro/woo/00_project/00_universe/01_www/projects/project-atlas/planning/PRD.md
- /Users/jonghoPro/woo/00_project/00_universe/01_www/projects/project-atlas/planning/architecture.md
- /Users/jonghoPro/woo/00_project/00_universe/01_www/projects/project-atlas/planning/epics.md
- /Users/jonghoPro/woo/00_project/00_universe/01_www/projects/project-atlas/implementation/s01-0-backend-build-bootstrap.md
- /Users/jonghoPro/woo/00_project/00_universe/01_www/projects/project-atlas/implementation/s01-7-java25-runtime-transition.md
- /Users/jonghoPro/woo/00_project/00_universe/01_www/projects/project-atlas/implementation/s01-8-site-bangcheck-module-base.md
- /Users/jonghoPro/woo/00_project/00_universe/01_www/projects/project-atlas/implementation/s01-1-방-체크리스트-등록-계약.md
이 절대경로를 읽을 수 없다면 아래 요약만 근거로 삼고 읽었다고 주장하지 마라.

배경: 기존 BangCheck는 Spring Boot 3.2.5, Java 17, 단일 Gradle module, com.room.backend 단일 scan root다. 기존 테스트는 Mockito unit 11개이며 실제 deploy workflow는 EC2에서 bootJar -x test 후 systemd restart다. 특정 Homebrew Java 17 patch 경로가 gradle.properties에 tracked되어 있었다. 목표는 방체크를 파일럿으로 코드, PRD, Story, GitHub Issue, 진행상태와 검증 evidence를 Feature ID로 연결해 Project Atlas에 시각화하는 생태계를 만드는 것이다.

Codex가 직전 제시한 단순 합산 평가:
- 기능 구현 속도: 기존 8, 목표 6
- 기존 동작 보존: 기존 3, 목표 9
- 빌드 이식성: 기존 3, 목표 9
- 모듈 경계와 캡슐화: 기존 4, 목표 8
- API 계약 신뢰성: 기존 5, 목표 8
- 배포 안전성: 기존 3, 목표 7
- 변경 추적성: 기존 2, 목표 9
- 장기 유지보수성: 기존 4, 목표 8
- 운영 단순성: 기존 8, 목표 6
- Atlas와 GitHub 확장성: 기존 2, 목표 9
- 총점: 기존 42, 목표 79
Codex는 이 점수가 동일 가중치의 주관적 목표 점수이며 구현 완료 점수가 아니라고 설명했다.

현재 revised 전환안:
1 Observable Baseline으로 route, bean, Flyway, runtime dependency, boot entry와 MySQL context 고정
2 Java 25 runtime 전환. 먼저 Boot 3.5 bridge와 실제 EC2 systemd rollback evidence, 이후 Boot 4.1 후보
3 runtime-unregistered site.bangcheck 신규 module base
4 Front to API to Backend 단위 계약 이관
5 Feature ID 기준 Project Atlas와 GitHub Issue 연결

이전 Opus 리뷰가 직접 Java25와 신규 package를 동시에 적용하는 안을 REVISE 38점으로 평가하여 baseline, runtime, module을 분리했다. 현재 Story 1.0 deterministic and semantic audit는 pass했지만 구현은 진행 중이다. portability gate와 기존 Java17 11 tests는 pass했다. 첫 Testcontainers capture는 boot-entry와 runtime-dependencies snapshot을 만들었지만 DockerClientProviderStrategy initializationError가 발생했고 총 14 tests 중 2 failed라 Story는 완료되지 않았다.

리뷰 목표:
1 Codex의 42 대 79 평가가 근거 있고 공정한지 비판하라. 중복 축, 누락 축, 잘못된 가중치, 목표 상태를 과대평가한 지점을 찾아라.
2 반드시 현재 구현 점수, Story 1.0 완료 직후 점수, 전체 목표 완성 점수를 구분해 100점 척도로 재채점하라. 각 점수에는 confidence와 증거 상태를 붙여라.
3 Java25, Boot bridge, site.bangcheck 병렬 package, Observable Baseline, Testcontainers 각각이 Atlas 목표에 필수인지 선택인지 과잉설계인지 판정하라.
4 기존 구조의 보존할 강점과 목표 구조의 새 위험을 동등하게 다뤄라. 새로운 복잡성이 실제로 회수되는 조건을 명시하라.
5 문제를 증상에서 원인까지 트리로 보여라. 최소 구조는 Goal, 현재 제약, root cause, 선택지, 결정, gate, evidence, Atlas projection이다.
6 전환 구조를 사람이 한눈에 볼 수 있는 ASCII tree로 제시하라. 각 노드에 WHY, CHANGE, EVIDENCE, STOP condition을 짧게 붙여라.
7 Project Atlas 상세 화면에서 어떤 트리를 보여줘야 하는지 제안하라. 예: Page, Feature ID, Front, API, Backend, exception, test, owner, progress, GitHub Issue, decision record, evidence. 정보 과밀을 막는 overview와 drill-down 경계도 제안하라.
8 지금 당장 바꿀 것, Story 1.0 이후 바꿀 것, 증거 전에는 보류할 것을 분리한 실행 순서를 제시하라.
9 결함, 충돌, 누락, 비측정성을 통과시키지 말고 REVISE 관점으로 찾아라. 각 finding은 MAJOR 또는 MINOR, 근거 파일과 위치, 실패 조건, 최소 수정 방향을 포함하라.

출력 형식:
A. 한 줄 verdict와 기존 평가에 대한 신뢰도
B. 재설계한 weighted rubric 표와 세 시점 점수
C. 기존 평가의 오류 finding 목록
D. 이유와 근거가 붙은 원인 트리
E. 단계별 전환 ASCII tree
F. Atlas UI information architecture tree
G. 실행 우선순위 NOW, NEXT, HOLD
H. 최종 PASS 또는 REVISE와 반드시 먼저 고칠 5개

칭찬보다 반증을 우선하고, 목표 문서에 쓰였다는 이유만으로 구현됐다고 점수를 주지 마라.

```

## Raw output

```text
읽은 것: `git diff 03a4cf5` 4파일 + 미커밋 7파일 전문, PRD/architecture/epics/s01-0/s01-7/s01-8/sprint-status, `deploy-backend.yml`, baseline artifact 실물, bash 3.2 실측.

---

# A. Verdict

**REVISE.** 방향(계측 먼저, 단계 분리)은 옳다. 그러나 **지금 만든 계측기는 자기가 재려는 변경 *뒤에서* 캡처됐고**, Atlas의 실제 가치는 Atlas가 요구하지 않는 Java 25 뒤에 갇혀 있다.

**Codex 42/79에 대한 신뢰도: 낮음(구조) / 중간(방향).** 방향 판단은 맞지만 축이 중복되어 회귀 안전성을 4중 계산했고, 목표 점수는 "문서에 쓰여 있음"을 근거로 매겨졌다. 결정적으로 **현재 시점이 없다** — 42→79 단조 상승 서사가 실재하는 골짜기를 지운다.

---

# B. 재설계 rubric과 세 시점 점수

| # | 축 | 가중 | Codex 대응 |
|---|---|---|---|
| A1 | 제품 회귀 안전성(behavior) | 20 | "기존 동작 보존" |
| A2 | 배포·runtime 안전성 | 15 | "배포 안전성" |
| A3 | 빌드·환경 이식성 | 10 | "빌드 이식성" |
| A4 | Atlas 추적성(Feature ID ↔ code/test/issue) | 20 | "변경 추적성"+"Atlas 확장성" 통합 |
| A5 | 모듈 경계·캡슐화(**제품 graph 안**) | 10 | "모듈 경계" |
| A6 | **gate 신뢰성(계측기 자체)** | 10 | **누락 — 신설** |
| A7 | 전달 속도 / 착수 비용 | 10 | "구현 속도" |
| A8 | 운영 단순성 / 4인 팀 유지 가능성 | 5 | "운영 단순성" |

Codex의 "장기 유지보수성"은 A1·A4·A5의 종속 변수라 제거, "API 계약 신뢰성"은 A1에 흡수했다(같은 characterization test가 둘을 동시에 움직인다).

| 축 | 가중 | T0 기존 | T1 **현재** | T2 1.0 done | T3 목표 |
|---|---|---|---|---|---|
| A1 회귀 안전성 | 20 | 2→4.0 | 2→4.0 | 3→6.0 | 8→16.0 |
| A2 배포 안전성 | 15 | 2→3.0 | 2.5→3.75 | 2.5→3.75 | 7→10.5 |
| A3 이식성 | 10 | 5→5.0 | 6→6.0 | 7→7.0 | 8→8.0 |
| A4 Atlas 추적성 | 20 | 1→2.0 | 1→2.0 | 1.5→3.0 | 8→16.0 |
| A5 모듈 경계 | 10 | 4→4.0 | 4→4.0 | 4→4.0 | 7→7.0 |
| A6 gate 신뢰성 | 10 | 1→1.0 | 3→3.0 | 6→6.0 | 7→7.0 |
| A7 전달 속도 | 10 | 8→8.0 | 4→4.0 | 4.5→4.5 | 4→4.0 |
| A8 운영 단순성 | 5 | 9→4.5 | 6→3.0 | 6→3.0 | 4→2.0 |
| **합계** | 100 | **32** | **30** | **37** | **70** |

| 시점 | 점수 | confidence | 증거 상태 |
|---|---|---|---|
| T0 기존 | 32 | **HIGH** | test 11개·controller 8개·migration 24개·workflow 직접 확인 |
| T1 현재 | 30 | **HIGH** | baseline 5종 중 2종만 실재, 14 tests 중 2 failed |
| T2 1.0 done | 37 | **MED-HIGH** | 조건부 — F1~F5 수정 시. 미수정이면 34 |
| T3 목표 | 70 | **LOW-MED** | 목표치이지 예측 아님. SM-9 실패 시 55 |

**핵심 판독 — 현재는 기존보다 2점 낮다.** 계측기를 절반만 세웠고, 그 대가로 테스트가 도는 머신 집합을 줄였으며, 아직 회귀를 하나도 잡지 못한다. 그리고 T2→T3의 33점 중 **26점은 Java 25가 아니라 Story 1.1/1.2/1.3이 만든다.**

---

# C. Codex 평가의 오류

**E1 회귀 안전성 4중 계산.** "기존 동작 보존9 + API 계약8 + 배포 안전성7 + 장기 유지보수성8" = 목표 79점 중 32점. 넷 다 Story 1.1 characterization test 하나가 동시에 움직인다.

**E2 "장기 유지보수성"은 독립 축이 아니다.** 모듈 경계·계약·추적성의 종속 변수다.

**E3 누락 축 4개.** ① **gate 신뢰성** — 계측기 자체가 틀릴 수 있다는 축이 없다(이 리뷰 MAJOR 12건 중 8건이 여기 속한다). ② 증거 획득 비용/재현성 — Docker 의존이 새로 생겼다. ③ 역행 비용 — EC2 Java 25는 되돌리는 비용이 더 크다. ④ 팀 채택 가능성 — 4인 팀이 8개 gate + Modulith + ArchUnit + manifest를 유지하는가.

**E4 기존 점수의 오측정.**
- "동작 보존 3" — *테스트가 없다*를 잰 것이지 *동작이 보존되지 않는다*를 잰 게 아니다. 축 이름과 측정 대상이 어긋났다.
- "변경 추적성 2" — Issue, `_wood/context`, `docs/impl/ver1.1`, CODEOWNERS, protected-files가 이미 있다. 2는 "Feature ID로 기계 resolve 불가"의 재서술이다. 실제 4~5.
- "빌드 이식성 3" — 결함은 tracked `org.gradle.java.home` **1줄**이었다. wrapper·toolchain·Dockerfile·compose는 이미 있었다. 5가 맞다.

**E5 목표 상태 과대평가 3건.**
- **"Atlas·GitHub 확장성 9"** — typed registry(1.2), source resolver(1.2), detail projection(1.3), GitHub polling(4.2) **모두 0줄**이고 실행 순서상 Java 25 뒤다.
- **"모듈 경계 8"** — `site.bangcheck`는 runtime 미등록(s01-8 AC#1). bean graph 밖 코드의 경계 품질은 제품 경계 품질이 아니다.
- **"배포 안전성 7"** — Entry Condition `OPS-EC2-RUNTIME-RECEIPT`가 미충족이고 **코드로 해결되지 않는 운영 blocker**다.

**E6 척도 미정의.** 1~10 앵커가 없어 "3→9"가 무엇인지 검증 불가. 42/79는 100점 척도가 아니라 10축 동일가중 합이며 E1의 4중 계산이 그대로 실린다.

**E7 시점 누락.** 2점 비교로는 착수 직후 점수 하락 구간을 구조적으로 볼 수 없다.

---

# D. 원인 트리

```
GOAL  code·PRD·Story·Issue·진행·증거를 Feature ID로 묶어 Atlas에 투영
│     판정: SM-1(resolve 100%) SM-2(dangling 0) SM-3(trace 2개) SM-5(≤3 interaction)
│
├─ 제약1 ─ Feature ID로 resolve할 "기계적 사실"이 코드에 없다
│  └ root cause A: source reference 규약을 강제하는 gate가 없다
│    선택지  A1 typed registry+resolver 먼저   A2 구조 먼저(현행 1.7→1.8→1.1)
│    결정    A1 — resolver는 기존 com.room.backend에서도 동작한다
│    gate    ATLAS-DATA-002   evidence SM-1=100%, SM-2=0
│    Atlas   Feature 카드 → Front/API/Backend 3구역이 실제 파일로 열린다
│
├─ 제약2 ─ 기존 동작의 등가성을 판정할 자가 없다
│  ├ root cause C: 계측기를 "변경 후 상태"에서 캡처했다          ← F1 치명
│  │  boot-entry.txt는 springBoot{mainClass} 추가 뒤 생성. baseline_commit과 불일치
│  │  결정 03a4cf5 worktree 재캡처 → 현재 tree compare → diff 0
│  │  gate `git worktree add tmp 03a4cf5`  evidence 두 캡처 SHA-256
│  ├ root cause D: capture 모드가 compare를 무조건 green으로 만든다  ← F2
│  │  Story 1.0 실패정책("한 실행에서 암묵 갱신되면 실패")을 구현이 직접 위반
│  │  결정 capture를 test에서 도달 불가한 task로 분리 + 비-0 exit
│  └ root cause E: 등가성 oracle과 lockfile을 구분하지 않았다      ← F9 F10
│     route/flyway/Start-Class = Boot 전환에도 불변 → 진짜 oracle
│     bean-names/runtime-deps  = 전량 diff → 신호 0, 승인 피로만 생산
│     결정 6종을 oracle 3 + 정보성 2 + 삭제 1(deps→dependencyLocking)
│     evidence SM-10 재정의: route + 제품 bean + Flyway diff 0
│
├─ 제약3 ─ Atlas 가치가 Java runtime 전환 뒤에 갇혀 있다          ← F11 최대 결함
│  ├ root cause F: Java 25가 Atlas 목표의 전제로 배치됐다
│  │  반증  SM-1~SM-9 어느 것도 Java major에 의존하지 않는다.
│  │        유일한 기여 대상 SM-10은 root cause E로 측정 불가
│  │  결정  Epic 1을 1a(Atlas trace)/1b(runtime)로 분리해 병행
│  │  gate  sprint-status에서 1.1의 blocker에 1.7/1.8 없을 것
│  └ root cause G: Story 1.8 산출물은 Atlas가 표시할 사실이 아니다  ← F12
│     runtime 미등록 = PRD Glossary의 SEED. SEED는 LIVE/VERIFIED 불가(FR-3)
│     결정  1.8을 Epic 1에서 제외. 첫 trace 대상은 실제 도는 com.room.backend
│
└─ 제약4 ─ 계측기가 자기 자신을 검증하지 않는다
   ├ root cause H: 필요 없는 Docker 결합                          ← F5
   │  route/bean은 DB 불필요. 실DB 필요한 건 flyway.info().applied() 하나
   ├ root cause I: portable gate가 이식성 아닌 문자열을 잰다        ← F6
   │  architecture.md:210이 약속한 "Java toolchain smoke" 미구현 — 문서·구현 충돌
   └ root cause J: gate 스크립트 자체가 이식적이지 않다             ← F7 실측 확인
      macOS 기본 bash 3.2: 빈 배열 "${arr[@]}" + set -u = unbound variable
```

---

# E. 단계별 전환 ASCII tree

```
BangCheck → Project Atlas
│
├── [P0] Story 1.0  Observable Baseline (수정 필요, 진행 중)
│    WHY       변경 전후 "같은가"를 판정할 자. 없으면 이후 전부 무근거
│    CHANGE    JDK pin 제거 / .java-version / portable gate / mainClass 명시
│              / virtual-thread false / baseline 5종
│    EVIDENCE  03a4cf5 캡처 == 현재 tree 캡처 (diff 0)      ★현재 없음
│              Docker 없는 머신 포함 test 14/14 green        ★현재 12/14
│    STOP      baseline이 baseline commit 밖에서 캡처됐거나
│              -PatlasBaselineCapture 실행이 BUILD SUCCESSFUL로 끝나면 중단
│
├── [P1] Epic 1a  Atlas Trace   ← Java 25와 **병행**, 종속 아님
│    │   WHY  Atlas의 모든 성공 지표(SM-1~SM-6)가 여기서만 움직인다
│    ├── 1.1 방·체크리스트 등록 계약 characterization
│    │    WHY  Atlas가 "틀린 문장을 더 잘 보여주는 화면"이 되지 않게
│    │    CHANGE POST /api/v1/rooms/check-results 인증·검증·transaction·error
│    │           / orphan POST /rooms/{id}/check-results를 drift로 표시
│    │    EVIDENCE Testcontainers 실행. 401/403/404/409/500 실측
│    │    STOP  P1 결함(IDOR-*, silent-500-*) 0건 재현이면 계측 가정 재검토
│    ├── 1.2 typed registry + source resolver
│    │    EVIDENCE SM-1 resolve 100% / SM-2 dangling 0
│    │    STOP  resolve 실패를 warning으로 낮추자는 요구가 나오면 중단
│    └── 1.3 단일 snapshot에서 detail 파생
│         EVIDENCE SM-3=2, SM-5≤3, SM-C3 renderer 복제 0
│         STOP  page 추가 시 renderer 복사가 필요하면 AD-5 위반
│
├── [P1] Epic 1b  Runtime Platform   ← 1a와 **독립 병행**
│    ├── 1.7 Java 25 (Boot 3.5.16 bridge 우선)
│    │    EVIDENCE EC2 java -version·systemd receipt / rollback rehearsal
│    │              route + Flyway + Start-Class diff 0  (bean/deps는 정보성)
│    │    STOP  ① EC2 receipt 없으면 착수 금지 (현재 미충족)
│    │          ② baseline diff 승인이 100줄 넘으면 gate 재설계 후 재개
│    │          ③ Gradle 9.6.1 config cache에서 atlas* task가 죽으면 F16 선행
│    └── 1.8 site.bangcheck module base   ← **Epic 1에서 제외 권고**
│         WHY  woo-code kernel 참조 구현. Atlas MVP 기여 0
│         STOP Atlas 화면에 SEED 아닌 상태로 노출되려 하면 FR-3 위반
│
├── [P2] 1.4 orphan 결정 / 1.5 retry·동시성 / 1.6 CI gate
│    STOP  1.6은 runner Docker 가용성 실측 전 -x test 제거 금지
└── [P3] Epic 2~5
     STOP  SM-9(2개 역할 4주 주1회) 미달이면 Epic 5 승격 보류
```

---

# F. Atlas 상세 화면 IA

**원칙 — 밀도 경계 3층.** L0는 "어디를 볼까", L1은 "이게 뭔가", L2는 "왜 그렇게 믿나". **L2는 항상 접혀 있다.**

```
L0  OVERVIEW (Page Canvas — 카드당 신호 4개 이하)
│   Feature 카드 = title / state / owner / risk  ← 그 이상 금지
│   ↳ 클릭 1회
L1  DETAIL (기본 펼침 — 여기서 90%가 끝나야 한다)
│   ┌ Identity  FeatureID · Page · Goal[DOC] · Progress[SNAPSHOT 3h] · Owner · Issue
│   ┌ Front ──────────┬ API ─────────────┬ Backend ────────┐
│   │ CheckResultForm │ POST /api/v1/    │ Controller:41   │
│   │  .tsx:88 submit │  rooms/check-    │ →Service:70     │
│   │ [CODE ✓]        │  results         │ →2 repositories │
│   │                 │ opId saveCheck   │ [CODE ✓]        │
│   └─────────────────┴──────────────────┴─────────────────┘
│   ┌ Exceptions (대표 3개, 나머지 "+N more")
│   │  401 미인증 → TS-AUTH-01 [VERIFIED]
│   │  500 juso upstream → (no testRef) [UNVERIFIED] ⚠
│   ┌ Drift (있을 때만 — 없으면 섹션 자체가 없다)
│   │  ⚠ 문서: /rooms/{id}/check-results 가 저장 경로
│   │     코드: Front consumer 0건 → DISC-014 OPEN (정답을 고르지 않는다)
│   ↳ 섹션 헤더 클릭 (총 2~3회 — SM-5)
L2  EVIDENCE (기본 접힘 — 과밀 방지선이 여기다)
    Tests(목표→시나리오→command→마지막 green commit) · Provenance(필드별 authority)
    · Observability(없으면 NOT INSTRUMENTED) · Decisions(supersedes 체인)
    · Design(token·4테마 대비) · Gates(pass/fail·deviation 만료일)
```

**과밀 방지를 문장이 아니라 실패 조건으로:**

| 규칙 | 실패 조건 |
|---|---|
| L0 카드 필드 4개 초과 금지 | 5번째 추가 시 registry validator fail |
| L1은 스크롤 없이 6섹션 | 7번째 섹션에서 fail |
| L2는 기본 collapsed | `defaultOpen` 사용 시 lint fail |
| Exception은 L1에 3개까지 | 4번째부터 "+N more"로 L2 위임 |
| Drift는 조건부 렌더 | drift 0인데 빈 섹션 렌더 시 fail |
| 같은 사실 두 층 렌더 금지 | 동일 selector가 L1·L2 동시 호출 시 fail |
| **SEED는 L1 진입 불가** | SEED가 L1에 렌더되면 fail (FR-3) |

Dashboard(별도 화면)가 소유: STALE 목록 · unresolved drift 집계 · gate 추이 · 만료 임박 deviation. **Detail에 복사하지 않는다.**

---

# G. NOW / NEXT / HOLD

### NOW — 지금 당장 (Story 1.0을 끝내려면 필수)

| # | 할 일 | finding | 완료 판정 |
|---|---|---|---|
| N1 | `git worktree add /tmp/atlas-base 03a4cf5`에서 재캡처 → 현재 tree compare | F1 | 두 캡처 SHA-256 + diff 0 |
| N2 | route/bean 캡처를 Docker 없는 context test로 분리, Flyway만 Testcontainers | F5 | Docker 미설치 머신에서 green |
| N3 | capture를 `test`에서 도달 불가한 task로 분리 + 비-0 exit | F2 | test 실행 경로에서 capture 호출 0 |
| N4 | `absolute_build_files` 빈 배열 가드 | F7 | 잘못된 cwd에서 의도한 메시지로 실패 |
| N5 | virtual-thread를 `Environment.getProperty(...)` resolve로 교체 | F8 | env 주입으로 뒤집으면 test fail |
| N6 | `boot-entry.txt` → `start-class.txt`(불변)/`boot-loader.txt`(정보성) 분리 | F10 | 실패정책이 Boot 전환을 막지 않음 |
| N7 | frontmatter를 `spec_quality_gate`/`impl_quality_gate`로 분리 | F18 | 현재 값 `impl: fail` |
| N8 | tautology assertion 삭제 | F13 | — |

### NEXT — Story 1.0 완료 직후

X1 **Epic 1을 1a/1b로 분리**, 1.1의 blocker에서 1.7·1.8 제거(F11) · X2 Story 1.8을 Epic 5로 이동(F12) · X3 `runtime-dependencies.txt` → Gradle `dependencyLocking`(F9) · X4 `bean-names.txt`를 `com.room.backend` 유래로 필터(F9) · X5 SM-10 재정의(F9) · X6 toolchain smoke 구현 또는 ATLAS-BUILD-001 문구 수정(F6) · X7 **Story 1.1 착수**(회수 조건 C1) · X8 정규화 로직 통합(F14) · X9 `test`의 `bootJar` 의존 제거(F15)

### HOLD — 증거 전에는 보류

| 보류 | 해제 조건 |
|---|---|
| Story 1.7 착수 | EC2 `java -version` + `systemctl cat` + rollback receipt |
| Boot 4.1 + Gradle 9.6.1 | bridge green **그리고** `atlasBuildBaseline --configuration-cache` 실측 통과(F16) |
| deploy의 `-x test` 제거 | GitHub runner에서 Testcontainers MySQL 실행 실측 |
| `site.bangcheck` production scan / JPA mapper | Story 1.1 완료 |
| woo-code 전역 승격 | SM-9 + 두 번째 profile |
| 403/404 정책 | PRD Open Question #1 승인 |
| gate 8개 확대(SM-6) | 기존 gate의 정당한 실패 비율 ≥50% 실측(C3) |

---

# H. 최종 판정 + 반드시 먼저 고칠 5개

## REVISE (MAJOR 12 / MINOR 6)

Story 1.0은 `in-progress`가 맞다. 다만 현재는 "덜 끝난 것"이 아니라 **"틀린 것이 섞여 끝나가는 것"** 이다.

**1 — baseline을 `03a4cf5`에서 재캡처하라 (F1).** `boot-entry.txt`와 `runtime-dependencies.txt`는 `springBoot{mainClass}`와 test dependency를 추가한 **뒤에** 만들어졌다. 변경 후 상태를 baseline이라 부르면 그 변경은 영원히 검출되지 않는다. Story 1.0의 존재 이유가 이 한 가지다.

**2 — capture가 green을 만드는 경로를 끊어라 (F2).** `BaselineSnapshot.java:31-35`는 capture 시 쓰고 그냥 return한다. `-PatlasBaselineCapture` 한 번이면 어떤 회귀든 BUILD SUCCESSFUL이다. Story 1.0의 실패 정책이 금지한 바로 그 동작이다. **gate가 실패했을 때 가장 쉬운 행동이 gate를 지우는 것이면, 그 gate는 없는 것과 같다.**

**3 — Docker를 route/bean 캡처에서 떼어내라 (F5).** 실DB가 필요한 건 `flyway.info().applied()` 하나다. 이 불필요한 결합이 2 failed의 직접 원인이고 **기존 11개 테스트의 실행 가능성을 후퇴시켰다.** Story 제약("H2로 의미를 바꾸지 않는다")과 충돌하지 않는다 — DB가 필요 없는 증거를 DB에서 떼라는 것이다.

**4 — Epic 1에서 1.7·1.8을 분리하라 (F11, F12).** `epics.md:128`의 `1.0→1.7→1.8→1.1`은 SM-1~SM-6 전부를 Atlas가 요구하지 않는 것 뒤에 세운다. Java major는 어느 SM에도 기여하지 않고, 유일한 기여 대상 SM-10은 5번 때문에 측정 불가다. 게다가 1.7의 `OPS-EC2-RUNTIME-RECEIPT`는 코드로 열 수 없는 운영 blocker다 — 그게 막히면 Atlas 전체가 정지한다.

**5 — baseline 6종을 oracle/정보성으로 재분류하고 SM-10을 재정의하라 (F9, F10).** `runtime-dependencies.txt` 89줄과 `bean-names.txt`는 Boot 3.2.5→3.5.16에서 **전량 diff**가 난다 — 가장 필요한 순간에 신호가 0이 된다. `boot-entry.txt`는 제품 불변량(`Start-Class`)과 framework 세부(`JarLauncher`)를 섞어 두고 실패정책은 이 파일에 deviation을 금지한다. Boot 전환이 규칙상 통과 불가가 되고 **유일한 탈출구가 2번의 capture다 — gate가 스스로를 무력화한다.** SM-10의 "허용되지 않은 diff"에는 허용/불허 분류기가 정의된 적이 없다.

---

**검증 방법(제안 수정을 적용할 때):** ① `git worktree add /tmp/atlas-base 03a4cf5 && ./gradlew -p /tmp/atlas-base/backend test -PatlasBaselineCapture` 후 현재 tree와 `diff -r` → 0 ② Docker 데몬 중지 상태에서 `./gradlew test` → 14/14 green ③ `SPRING_THREADS_VIRTUAL_ENABLED=true ./gradlew test` → fail ④ `bash backend/scripts/check-portable-build.sh` 를 `/tmp`에서 실행 → 의도한 메시지로 실패 ⑤ `./gradlew atlasBuildBaseline --configuration-cache` → 결과를 F16 판정 근거로 기록.

전체 findings 표(F1~F18, 위치·실패조건·최소수정)와 보존할 강점·새 위험·회수 조건 C1~C4는 리뷰 파일에 있다.
```

## Concise summary

claude 실행 완료. raw output에서 verdict와 finding을 확인할 것.
