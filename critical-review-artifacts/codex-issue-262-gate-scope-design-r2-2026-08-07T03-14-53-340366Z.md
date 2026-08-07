# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-07T03:12:46.854450+00:00
- Finished at (UTC): 2026-08-07T03:14:53.338745+00:00

## Original task / label

issue-262-gate-scope-design-r2

## Final prompt

```text
[실행 조건 — 먼저 읽어라]
이것은 비대화형 헤드리스 실행이다(`codex exec`, approval_policy=never, sandbox=read-only).
비용 확인은 사용자에게 이미 받았다. 되묻지 말라.
질문이나 확인 요청만 내고 끝내면 이 턴은 실패로 기록된다.
지금 즉시 아래 파일들을 읽고 검토 결과를 내라. 중간 확인 없이 최종 답변까지 간다.

너는 검토자다. 아래 설계를 **승인하지 말고 반박**하라. 저자는 Claude다.
근거 없는 동의는 금지. 파일을 직접 읽고 코드를 근거로 반박하라.

## 읽어야 할 파일 (이 디렉터리 기준)

- `.project-atlas/tools/sync_check.py` (195줄) — 검토 대상 핵심
- `.github/workflows/atlas-resolve.yml` — 이 검사가 걸리는 자리
- `.project-atlas/tools/resolve.py` — 자매 도구(네트워크 모름). 설계 원칙 비교용
- `.project-atlas/tools/test_resolve.py` — "규칙이 살아 있는지" 검사 선례
- `.project-atlas/registry/defects.yaml` — 검사 대상 데이터
- `.project-atlas/tools/pm_snapshot.py` — 파생값(lifecycle) 소유자

## 배경 — 2026-08-07 실측 사고 3건

`sync_check.py`는 registry ↔ GitHub Issue 양방향 정합을 본다.
`atlas-resolve.yml`의 `pull_request` 트리거에 **경로 필터 없이** 걸려 있다.

규칙:
- SYN-01 registry가 가리키는 이슈가 실재하는가 (registry → GitHub)
- SYN-02 그 이슈가 정말 그 결함인가, 본문 마커 대조 (registry → GitHub)
- SYN-03 마커가 있는 이슈가 registry에 있는가 (GitHub → registry, 고아 투영)

하루에 세 번, **무관한 PR**이 SYN-03 때문에 떨어졌다.

1. 이슈 #255·#256이 열려 있는데 registry에 그 번호가 아직 없었다.
   PR #258(`.github/workflows/auto-add-to-project.yml` 파일 1개 삭제, registry 무관)이
   이것 때문에 떨어졌다. PR #250 머지로 해소.
2. 8분 뒤 이슈 #259가 열렸다(마커 정상, registry 항목은 아직 없음).
   #258이 또 떨어졌다. PR #260 머지로 해소.
3. Claude가 이 문제를 설명하는 이슈 #262를 열면서 봇 안내문을 **인용**하며
   마커 문법을 코드 스팬(백틱) 안에 그대로 적었다. 파서가 그것을 진짜 마커로
   읽어 SYN-03 위반이 됐고 PR #261이 떨어졌다.
   본문을 고쳐 해소했으나, 고치는 과정에서 파서 코드를 인용하다 **두 번째로**
   같은 사고를 냈다.

## Claude가 제안한 수정

### A. `marker_of()`를 본문 첫 줄로 앵커

현재는 본문 아무 데서나 `MARKER_PREFIX`를 찾는다. 코드 스팬·인용문을 구별하지
않고, 첫 줄 앵커도 없고, 첫 occurrence만 쓴다.

실측: 마커 있는 이슈 14건 전부 본문 1행이 마커다(예외 0건).
제안: 첫 줄만 본다.

### B. SYN-03의 폭발 반경 축소 — 후보 셋

- **B1 증분 판정**: PR 게이트에서 base(main)의 `defects.yaml`과 HEAD의 것으로
  각각 위반 집합을 구해 **차집합만** exit 1. 기존 위반은 경고로 출력.
  `push: main`과 `schedule`에서는 전체 위반에 exit 1.
- **B2 경로 필터**: `atlas-resolve.yml`에 `paths: .project-atlas/**` 추가.
- **B3 둘 다.**

Claude 추천은 **B1**. 근거: SYN-01/02는 PR의 `defects.yaml`을 읽으므로 PR이
만들 수 있는 위반이지만, SYN-03은 저장소의 모든 이슈를 훑는 전역 상태라 PR과
인과가 없다. B2만으로는 registry를 고치는 PR(#261 같은)이 여전히 남의 드리프트를
갚는다.

### C. `sync_check.py`에 테스트가 없다

`test_resolve.py`·`test_triage_comment.py`·`test_triage_route.py`는 있는데
`test_sync_check.py`는 없다. `atlas-resolve.yml`은 `resolve.py`에 대해서만
"규칙이 살아 있는지 먼저 본다 — 규칙이 죽어도 통과는 초록불이다"라며
`test_resolve.py`를 먼저 돌린다. `sync_check.py`는 그 그물 밖이다.

## 반박해야 할 지점 (최소 이 다섯)

1. **B1의 구멍.** 두 실행 사이 이슈 상태가 바뀌면? 위반을 어떤 키로 동일시할
   것인가(rule+where+detail? rule+issue번호?) base에 없던 위반이 PR 때문이 아니라
   그사이 누가 이슈를 열어 생긴 경우는? **"PR이 만든 것만 죽인다"가 실제로
   판정 가능한 명제인가?** 판정 불가라면 B1은 근본적으로 틀린 설계다.
2. **B1이 이 저장소의 명시 원칙과 충돌하는가.** 이 저장소는 "실패를 초록불로
   흘리지 않는다", "검사 대상 0개인 통과와 맞는 통과를 구별한다"를 코드 주석과
   커밋 메시지에 반복해 적어 왔다(`aa352e6`, `check-atlas-snapshot.mjs` 주석,
   `sync_check.py` docstring의 SYN-04 제거 사유). 기존 위반을 경고로 낮추는 것이
   그 원칙과 어긋나는가? 어긋난다면 B1은 채택하면 안 된다.
3. **A가 깨뜨릴 수 있는 것.** 마커 앞 공백/BOM/선행 개행, 사람이 본문을 편집해
   마커가 2행으로 밀리는 경우, GitHub API가 CRLF를 주는 경우.
   **14건 전수 확인이 미래 보장이 되는가?** 더 나은 앵커 규칙이 있는가
   (예: 코드펜스·인용 제거 후 검색, 또는 마커를 title/label로 옮기기)?
4. **오늘의 사고 3건 각각을 어느 수정이 막는지 대조하라.** 막지 못하는 것이
   있으면 지적하라. 특히 사고 1·2(registry 백필 시차)를 A가 막지 못한다는 점,
   사고 3을 B가 막지 못한다는 점이 맞는지 확인하라.
5. **더 나은 4번째 안.** 예를 들어 SYN-03을 PR 게이트에서 통째로 빼고
   `push: main` + `schedule` 전용으로 옮기는 안. 이 경우 "머지 후에야 안다"는
   대가가 생기는데, 그 대가가 지금의 "무관한 사람이 막힌다"보다 나은가?

## 형식

각 발견을 REVISE 항목으로 내고 MAJOR/MINOR를 붙여라.
설계를 그대로 채택해도 된다는 결론이면 그 근거를 코드로 대라.

```

## Final response

```text
결론: Claude의 **B1 추천은 채택하면 안 됩니다.** 전역 GitHub 상태를 “PR이 만든 위반”으로 판정할 근거가 없고, 실제로는 기존 불일치를 초록 PR로 숨기는 설계입니다.

- **[MAJOR] REVISE — B1은 인과를 판정하지 못한다.**  
  `sync_check.py`는 실행 시점마다 `gh issue list`로 전체 이슈를 새로 읽습니다([sync_check.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/sync_check.py:112)). base/HEAD의 `defects.yaml`만 바꿔 두 번 검사하면 두 검사 사이의 이슈 생성·본문 수정·삭제가 결과를 바꿉니다. `rule+where+detail`은 detail 문구 변화에 취약하고, `rule+issue번호`는 동일 이슈의 “고아 → 잘못된 매핑” 같은 위반 상태 변화를 구별하지 못합니다.  
  단일 GitHub 스냅샷을 한 번 받아 두 registry 버전에 적용하면 경합은 줄일 수 있지만, 그 결과도 “현재 base 대비 HEAD가 새로 깨뜨렸는가”일 뿐 “PR이 만들었는가”는 아닙니다. B1의 명제는 이름부터 과장입니다.

- **[MAJOR] REVISE — B1은 현재 구현·워크플로에 존재하지 않는 기반을 전제한다.**  
  현재 workflow는 PR HEAD를 한 번 checkout할 뿐([atlas-resolve.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/atlas-resolve.yml:45)), base SHA checkout/worktree/fetch가 없고, `sync_check.py`도 `ATLAS_DIR/registry/defects.yaml`을 고정으로 읽습니다([sync_check.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/sync_check.py:53), [104–106](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/sync_check.py:104)).  
  더 결정적으로 workflow에는 `pull_request`만 있고 `push: main`·`schedule`이 없습니다([atlas-resolve.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/atlas-resolve.yml:31)). B1의 “main/schedule에서는 전역 실패”는 제안만으로는 전혀 실행되지 않습니다.

- **[MAJOR] REVISE — 기존 SYN-03을 경고로 낮추는 B1은 저장소의 게이트 계약과 충돌한다.**  
  이 workflow는 `gh` 실패조차 job 실패로 처리하는 이유를 “맞다”와 “안 봤다”를 같은 초록불로 만들지 않기 위해서라고 명시합니다([atlas-resolve.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/atlas-resolve.yml:96)). `aa352e6`도 “판정 불가”와 “판정을 못 남겼다”를 같은 신호로 만들지 말라고 고쳤습니다.  
  B1은 실제 불일치를 “기존이므로 경고”로 바꿉니다. 이는 `resolve.py`의 `known`처럼 registry에 이미 근거가 있어 의도적으로 비위반인 경우와 다릅니다. SYN-03은 정의상 registry↔Issue 조인 실패입니다. B1 PR check의 이름은 더 이상 “Verify registry and issues agree”일 수 없습니다.

- **[MAJOR] REVISE — B2 및 B3는 resolver까지 무력화한다.**  
  `.project-atlas/**`만 `paths`에 넣으면 application-only PR이 evidence 경로·심볼, route, frontend 호출과 registry의 불일치를 만들어도 resolver가 실행되지 않습니다. `resolve.py`는 바로 그 실제 저장소와의 정합(SRC/RTE/FEC)을 검사하는 도구입니다([resolve.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:8)).  
  예를 들어 registry가 가리키는 심볼을 프론트 리팩터링으로 삭제한 PR은 `.project-atlas`를 건드리지 않을 수 있습니다. B2는 이를 조용히 통과시킵니다. B3는 이 결함을 그대로 상속합니다. 경로 필터를 쓰려면 resolver와 sync를 별도 workflow/job으로 분리하고, resolver에는 실제 검사 대상 경로도 포함해야 합니다.

- **[MAJOR] REVISE — A의 “본문 첫 줄”은 관측값이지 안정된 계약이 아니다.**  
  현재 파서는 문자열 전체에서 첫 prefix와 다음 `-->`를 찾습니다([sync_check.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/sync_check.py:79)). 반면 공식 투영기는 현재 marker를 첫 줄에 생성합니다([project_defects.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/project_defects.py:85), [88](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/project_defects.py:88)). 이는 현 생성기의 성질일 뿐, 사람이 편집한 Issue의 미래 보장은 아닙니다.  
  BOM, 선행 공백, 빈 줄, 템플릿 삽입으로 marker가 2행으로 밀리는 경우에 A는 실제 투영을 못 읽습니다. CRLF 자체는 Python `splitlines()`로 안전하게 처리할 수 있지만, 구현 계약을 명시하지 않으면 또 다른 예외가 됩니다.  
  더 나은 규칙은 “첫 **비공백** 줄이 정확히 marker 한 줄이어야 한다”입니다. 예: BOM/공백은 허용하되 `^\ufeff?[ \t]*<!-- atlas-defect: ID -->[ \t]*$`만 허용하고, 인라인 코드·인용문·코드펜스는 매치되지 않게 합니다. 이 계약을 문서화하고 생성기와 테스트가 공유해야 합니다. title/label로 옮기는 것은 수동 편집·label 권한·검색 규약을 새로 만들므로, 현 HTML comment 계약보다 자동화상 우월하다는 근거가 없습니다.

- **[MAJOR] REVISE — `test_sync_check.py` 없이 A와 분리 설계를 넣으면 다시 “규칙이 죽어도 초록불”이다.**  
  `test_resolve.py`는 기준선과 규칙별 변형을 분리해 기대 rule 외의 추가 발화도 실패로 봅니다([test_resolve.py](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/test_resolve.py:133), [158–170](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/test_resolve.py:158)). workflow도 이를 sync 검사보다 먼저 실행합니다([atlas-resolve.yml](/Users/jonghoPro/woo/00_project/08_BangCheck/.github/workflows/atlas-resolve.yml:77)). `sync_check.py`에는 동등한 방어가 없습니다.  
  최소한 canonical marker, 코드 스팬/인용/펜스, BOM·공백·CRLF, 미종결 marker, SYN-01, SYN-02 mismatch, SYN-03 orphan/잘못된 issue mapping, GitHub 조회 실패를 fixture로 검사해야 합니다. 네트워크를 호출하지 않도록 “issue snapshot → violations”를 순수 함수로 분리하는 편이 적절합니다.

사고별 대조:

| 사고 | A | B1 | B2 | 권고안 |
|---|---|---|---|---|
| #255·#256 백필 전, #258 무관 PR 실패 | 막지 못함 | PR은 통과시킬 수 있으나 기존 불일치를 경고로 숨김 | #258에는 효과 있음 | PR 차단 없음, 전역 감시는 즉시 실패/알림 |
| #259 백필 전, 재실행 실패 | 막지 못함 | 동일 | #258에는 효과 있음 | 동일 |
| #262 코드 스팬 인용, #261 실패 | 정확한 canonical-anchor A면 오탐 제거 | 오탐 자체는 남기고 차집합에서 숨길 뿐 | #261은 registry도 변경했으므로 여전히 실행·실패 가능 | A로 원인 제거, 전역 감시로 보고 |

**4번째 안 권고:** SYN-03을 PR의 절대 게이트에서 제거하고, `issues: [opened, edited, reopened]` + `push: main` + `schedule`에서 전역 SYN-03을 엄격하게 실행하십시오. `push`/schedule만보다 Issue 이벤트를 더하면 #255/#259/#262 유형은 생성·편집 직후 잡힙니다. PR에서는 변경된 defect ID와 base→HEAD에서 제거·재매핑된 ID만 대상으로 SYN-01/02 및 해당 조인 관계를 검사해야 합니다.

대가는 “전역 고아는 merge 전에 PR을 막지 않는다”입니다. 그러나 현재도 #258처럼 전혀 고칠 권한·문맥이 없는 사람이 전역 드리프트의 채무를 떠안습니다. 전역 상태의 소유자를 Issue 이벤트와 main 감사로 옮기고, PR에는 PR이 바꾼 조인 키만 책임지게 하는 편이 더 정확하고 운영상 공정합니다.
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
