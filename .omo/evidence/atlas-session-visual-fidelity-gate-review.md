# Atlas Session Visual Fidelity Gate Review

- recommendation: REJECT
- visualVerdict: REVISE
- confidence: HIGH
- reviewType: VISUAL FIDELITY AND CJK PRECISION (read-only)
- goalId: atlas-session-visual-fidelity
- attemptDir: unavailable (`omo ulw-loop status --json` returned `ULW_LOOP_PLAN_MISSING`)
- reportPath: `.omo/evidence/atlas-session-visual-fidelity-gate-review.md`

## Original Intent

최신 post-fix Atlas 세션 화면이 기존 Atlas의 조밀한 계측기 문법을 유지하면서 280px 입력 레일과 상세를 명료하게 연결하고, Light/Terminal 의미 대비, CJK 줄바꿈, 역할 라벨, prelude disclosure를 정확히 표현해야 한다. 의도된 1180px 데스크톱 최소 폭은 결함으로 간주하지 않되 세션 표면 내부 클리핑은 없어야 하며, 내부 스크롤은 상세만 소유해야 한다.

## Desired Outcome

선택된 레일 항목과 동일 대화 상세가 시각적으로 이어지고, prelude 8개 레코드가 접힘/펼침 모두에서 읽히며, 역할은 색 이외의 라벨·보더로도 식별되고, 한국어 글리프나 줄이 잘리지 않아야 한다. 레일과 개별 payload는 별도 스크롤 컨테이너를 만들지 않고 `.atlas-session-detail` 하나만 세션 내부 스크롤을 소유해야 한다.

## User Outcome Review

두 최신 1440×900 Light 캡처는 완전 합성된 유효 PNG이며 마지막 TSX/CSS 수정 뒤에 생성됐다. 선택된 `003` 항목은 accent inset과 raised fill로 강조되고 오른쪽 `CONVERSATION 003`과 같은 시각적 맥락을 유지한다. 레일은 페이지 흐름 안에서 계속 내려가며 자체 스크롤바가 없고, 상세만 화면 높이에 맞춰 sticky/scroll된다. 접힌 prelude는 상세 위의 독립된 disclosure로 읽히고, 펼친 상태에서 SYSTEM/META 8개 레코드가 역할 라벨과 좌측 보더를 유지한다. 보이는 한국어/CJK에는 글리프, 베이스라인, 조사 단독행, 카드 내부 잘림이 없다. 화면 하단에서 일부 항목이 끊겨 보이는 것은 상세 viewport 경계이며 상세 스크롤로 접근 가능하므로 clipping이 아니다.

그러나 장문 entry disclosure를 펼치면 `<pre>`가 `max-height: 440px`와 `overflow: auto`를 가져 `.atlas-session-detail` 안에 두 번째 스크롤 컨테이너를 만든다. 최신 캡처에서는 해당 payload disclosure가 닫혀 있어 중첩 스크롤바가 드러나지 않지만, production CSS가 조건을 결정적으로 증명한다. 사용자가 명시한 “only detail owns internal scroll”을 위반하므로 수정이 필요하다.

## Recommendation

REJECT (visual verdict: REVISE)

## Blockers

1. violatedCriterion: `VF-SCROLL-ONLY-DETAIL`
   - observation: 펼친 장문 payload의 `<pre>`가 별도 세로 스크롤을 소유해 상세 내부에 중첩 스크롤을 만든다.
   - evidencePointer: `frontend/src/features/project-atlas/atlas-session.css:320-327` (`max-height: 440px; overflow: auto`), `frontend/src/features/project-atlas/components/AtlasSessionPanel.tsx:47-50`, `DESIGN.md:81`, 사용자 기준 “whether only detail owns internal scroll”.
   - requiredResolution: `<pre>`의 세로 스크롤 소유권을 제거해 내용이 `.atlas-session-detail`의 단일 스크롤에 참여하게 하고, 장문 disclosure 열린 fresh capture로 중첩 스크롤이 없음을 재검증한다. 가로 overflow가 반드시 필요하다면 세로축과 분리해 명시적으로 검증한다.

## Findings

- [product] [scroll ownership] [blocking] 위 `VF-SCROLL-ONLY-DETAIL` 위반.
- [product] [spacing/alignment] [pass] 280px 레일, 14px 상세 inset, 8–13px entry 간격이 `DESIGN.md`의 compact spacing과 인접 Atlas의 hard-edge panel 문법에 맞는다.
- [product] [rail/detail focus] [pass] 선택 `003`은 텍스트 번호, accent 좌측 inset, raised 배경의 비색상/색상 단서를 함께 가지며 상세 제목도 `CONVERSATION 003`이다.
- [product] [prelude] [pass] `SESSION PRELUDE / 08 RECORDS`와 `BEFORE FIRST INPUT / FULL COVERAGE`가 접힌 상태에서 목적을 설명하고, 펼친 상태에서는 8개 SYSTEM/META 레코드가 잘림 없이 순서대로 노출된다.
- [product] [CJK] [pass] 레일의 한국어 혼합 문장과 상세의 한국어 tool text에서 글리프 클리핑, 비정상 자간, 고립 조사, 의미를 해치는 줄바꿈이 관찰되지 않는다. 레일의 3줄 clamp/ellipsis는 의도된 preview 축약이다.
- [product] [roles] [pass] INPUT/META/THINKING/TOOL/SYSTEM 텍스트 라벨, 3px 좌측 role border, 5px square marker가 색 외 단서를 제공한다.
- [product] [theme contrast] [pass] Light는 흰/회색 구조에 blue input/tool, amber thinking, gray system/meta를 쓰고 Terminal 인접 캡처는 같은 구조를 green/cyan/yellow semantic slots로 전환한다. Light의 INPUT과 TOOL 색은 근접하지만 라벨·보더·marker가 의미를 보완해 `DESIGN.md:38-40`을 충족한다.
- [product] [clipping] [pass] 세션 표면 내부의 고정 clip은 관찰되지 않는다. 펼친 prelude 캡처 하단의 부분 항목은 상세 스크롤 viewport 경계이며 접근 가능한 overflow다.
- [evidence] [freshness] [pass] 지정 PNG 둘은 2026-08-10 12:46:32 KST, TSX는 12:45:13, CSS는 12:46:16에 수정됐다.
- [evidence] [terminal freshness] [note] Terminal 비교 캡처는 12:42:30으로 마지막 scroll fix 이전이다. 색/구조 비교 참고에는 사용했으나 post-fix Terminal 스크롤 증거로는 사용하지 않았다; 현재 semantic mapping은 `atlas-base.css`와 `atlas-session.css`에서 직접 확인했다.

