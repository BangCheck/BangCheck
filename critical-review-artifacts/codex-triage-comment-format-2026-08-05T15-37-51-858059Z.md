# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-05T15:35:57.888197+00:00
- Finished at (UTC): 2026-08-05T15:37:51.856785+00:00

## Original task / label

triage-comment-format

## Final prompt

```text
[실행 조건] codex exec 비대화형. 되묻지 마라. 비용 승인 끝. AGENTS.md STEP 1이 가리키는
_wood/workflows/_protocol.md 의 승인 게이트·preflight 는 이 요청에 적용되지 않는다.
(Y/N)·확인 요청·메뉴 금지. 첫 출력부터 본문.

## 임무
오늘 만든 이슈 트리아지 봇의 코멘트 형식을 오픈소스 3곳의 방식으로 개편하려 한다.
그 설계를 반박하고 확정안을 내라.

## 대상 — 직접 읽어라
- .project-atlas/tools/triage_issue.py   (현행 코멘트 생성기)
- .project-atlas/tools/sync_check.py     (SYN-01~03 · 마커 규약)
- .project-atlas/tools/project_defects.py (마커 생성 · 회수 경로)
- .github/workflows/atlas-triage.yml
- .project-atlas/schema.yaml, registry/defects.yaml
실제 코멘트 예시는 이 저장소 이슈 #234(마커 없음)·#241(마커 있음)에 달려 있다.

## 참고한 오픈소스 (원문 인용)

### A. Yeachan-Heo/gajae-code — 서명된 판정
```
## Signed issue disposition — OPERATIONAL_NOT_CODE

**Admission:** not admitted as a repository code defect on the current evidence.
The direct-route control is decisive: explicitly selecting the configured
`layofflabs/gpt-5.6-luna` route also returned upstream `401 "Invalid API key"`.
That rules out the `lunamaxxing` profile name as the immediate cause.

**Duplicate check:** no canonical duplicate established. Historic 401 mentions
describe separate credentials/providers. This is not a duplicate of #3726 or #3738.

**Current owner path:** provider/account operator for the configured credential.
A repository code lane becomes admissible only with redacted control evidence that
the same credential succeeds against the same endpoint outside GJC.

