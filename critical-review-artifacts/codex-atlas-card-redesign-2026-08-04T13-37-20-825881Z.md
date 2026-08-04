# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-sol
- Reasoning effort: medium
- Target dir: /Users/woojongho/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/woojongho/.local/bin/codex
- Started at (UTC): 2026-08-04T13:28:04.567817+00:00
- Finished at (UTC): 2026-08-04T13:37:20.825000+00:00

## Original task / label

atlas-card-redesign

## Final prompt

```text
너는 이 변경을 통과시키는 사람이 아니라 **반박하는 사람**이다. REVISE 관점으로 봐라.
결함·충돌·누락·비측정성·거짓 표시를 찾아라. 좋은 점 나열은 필요 없다.

## 대상

저장소: BangCheck (Vite + React 19 프론트 / Spring Boot 백엔드). 브랜치 atlas/baseline.
리뷰 범위는 **HEAD(커밋 4b09110)로부터의 변경분 + 아래 미추적 신규 파일**이다.
`git diff HEAD` 로 변경분을 보고, 미추적 파일은 직접 읽어라. 저장소 전체를 리뷰하지 마라.

변경된 파일:
  .project-atlas/schema.yaml
  .project-atlas/tools/pagemap.py
  frontend/package.json
  frontend/src/features/project-atlas/atlas-detail.css
  frontend/src/features/project-atlas/components/AtlasCardDetail.tsx
  frontend/src/features/research/ResearchPage.tsx
  frontend/src/features/research/research.css

신규(미추적) 파일:
  .project-atlas/tools/pm_snapshot.py
  frontend/src/features/research/atlas-snapshot.json   (생성물)
  frontend/src/features/research/atlas-snapshot.ts
  frontend/src/features/research/use-map-viewport.ts
  frontend/src/features/research/components/FeatureDashboard.tsx
  frontend/src/features/research/components/PageBriefBody.tsx
  frontend/src/features/project-atlas/components/AtlasCardFlow.tsx
  frontend/src/features/project-atlas/components/AtlasCodeRef.tsx
  frontend/src/types/atlas-snapshot.ts
  docs/qa/2026-7월-5째주/QA_이슈.md

## 이게 무엇이고 무엇을 보장해야 하는가

`/project-map`(DEV 전용)은 제품의 페이지 지도다. 노드를 누르면 큰 카드가 뜨고,
그 카드가 PM에게 "이 페이지가 어디까지 왔나"를 답한다.
`/project-map/:pageId`는 실제 화면을 iframe으로 띄우고 기능 카드를 얹는 상세 캔버스다.

이 저장소가 스스로에게 건 불변식(코드 주석과 .project-atlas/schema.yaml에 적혀 있다):

1. **없는 것을 있는 척하지 않는다.** 비어 있으면 화면이 비었다고 말해야 한다.
   빈 칸은 "확인 안 함"과 구별되지 않으므로, 근거 없는 값을 채우면 그 화면을 근거로
   잘못된 판단이 나온다.
2. **같은 사실을 두 곳에 적지 않는다.** 적는 순간 갈라진다.
3. **registry의 status/switchedOver는 "개발 여부"가 아니다.** slice 이관 여부다.
   19개 feature가 전부 PLANNED인데 대부분 동작하는 코드다.
4. **결함 생애주기에서 사람이 적는 값은 이슈 번호 하나뿐**이고 나머지는 파생이어야 한다.
   추론으로 상태를 만들면 안 된다.
5. **카드(모달) 안의 Y 스크롤 컨테이너는 정확히 하나여야 한다.** 사용자가 명시적으로 요구했다.
6. `.project-atlas/`는 AD-12에 따라 별도 저장소로 분리될 예정이다. 그래서 프론트는 registry를
   직접 읽지 않고 생성된 스냅샷 JSON 하나만 읽는다.

## 이미 알고 있는 것 (여기를 반복 지적하지 말고, 이것들이 놓친 곳을 파라)

- `custom-cards.ts`의 operationId 8개가 `OP-*` 체계를 쓰지 않는다(`checklist.addCustomItem` 등).
  registry route와 1:1 대응은 확인됐으나 의도적으로 고치지 않고 화면에 경고로 노출했다.
- registry 19개 feature의 tests가 전부 비어 있어 모든 페이지가 "테스트 없음"으로 나온다. 사실이다.
- 결함 lifecycle이 현재 전부 OBSERVED다. 이슈 번호 원천이 없어서이며 의도된 것이다.
- `.project-atlas/tools/__pycache__/*.pyc`가 git에 추적되고 있다(이 변경 이전부터).
- tsc와 eslint는 통과한다. 타입 오류·린트 오류를 찾는 건 목적이 아니다.

## 특히 의심해서 봐야 할 것

- **pm_snapshot.py의 판정 로직이 거짓말을 하는가.** `exists()`가 파일 존재만 보고 "구현됨"이라
  단정하는데 이게 타당한가. `strip_symbol`이 경로를 자르는 방식에 함정이 없는가
  (예: Windows 경로, 콜론이 든 경로, `#` 없는 심볼).
  `layer_state`가 P1 결함만 반영하는 규칙이 front/back 양쪽에 같은 defects 배열을 쓰는데,
  프론트 결함과 백엔드 결함이 구분되지 않는 문제가 아닌가.
- **결함이 여러 기능에 걸릴 때** dedupe와 집계(rollupPage의 defectCount)가 이중 계상하는가.
- **pagemap.py에서 build()를 추출한 리팩터**가 기존 동작을 바꾸지 않았는가.
- **use-map-viewport.ts**: 휠 줌 앵커 계산, 드래그 임계값, window 리스너 해제 누락,
  포인터 캡처를 안 쓴 선택의 부작용, fitToScreen이 useEffect 의존성으로 매번 재실행되는지,
  캔버스 크기 0일 때, 리사이즈 시 동작.
- **모달의 Y 스크롤이 정말 하나인가.** research.css와 atlas-detail.css 양쪽에서
  overflow 관련 선언을 전부 훑어라. sticky 요소가 스크롤 컨테이너를 만들지 않는지도.
- **접근성**: 모달 포커스 트랩이 있는가(없으면 Tab이 뒤 화면으로 샌다), aria 속성이 정확한가,
  아코디언 키보드 조작, 스크림 클릭과 드래그 종료의 구분.
- **CSS**: 정의되지 않은 CSS 변수를 참조하는 선언이 또 있는가(이번에 `--accent-border` 등
  4개가 미정의라 버튼이 안 보이던 버그를 고쳤다. 같은 종류가 남아 있는지 grep해봐라).
  6개 테마(.project-map-shell 오버라이드)에서 새 UI가 읽히지 않는 곳이 있는가.
- **schema.yaml에 추가한 issue 필드**가 기존 resolver(.project-atlas/tools/resolve.py)와
  충돌하지 않는가.
- **docs/qa/2026-7월-5째주/QA_이슈.md**의 주장이 근거와 맞는가. 특히 "재발"과 "사양 반전"
  판정이 docs/qa/2026-5월-4째주/의 실제 내용으로 뒷받침되는가. 과장하거나 단정한 곳이 있는가.

## 출력 형식

발견마다 다음을 적어라:
  - 파일:줄
  - 무엇이 잘못됐는가 (한 문장)
  - 어떤 입력·상태에서 실제로 깨지는가 (구체적으로)
  - MAJOR / MINOR
확신이 없으면 "확인 못 함"이라고 적고 무엇을 확인해야 하는지 써라. 추측을 사실처럼 쓰지 마라.

```

## Final response

```text
REVISE 판정입니다. MAJOR 9건, MINOR 5건입니다.

1. **파일: [frontend/package.json:8](/Users/woojongho/woo/00_project/08_BangCheck/frontend/package.json:8)**
   - 무엇이 잘못됐는가: `build`가 스냅샷 재생성이나 최신 여부 검사를 하지 않아 생성물과 registry/code가 조용히 갈라진다.
   - 실제로 깨지는 상태: registry의 결함·route·owner를 바꾼 뒤 `npm run build`만 실행하면 예전 `atlas-snapshot.json`이 그대로 번들되어 PM 화면이 낡은 사실을 표시한다.
   - **MAJOR**

2. **파일: [frontend/package.json:9](/Users/woojongho/woo/00_project/08_BangCheck/frontend/package.json:9), [.project-atlas/tools/pm_snapshot.py:35](/Users/woojongho/woo/00_project/08_BangCheck/.project-atlas/tools/pm_snapshot.py:35)**
   - 무엇이 잘못됐는가: 새 npm 명령이 요구하는 PyYAML을 설치·고정하는 의존성 파일이 없다.
   - 실제로 깨지는 상태: 현재 저장소 환경에서 `npm run atlas:snapshot`을 실행하면 `ModuleNotFoundError: No module named 'yaml'`로 즉시 실패한다.
   - **MAJOR**

3. **파일: [.project-atlas/tools/pm_snapshot.py:109](/Users/woojongho/woo/00_project/08_BangCheck/.project-atlas/tools/pm_snapshot.py:109), [frontend/src/features/research/atlas-snapshot.ts:45](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/atlas-snapshot.ts:45)**
   - 무엇이 잘못됐는가: 결함 소속을 `defects.yaml.relatedFeature` 한 개로만 만들고 feature의 `knownDefects`를 무시하여 여러 기능에 걸린 결함을 누락하며, 반대로 이를 바로잡으면 rollup은 ID dedupe 없이 이중 계상한다.
   - 실제로 깨지는 상태: `FT-ROOM-UPDATE`는 `BC-REG-02/03/04`를 `knownDefects`로 갖지만 `/checklist/:id` 스냅샷의 해당 기능은 `defects: []`이다. 여러 관련 기능이 같은 페이지에 놓이면 헤더는 같은 결함을 여러 번 세지만 본문은 [PageBriefBody.tsx:54](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/components/PageBriefBody.tsx:54)에서 한 번만 보여 숫자도 갈라진다.
   - **MAJOR**

4. **파일: [.project-atlas/tools/pm_snapshot.py:121](/Users/woojongho/woo/00_project/08_BangCheck/.project-atlas/tools/pm_snapshot.py:121)**
   - 무엇이 잘못됐는가: 기능의 동일한 P1 배열을 FRONT와 BACK 양쪽 상태에 적용하여 결함 발생 레이어를 거짓 표시한다.
   - 실제로 깨지는 상태: `/checklist/new`의 `BC-SEC-01`, `BC-REG-04`는 evidence가 모두 백엔드인데 생성물 [atlas-snapshot.json:554](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/atlas-snapshot.json:554)에서 FRONT와 BACK이 모두 `defect`가 된다.
   - **MAJOR**

5. **파일: [.project-atlas/tools/pm_snapshot.py:51](/Users/woojongho/woo/00_project/08_BangCheck/.project-atlas/tools/pm_snapshot.py:51), [FeatureDashboard.tsx:10](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/components/FeatureDashboard.tsx:10)**
   - 무엇이 잘못됐는가: 파일 존재만으로 레이어를 `구현됨`이라고 단정한다.
   - 실제로 깨지는 상태: registry 경로가 빈 클래스, 미사용 legacy 파일, 삭제된 심볼이 주석에만 남은 파일을 가리켜도 초록색 `구현됨`이 된다. 호출 가능성만 정적으로 수집했는데 [PageBriefBody.tsx:279](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/components/PageBriefBody.tsx:279)는 더 나아가 “코드가 도는 것은 확인됐다”고 주장한다.
   - **MAJOR**

6. **파일: [FeatureDashboard.tsx:28](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/components/FeatureDashboard.tsx:28)**
   - 무엇이 잘못됐는가: 관측된 API 호출이 없다는 사실을 “기능이 아직 붙지 않았다”로 추론한다.
   - 실제로 깨지는 상태: `/`와 `/login-error`처럼 정적 렌더나 CLIENT 기능으로 동작하지만 API 호출이 없는 페이지를 열면 “화면만 있고 기능은 아직 붙지 않았다”고 거짓 안내한다.
   - **MAJOR**

7. **파일: [.project-atlas/schema.yaml:105](/Users/woojongho/woo/00_project/08_BangCheck/.project-atlas/schema.yaml:105), [.project-atlas/tools/resolve.py:260](/Users/woojongho/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:260)**
   - 무엇이 잘못됐는가: `issue`를 integer로 선언했지만 resolver가 타입이나 양수 여부를 전혀 검증하지 않는다.
   - 실제로 깨지는 상태: `issue: true`, `issue: "ABC"`, `issue: -1`도 resolver를 통과하고 `TRACKED`가 되며, `issue: 0`은 integer인데도 truthiness 판정 때문에 `OBSERVED/이슈 미등록`으로 표시된다.
   - **MAJOR**

8. **파일: [ResearchPage.tsx:294](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/ResearchPage.tsx:294), [AtlasCardDetail.tsx:56](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/project-atlas/components/AtlasCardDetail.tsx:56)**
   - 무엇이 잘못됐는가: 두 모달 모두 `aria-modal="true"`를 선언하면서 포커스 트랩·배경 inert 처리·닫힌 뒤 포커스 복원을 구현하지 않았다.
   - 실제로 깨지는 상태: Research 모달은 열려도 포커스가 뒤의 노드에 남아 Tab이 배경 노드들을 순회한다. Atlas 모달은 처음에만 모달로 포커스를 옮기고 마지막 컨트롤 다음 Tab부터 뒤 화면으로 빠지며, 닫으면 원래 카드로 돌아오지 않는다.
   - **MAJOR**

9. **파일: [frontend/src/features/research/research.css:1877](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/research.css:1877)**
   - 무엇이 잘못됐는가: 테마 공통 오버라이드가 P1/P2/P3와 defect/danger 전용 색을 더 높은 우선순위로 덮어 위험도 시각 구분을 제거한다.
   - 실제로 깨지는 상태: 여섯 테마 모두에서 `.feature-layer.is-defect`, `.feature-chip.is-danger`, `.brief-severity.is-P1` 및 결함 카드의 severity별 왼쪽 테두리가 일반 muted 색으로 덮인다. `/checklist/new`의 P1도 일반 칩과 거의 같은 모양이 된다.
   - **MAJOR**

10. **파일: [use-map-viewport.ts:69](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/use-map-viewport.ts:69)**
    - 무엇이 잘못됐는가: `fitToScreen`은 좁은 화면에서 실제로 전체를 맞추지 못하고, 뷰포트 리사이즈에도 재실행되지 않는다.
    - 실제로 깨지는 상태: 폭 375px에서는 필요한 배율이 약 0.24지만 `MIN_ZOOM=0.3`으로 clamp되어 1480px 캔버스가 444px가 되고 양쪽이 잘린다. 데스크톱 창 크기를 바꿔도 effect 의존성은 상수인 캔버스 크기뿐이라 기존 위치·배율이 유지된다.
    - **MINOR**

11. **파일: [use-map-viewport.ts:125](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/use-map-viewport.ts:125)**
    - 무엇이 잘못됐는가: 포인터 이동 리스너는 `pointerup/cancel`에서만 해제되고 컴포넌트 unmount 정리가 없다.
    - 실제로 깨지는 상태: 드래그 중 탭 전환·라우트 이동으로 `/project-map`이 unmount되거나 브라우저 밖에서 버튼을 놓아 `pointerup`을 받지 못하면 window 리스너와 `isPanning` 상태가 남는다.
    - **MINOR**

12. **파일: [ResearchPage.tsx:294](/Users/woojongho/woo/00_project/08_BangCheck/frontend/src/features/research/ResearchPage.tsx:294)**
    - 무엇이 잘못됐는가: 스크림 닫기를 `click`의 최종 target만으로 판정하여 내용에서 시작한 드래그와 스크림 클릭을 구별하지 못한다.
    - 실제로 깨지는 상태: 모달 내용에서 텍스트 선택이나 드래그를 시작하고 포인터를 스크림에서 놓으면 down/up의 공통 click target이 스크림이 되어 모달이 닫힌다.
    - **MINOR**

13. **파일: [docs/qa/2026-7월-5째주/QA_이슈.md:20](/Users/woojongho/woo/00_project/08_BangCheck/docs/qa/2026-7월-5째주/QA_이슈.md:20)**
    - 무엇이 잘못됐는가: 방카드 위치 아이콘을 “재발”로 집계하지만 과거 기록은 확인 ❌이고 현재 문서도 이를 결함이 아닌 기능 요청이라고 규정한다.
    - 실제로 깨지는 상태: 과거 기능이 실제 배포·검증된 적이 없으므로 현재 미노출은 회귀인지 최초 미반영인지 판정할 수 없는데, 문서 머리의 “재발 2”와 “절반은 처음이 아니다” 수치에 재발로 포함된다.
    - **MINOR**

14. **파일: [docs/qa/2026-7월-5째주/QA_이슈.md:23](/Users/woojongho/woo/00_project/08_BangCheck/docs/qa/2026-7월-5째주/QA_이슈.md:23)**
    - 무엇이 잘못됐는가: “3회차”, “같은 증상이 세 번 보고됐고 두 번 고쳤다”는 회차 계산의 근거가 문서 안에서 식별되지 않는다.
    - 실제로 깨지는 상태: 로컬 근거로는 5월 QA와 7월 보고, 수정 커밋 `#180` 및 `#209`는 확인되지만, 본문이 인용한 `#207/#208`이 별도 재현 회차인지 중복 이슈인지 확인되지 않는다.
    - **MINOR — 확인 못 함:** GitHub의 #207·#208 원문과 생성 시각, 각각의 재현 입력, #209와의 연결 관계를 확인해야 “3회차”를 확정할 수 있다.
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
