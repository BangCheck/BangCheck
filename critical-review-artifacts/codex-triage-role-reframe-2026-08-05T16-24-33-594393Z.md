# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-05T16:22:45.657117+00:00
- Finished at (UTC): 2026-08-05T16:24:33.589332+00:00

## Original task / label

triage-role-reframe

## Final prompt

```text
[실행 조건] codex exec 비대화형. 되묻지 마라. 비용 승인 끝.
AGENTS.md STEP 1 이 가리키는 _wood/workflows/_protocol.md 의 승인 게이트·preflight 는
이 요청에 적용되지 않는다. (Y/N)·확인 요청·메뉴 금지. 첫 출력부터 본문.

## 상황이 바뀌었다 — 앞선 설계를 사용자가 뒤집었다

앞선 리뷰(codex-triage-comment-format-2026-08-05T15-37-51)에서 확정한 5종 판정
(LINKED/NEEDS_LINK/UNMATCHED/BROKEN_LINK/NOT_A_DEFECT)은 "Atlas registry 가 정본이고
이슈는 그 투영"이라는 전제 위에 있었다.

사용자가 그 전제를 부정했다. 근거는 이렇다.

  "Atlas → Issue 는 처음 한 번 녹일 때뿐이다. 시나리오상 정상 상태는 반대다 —
   이슈가 먼저 생기고 거기서 ID 가 나온다."

실제로 그렇다. 오늘 결함 31건 중 5건만 투영했고, 앞으로 새 결함은 팀원이 이슈로 연다.

그리고 사용자는 봇의 역할도 좁혔다.

  "내 봇은 PR 을 만드는 게 아니고, comment 에
     이슈를 분석한 결과
     - 어디 파트에 배정되었습니다. 담당자는 누구입니다
     - 근거 :
   이렇게 되면 될 것 같다. 더 필요한 사항이 있나 확인해봐 템플릿으로"

즉 registry 를 고치지 않고 **분류·배정·근거만 코멘트로** 낸다.
제목에 [BC-ID] 를 붙이지 않는다 — ID 는 코멘트와 registry 가 갖는다.

## 대상 — 직접 읽어라
- .project-atlas/tools/triage_issue.py   (현행. 5종 판정 · 토큰 · fingerprint)
- .project-atlas/tools/sync_check.py     (SYN-01~03)
- .project-atlas/tools/project_defects.py
- .project-atlas/schema.yaml             (defect required: id·severity·title·detail·evidence·disposition)
- .project-atlas/registry/defects.yaml   (31건)
- .project-atlas/registry/FT-*.yaml      (19개, owner 필드 포함)
- .github/workflows/atlas-triage.yml

## 실측 (검증 대상)
- 결함 ID 공간: BC-{영역}-{2자리}. 영역별 다음 번호 —
  ARCH 03 · ATLAS 02 · AUTH 91 · CHK 10 · DB 02 · DEPLOY 02 · LIST 04 ·
  REG 06 · ROOM 07 · RPT 06 · SEC 02
- severity 는 P1/P2/P3 뿐. UNDECIDED 같은 미정 값이 없다.
- disposition 에는 UNDECIDED 가 있다.
- evidence.path 는 resolve.py SRC-01 이 파일 실존을 검사하고,
  evidence.symbol 은 SRC-02 가 파일 안 등장을 검사한다.
- registry 경로 29개 중 17개가 여러 기능에 걸린다 (RoomController.java → 7개).
- FT 파일에 owner 가 있다(예: "@minwoo-l"). 결함 수정 담당은 registry 에 없다.
- 팀원이 만든 이슈 15건 중 본문에 소스 경로를 적은 것은 거의 없다.
- 사용자 선언: 프론트 관련은 전부 사용자(@Woo-JongHo)가 담당이다.

## 판정할 것

1. **5종 판정 어휘를 유지할 것인가.**
   전제가 뒤집혔으므로 LINKED/NEEDS_LINK 같은 "연결 상태" 축이 여전히 맞는가?
   사용자가 원하는 축은 "어디 파트인가 / 누가 담당인가"다. 두 축을 어떻게 다룰 것인가 —
   합칠 것인가, 하나를 버릴 것인가, 둘 다 낼 것인가?

2. **"어디 파트"를 무엇으로 판정할 것인가.**
   registry 의 FT 가 유일한 후보인가? FE/BE 같은 더 거친 축이 필요한가?
   경로가 없는 이슈가 대부분인데 그때 무엇으로 파트를 정하는가?

3. **"담당자"를 어디서 읽을 것인가.**
   FT 의 owner 는 기능 담당이고 결함 수정 담당이 아니다.
   사용자는 "프론트는 전부 나"라고 선언했다. 이 선언을 어디에 두어야 하는가 —
   registry? 별도 파일? 봇 코드? 각각의 대가는?

4. **코멘트 템플릿에 더 필요한 항목이 있는가.**
   사용자 안은 "파트 / 담당자 / 근거" 셋이다. 빠진 것이 있는가?
   있다면 왜 필요한지 근거를 대라. 없어도 되는 것을 넣으면 매 이슈마다 노이즈가 된다.

5. **ID 부여를 봇이 할 것인가.**
   사용자는 "봇이 아이디를 생성해서 정합본을 만들고 Atlas 에도 업데이트" 라고 했다가
   그다음 발화에서 "PR 을 만드는 게 아니고 코멘트만" 으로 좁혔다.
   registry 를 안 고치면서 ID 를 부여하는 것이 가능한가?
   코멘트에 "BC-CHK-10 을 제안합니다" 라고 쓰면 그 번호는 누가 예약하는가?
   두 이슈가 동시에 열리면 같은 번호를 제안하지 않는가?

6. **현행 구현 중 버릴 것과 살릴 것.**
   fingerprint 기반 정정, 작성자 확인, concurrency, 토큰 스키마 —
   전제가 바뀌어도 유효한 것은 무엇인가?

## 출력
1) 사실 오류
2) 판정 1~6 각각 결론 + 한 줄 근거
3) **코멘트 템플릿 확정안** — 실제 문구로. 이슈에 경로가 있는 경우와 없는 경우 각각
4) 봇이 하지 말아야 할 것
5) 놓친 것
간결하게. 근거 없는 문장을 쓰지 마라.

```

