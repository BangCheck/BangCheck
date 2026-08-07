# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-07T03:09:48.665562+00:00
- Finished at (UTC): 2026-08-07T03:10:08.409683+00:00

## Original task / label

issue-262-gate-scope-design

## Final prompt

```text
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
이 리뷰에 Codex 토큰을 사용합니다. 진행할까요? (Y/N)
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