## Direct Programming / Remove-AI-Slops Pass

- 실제 React/DOM disclosure와 native buttons를 사용하며 raster/mock 대체가 없다.
- 요청 파일에서 `TODO`, `FIXME`, `test.skip`/`.only`, `console.log`, `as any`, `@ts-ignore`, `@ts-expect-error`를 찾지 못했다.
- 삭제만 검증하는 테스트, 요청 제거를 문구로 고정하는 테스트, tautological/implementation-mirroring 테스트는 없다. 관련 신규 테스트 자체가 없다.
- `compactText`는 rail preview와 disclosure summary 두 관찰 가능한 표면에 재사용되어 불필요한 단일-use 추출이 아니다.
- NOTE: `atlas-session.css`는 299 pure LOC로 remove-ai-slops의 250 LOC 유지보수 기준을 넘지만, 이는 이번 시각 성공 기준 실패가 아니므로 비차단이다.
- NOTE: `--atlas-role-*`는 `atlas-base.css`에 추가됐으나 session CSS는 직접 `--map-*`를 사용한다. dead configuration 가능성이 있으나 시각 기준 위반이 아니므로 비차단이다.
- 중첩 `<pre>` overflow는 불필요한 production normalization 문제가 아니라 명시된 스크롤 소유권의 실제 위반으로 blocker에 포함했다.

## Code Review Coverage Check

기존 `.omo/evidence/project-atlas-claude-session-gate-review.md`와 이전 이 보고서는 programming/remove-ai-slops 및 overfit 항목을 명시적으로 다뤘다. 다만 둘 다 마지막 scroll fix 이전 artifact를 판정했으므로 최신 승인 증거로 재사용하지 않았다. 이번 직접 패스가 최신 TSX/CSS와 두 지정 캡처를 기준으로 같은 관점을 다시 적용했다.

## Checked Artifact Paths

- `/Users/jonghoPro/woo/00_project/08_BangCheck/DESIGN.md`
- `/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/project-atlas/components/AtlasSessionPanel.tsx`
- `/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/project-atlas/atlas-session.css`
- `/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/project-atlas/atlas-base.css`
- `/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/project-atlas/components/AtlasCardRail.tsx`
- `/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/project-atlas/components/AtlasEventPanel.tsx`
- `/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/project-atlas/components/AtlasPagePanel.tsx`
- `/Users/jonghoPro/woo/00_project/08_BangCheck/.omo/evidence/project-atlas-claude-session-gate-review.md`
- `/Users/jonghoPro/Documents/Codex/2026-08-10/new-chat/work/atlas-qa/desktop-session-scroll-final.png`
- `/Users/jonghoPro/Documents/Codex/2026-08-10/new-chat/work/atlas-qa/desktop-session-scroll-prelude-open-final.png`
- `/Users/jonghoPro/Documents/Codex/2026-08-10/new-chat/work/atlas-qa/desktop-session-terminal-final.png` (neighbor/theme reference only; stale for post-fix scroll)

## Evidence Trace

- `desktop-session-scroll-final.png`: PNG RGB 1440×900; SHA-256 `53000132b2d3771b52dbf1bae53ccd713cfde45c1ffb2f3aad23d675bc1833e5`.
- `desktop-session-scroll-prelude-open-final.png`: PNG RGB 1440×900; SHA-256 `73d7131e38dcfd5d657e9db0bac9ecd00710b80c2b5e3b6c756c54efed18e516`.
- 두 캡처 모두 전체 합성 상태이며 검은/누락 영역이나 잘못된 alpha가 없다.
- Source trace: rail `overflow: visible` at `atlas-session.css:179`; single detail owner intended at `:229-238`; nested payload owner at `:320-327`; role labels at `AtlasSessionPanel.tsx:6-13, 38-50`; prelude at `:78-93`; rail/detail binding at `:151-176`.

## Exact Evidence Gaps

- 장문 entry 자체의 disclosure가 열린 post-fix 캡처가 없다. 현재 prelude-open 캡처는 prelude container만 열고 내부 payload disclosures는 닫혀 있다.
- 마지막 CSS 수정 후 Terminal 캡처가 없다. 최신 Terminal의 semantic 색은 소스에서 확인했지만 post-fix Terminal 렌더를 직접 증명하지는 못한다.
- fresh code-review report, manual QA matrix, notepad path가 제공되거나 발견되지 않았다. 기존 report는 pre-fix이며, 최신 직접 패스로 커버리지를 보완했다.
- DOM/Playwright 스크롤 메트릭 artifact가 없다. 최신 static capture와 CSS ownership trace를 결합해 판정했다.