## Final response

```text
## 1) 사실 오류

- “registry 경로 29개 중 17개가 다기능”은 현행 `triage_issue.py`의 `load_registry()` 기준으로 틀립니다. 실제 `path_owners`는 **40개 경로 중 19개 다기능**입니다. `RoomController.java → 7개 FT`는 맞습니다.
- `atlas-triage.yml`의 “gh 실패도 exit 0” 설명은 현행 `triage_issue.py`와 다릅니다. 스크립트는 gh 실패 시 **exit 1**이며, 이벤트 실행 경로는 이를 성공으로 흘리지 않습니다.
- 31건 중 5건이 `issue`를 가진 것은 맞고, severity는 P1/P2/P3만, `UNDECIDED`는 disposition에만 존재합니다.

## 2) 판정

1. **5종 판정은 triage 코멘트에서 폐기한다.**  
   LINKED류는 “registry가 먼저”일 때의 연결 상태라서, 이슈 우선 흐름의 배정 답변과 축이 다르다. 기존 5개 투영분의 SYN-01~03 감사에만 한정해 유지한다.

2. **파트는 FE/BE를 1차 축으로, FT는 보조 근거로 쓴다.**  
   `frontend/`·`backend/` 경로 또는 명시적 영역 라벨/폼 값이 있어야 판정한다. FT는 한 경로가 여러 기능에 걸릴 수 있으므로 단독 배정 근거가 아니다.

3. **담당자는 별도 routing 설정에서 읽는다.**  
   예: `.project-atlas/triage-routing.yaml`의 `frontend/** → @Woo-JongHo`. FT의 `owner`는 기능 담당일 뿐 결함 수정 담당이 아니며, 코드 하드코딩은 담당 변경마다 봇 배포 변경을 요구한다.

4. **템플릿에는 조건부 `확인 필요`만 추가한다.**  
   근거 없이 파트·담당자를 특정할 수 없는 이슈를 되돌릴 최소 정보다. severity, disposition, 중복 판정, FT 목록은 이 역할의 코멘트에는 노이즈다.

5. **이 봇은 BC ID를 부여하지 않는다.**  
   registry를 쓰지 않는 코멘트는 번호를 예약할 원자적 정본이 아니다. 현재 workflow의 concurrency도 이슈별 직렬화라 두 이슈가 같은 “다음 번호”를 제안할 수 있다. 즉시 식별자는 GitHub `#이슈번호`로 충분하다.

6. **살릴 것: fingerprint·작성자 확인·이슈별 concurrency·버전 토큰. 버릴 것: LINKED 판정, 마커/제목 ID 유도, 자동 투영, PR 안내.**  
   전자는 봇 자신의 코멘트를 안전하게 갱신하는 장치이고, 후자는 registry 우선·PR 생성 역할에 결박돼 있다.

## 3) 코멘트 템플릿 확정안

경로가 있는 경우:

```md
## 분류·배정 제안

- 파트: 프론트엔드
- 담당자: @Woo-JongHo
- 근거: 이슈에 `frontend/src/features/rooms/...` 경로가 명시되어 있으며, routing 규칙 `frontend/** → @Woo-JongHo`와 일치합니다.
```

경로가 없는 경우:

```md
## 분류·배정 제안

- 파트: 미분류
- 담당자: 미배정
- 근거: 이슈 제목·본문에 소스 경로와 명시적 영역 정보가 없어 파트 및 담당자를 근거 있게 특정할 수 없습니다.
- 확인 필요: `frontend` 또는 `backend` 영역을 이슈에 추가해 주세요.
```

경로가 FE와 BE에 동시에 걸리거나 routing 규칙이 둘 이상 맞으면, 하나를 임의 선택하지 않고 `파트: 복수/확인 필요`, `담당자: 미배정`으로 낸다.

## 4) 봇이 하지 말아야 할 것

- registry, 이슈 제목·본문, GitHub assignee·label을 수정하지 말 것.
- `[BC-ID]` 제목 접두사나 `atlas-defect` 마커를 새 이슈에 요구·삽입하지 말 것.
- FT `owner`를 결함 수정 담당자로 표현하지 말 것.
- 경로·영역 정보 없는 제목을 의미 추정으로 FE/BE에 배정하지 말 것.
- severity, disposition, 중복 여부, “결함 아님”을 판정하지 말 것.
- BC ID를 “제안”하거나 예약된 것처럼 쓰지 말 것.
- PR 생성·종료·`closes #…` 안내를 하지 말 것.

## 5) 놓친 것

- 새 이슈를 나중에 Atlas 결함으로 채택할 경우의 **별도 등록 절차**가 필요합니다. 그 절차의 권한자가 registry에 BC ID와 GitHub issue 번호를 한 트랜잭션으로 기록해야 합니다.
- routing 설정에는 최소한 `경로/라벨 조건 → 파트 → 결함 수정 담당자`와 fallback `미분류/미배정`이 필요합니다. 백엔드 담당은 현재 FT owner만으로는 근거 있게 채울 수 없습니다.
- 토큰에는 정본 데이터가 아니라 `routingVersion`, `part`, `assignee`, `basis`, `fingerprint`만 넣어야 합니다. 이는 코멘트 갱신용 상태이지 registry 대체물이 아닙니다.
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