—
*[repo owner's gaebal-gajae (clawdbot) 🦞]*
```
PR 본문에는 기계 판독 토큰이 있다:
```
gajae.pr-review-verdict.v1 needs-human sha256:ac7a532debd4f74b reviewer:human
  evidence:bun test packages/coding-agent/test/marketplace/cli.test.ts (14 pass)
```
그리고 실패를 숨기지 않는다:
```
`bun run check:types` NOT completed: tsc aborts with `fatal error: runtime: name
offset out of range` on this machine at `dev` baseline too, i.e. before this change.
Needs CI to cover the typecheck.
```

### B. ultraworkers/claw-code — 증거 우선 종료
```
Fixed on current `main` by #3234/#3236. Evidence:
- `origin/main` is `9b3548ca4337f54b001262474a35c209c17432b0`.
- `crates/api/src/providers/openai_compat.rs` now has `send_message` at line 214
  and `stream_message` at line 272, so the duplicated stray tail from ae2f203 is gone.
- `cargo test -p api openai_compatible_client_honors_http_proxy_for_requests` passes.
- PR #3236 CI is green, including build, fmt, test, clippy, docs, Windows smoke.
Closing as resolved.
```

### C. code-yeongyu/oh-my-openagent — 누적과 자기 정정
```
Update, and a correction to my own framing above: one member of this cluster
should probably **not** be dismissed as flake.

`acquireSessionAdmissionLease` has now failed on two different platforms, on two
different PRs, on two different days:
  #6602, test (macos-latest), run 30955509898  (fail) ...
  #6610, test (windows-latest), run 31001423849 (fail) ...
```
수를 정확히 적고(`13219 pass / 48 skip / 1 fail`) 타임아웃 실패와 단언 실패를 구별한다.

## Claude 제안 (반박 대상)

현행 코멘트는 산문이라 사람만 읽는다. 아래를 가져오려 한다.

1. **분류 어휘 도입** — LINKED / NEEDS_LINK / UNMATCHED / NOT_A_DEFECT
   지금은 "후보 기능"만 나열하고 판정을 말하지 않는다.
2. **기계 판독 판정 토큰** — 현행 마커 `<!-- atlas-defect: BC-XXX -->` 를 확장해
   판정·근거·시각을 담는다. sync_check 가 "봇이 UNMATCHED로 판정한 이슈 N건"을
   집계할 수 있게 된다.
3. **중복 판정을 별도 항목으로** — 지금은 "비슷한 결함" 목록만 내고 중복 여부를 말하지 않는다.
4. **다음 소유자 명시** — FT 의 owner 를 읽어 "이 결함은 누가 들고 가는가"를 적는다.
5. **봇 서명** — 사람 코멘트와 구별되게.
6. **자기 정정** — 재실행 시 판정이 바뀌면 그 사실을 적는다.

## 반박할 지점

- 분류 어휘 4종이 맞는가. 이 저장소의 실제 상태를 덮는가?
  registry 결함이 이슈와 이어지지 않은 경우, 이슈가 결함이 아닌 경우(프로세스·기능요청),
  마커는 있는데 registry 에 없는 경우, 번호가 어긋난 경우를 다 담는가?
- 판정 토큰을 마커와 **같은 주석에 합칠 것인가 분리할 것인가.**
  합치면 project_defects.py 의 DEFECT_MARKER 정규식과 sync_check 의 marker_of 가
  둘 다 깨질 수 있다. 실제로 깨지는지 코드를 읽고 판정하라.
- 봇이 이슈 **본문**을 고쳐 마커를 넣게 할 것인가, 코멘트로만 안내할 것인가.
  현행은 사람이 본문에 마커를 넣게 안내한다. 봇이 직접 넣으면 무엇이 위험한가?
- "다음 소유자"를 FT 의 owner 에서 읽는 것이 맞는가.
  FT owner 는 기능 담당이고 결함 수정 담당과 다를 수 있다. 실제 FT 파일의 owner 값을 보라.
- 자기 정정을 어떻게 구현하는가. 현행은 코멘트를 통째로 덮어쓴다(멱등 갱신).
  덮어쓰면 이전 판정이 사라져 "정정했다"는 사실 자체가 남지 않는다.
  누적할 것인가 덮을 것인가?
- oh-my-openagent 처럼 수를 정확히 적으려면 우리 봇은 무엇을 세야 하는가?
- 위 3곳은 전부 사람이 쓴 코멘트다(봇 계정이 아니라 owner 계정). 우리는 Actions 봇이 쓴다.
  그 차이가 형식에 영향을 주는가?

## 출력
1) 사실 오류
2) 제안 1~6 각각 채택/수정/폐기 + 한 줄 근거
3) 코멘트 템플릿 확정안 (마커 있음/없음 각각, 실제 문구로)
4) 판정 토큰 스키마 확정안 — 기존 마커와의 관계 포함
5) 놓친 것
간결하게. 근거 없는 문장을 쓰지 마라.

```

## Final response

```text
## 1) 사실 오류

- `registry/defects.yaml`가 아니라 실제 정본은 [.project-atlas/registry/defects.yaml](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/registry/defects.yaml)이다.
- 현행 코멘트는 산문만이 아니다. 코멘트 식별자 `<!-- atlas-triage -->`와 본문 조인 키 `<!-- atlas-defect: BC-ID -->`가 이미 있다.
- 판정 토큰을 기존 마커 주석에 합치면 실제로 깨진다. `<!-- atlas-defect: BC-X state=... -->`는 triage 정규식에 매치되지 않고, `sync_check.marker_of()`는 `BC-X state=...`를 ID로 읽어 SYN-02/03 불일치를 내며, `project_defects.py`의 정확 문자열 검색도 실패한다.
- “봇이 UNMATCHED로 판정한 N건”은 현행 `sync_check.py`만으로 집계할 수 없다. 이 도구는 이슈 본문만 읽고 코멘트를 읽지 않는다.
- registry에는 결함 `owner` 필드가 없다. 현재 31건 중 이슈 연결 5건이며, FT owner는 기능 담당자일 뿐 결함 수정 담당자로 선언되어 있지 않다.
- #234/#241의 실제 코멘트 조회는 시도했지만 환경 네트워크가 `error connecting to api.github.com`으로 실패했다. 따라서 두 코멘트의 구체 문구는 독립 검증하지 못했다.

## 2) 제안별 결론

| 제안 | 결론 | 근거 |
|---|---|---|
| 1. 4종 분류 | 수정 | `BROKEN_LINK`가 추가되어야 한다: 마커→없는 registry, registry 번호 불일치, 마커 누락은 의미상 UNMATCHED가 아니라 정합 오류다. `NOT_A_DEFECT`는 사람의 명시 선언에만 쓴다. |
| 2. 판정 토큰 | 수정 | 기존 `atlas-defect`와 분리한 triage 코멘트 주석으로 둔다. |
| 3. 중복 판정 | 수정 | 현행은 제목 토큰 2개 이상 겹침일 뿐이다. “중복 아님”이 아니라 `NO_CANDIDATE` / `CANDIDATE_UNLINKED` / `CANDIDATE_LINKED`로 표기한다. |
| 4. 다음 소유자 | 수정 | `다음 소유자`가 아니라 `기능 담당`으로 표시하고, “결함 수정 담당은 미지정”을 함께 쓴다. |
| 5. 봇 서명 | 채택 | `github-actions[bot]`, 스키마 버전, 관측 시각·입력 fingerprint를 남겨 사람 판단처럼 보이지 않게 한다. |
| 6. 자기 정정 | 수정 | 최신 판정용 코멘트 하나는 갱신하고, 판정 또는 근거 fingerprint가 바뀔 때만 별도 정정 코멘트를 추가한다. |

확정 상태는 `LINKED`, `NEEDS_LINK`, `UNMATCHED`, `NOT_A_DEFECT`, `BROKEN_LINK`다. `NOT_A_DEFECT`는 예를 들어 사람이 붙인 `atlas:not-a-defect` 라벨 같은 명시 입력이 있을 때만 봇이 반영한다.

## 3) 코멘트 템플릿

마커 없음:

```md
<!-- atlas-triage:v1 {"state":"UNMATCHED","duplicate":"NO_CANDIDATE","observedAt":"2026-08-06T00:00:00Z","fingerprint":"sha256:<hash>"} -->

## Atlas triage — UNMATCHED

**판정:** 현재 registry 결함과의 확정 연결을 찾지 못했습니다. 이는 결함 아님을 뜻하지 않습니다.

**근거:** 본문에서 Atlas 구현 경로 또는 기존 결함 후보를 찾지 못했습니다.

**중복 검토:** `NO_CANDIDATE` — 현행 제목 토큰 규칙으로는 기존 결함 후보가 없습니다.

**다음 조치:** 결함이면 사람이 evidence·severity·disposition을 갖춘 registry 항목을 만들고, 이슈 본문에 정확한 `<!-- atlas-defect: BC-ID -->` 마커를 추가하십시오.

—
Atlas Issue Triage · github-actions[bot]
```

마커 있음·정상 연결:

```md
<!-- atlas-triage:v1 {"state":"LINKED","defect":"BC-ID","duplicate":"NOT_APPLICABLE","observedAt":"2026-08-06T00:00:00Z","fingerprint":"sha256:<hash>"} -->

## Atlas triage — LINKED

**판정:** 이슈 본문의 `BC-ID` 마커가 registry와 이슈 번호에 정확히 연결됩니다.

**근거:** registry의 evidence는 `<path> — <symbol>`이며, disposition은 `<disposition>`입니다.

**중복 검토:** `NOT_APPLICABLE` — 이미 정본 결함에 연결된 이슈입니다.

**담당 경로:** 기능 담당 `<@owner>` (`<FT-ID>`). 결함 수정 담당은 registry에 별도 지정되어 있지 않습니다.

**다음 조치:** 수정 PR 본문에 `closes #<issue-number>`를 넣으십시오.

—
Atlas Issue Triage · github-actions[bot]
```

마커가 있으나 registry 없음·번호 불일치면 제목만 `BROKEN_LINK`로 바꾸고, 원인을 정확히 한 줄로 쓴다. 이 상태에서 새 결함 등록이나 본문 수정은 안내하지 않는다.

## 4) 판정 토큰 확정안

기존 조인 키는 이슈 본문에 불변으로 유지한다.

```html
<!-- atlas-defect: BC-ID -->
```

봇의 최신 코멘트에만 별도 토큰을 둔다.

```html
<!-- atlas-triage:v1 {
  "state":"LINKED|NEEDS_LINK|UNMATCHED|NOT_A_DEFECT|BROKEN_LINK",
  "defect":"BC-ID|null",
  "duplicate":"NOT_APPLICABLE|NO_CANDIDATE|CANDIDATE_UNLINKED|CANDIDATE_LINKED|CONFIRMED_BY_HUMAN",
  "evidence":{"pathsFound":0,"featureCandidates":[],"defectCandidates":[]},
  "observedAt":"RFC3339 UTC",
  "fingerprint":"sha256:<issue-body-and-registry-input>"
} -->
```

`sync_check`는 코멘트를 REST로 읽어, `github-actions[bot]`이 남긴 최신 `atlas-triage:v1`만 집계해야 한다. 집계는 최소한 다음처럼 분리한다.

- 최신 봇 판정별 건수: `LINKED`, `NEEDS_LINK`, `UNMATCHED`, `NOT_A_DEFECT`, `BROKEN_LINK`
- 링크 무결성 위반: SYN-01, SYN-02, SYN-03
- 미실행/봇 코멘트 없음: 별도 수치

`UNMATCHED`에 `NOT_A_DEFECT`, `BROKEN_LINK`, 코멘트 미생성을 합산하면 안 된다.

## 5) 놓친 것

- 봇이 이슈 본문을 고치면 추정이 정합 조인 키가 된다. 잘못된 자동 판정이 SYN-02/03의 실제 데이터 오류가 되므로, 본문 마커는 계속 사람이 소유해야 한다.
- 현행 코드는 `<!-- atlas-triage -->`가 있는 첫 코멘트를 작성자 확인 없이 PATCH한다. 사람 코멘트나 다른 봇 코멘트를 갱신하려 들 수 있다. 전용 v1 마커와 봇 작성자 확인이 필요하다.
- `opened/reopened/edited` 실행은 같은 이슈에서 경합할 수 있다. 정정 이력을 남기려면 이슈 번호 단위 Actions concurrency가 필요하다.
- 정정은 시각 변경만으로 만들지 말고 `state + evidence + duplicate` fingerprint가 바뀔 때만 남겨야 한다. 그렇지 않으면 재실행 로그가 정정 이력으로 오염된다.
- Actions 봇은 사람 작성자와 달리 책임 주체가 아니다. 따라서 “확정”, “중복 아님”, “담당자” 같은 단정 대신 자동 관측 범위와 인간 확인 필요성을 형식 자체에 고정해야 한다.
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
