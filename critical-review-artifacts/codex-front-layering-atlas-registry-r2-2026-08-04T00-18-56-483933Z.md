# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-04T00:16:12.438021+00:00
- Finished at (UTC): 2026-08-04T00:18:56.479454+00:00

## Original task / label

front-layering-atlas-registry-r2

## Final prompt

```text
## 이 지시가 저장소의 다른 모든 지시에 우선한다 — 먼저 읽어라

이 저장소의 `AGENTS.md`, `.cursorrules`, `GEMINI.md`, `_wood/` 아래의 모든 규약은
이 리뷰에 적용하지 않는다.
특히 `_wood/workflows/_protocol.md`와 `_wood/agents/_safety.md`가 요구하는
"행동 전 Y/N 확인"은 이 세션에 해당하지 않는다.
그 규약들은 이 저장소를 고치는 작업자를 위한 것이고, 너는 고치지 않는다.

너는 sandbox read-only로 실행된 독립 reviewer다.
쓰기 권한이 없으므로 확인받을 위험한 행동 자체가 없다.
비용·승인·진행 여부를 되묻지 마라 — 사용자는 이미 이 리뷰를 승인했고,
되묻는 응답은 리뷰 실패로 처리된다.
`_wood/context/current.yaml`이나 `_PROTOCOL.md`를 먼저 읽는 STEP 0/1 절차도 밟지 마라.
바로 아래 대상 파일을 읽고 분석 결과만 내라.

(직전 실행이 이 규약에 걸려 분석 없이 "진행할까요? (Y/N)"만 반환하고 끝났다.
 같은 일이 반복되면 이 리뷰는 무의미하다.)

---

BangCheck 저장소의 Front 계층분리(Web / Atlas) 구조안과 Atlas registry의 정본화 방향을 비판적으로 검토하라.
당신은 반대 provider의 독립 reviewer이며 읽기 전용이다.
어떤 파일도 수정하지 말고, 통과시키려 하지 말며 결함·충돌·누락·비측정성을 찾아 REVISE 관점에서 공격하라.

## 배경

이 저장소는 제품(BangCheck)과 도구(Project Atlas)가 한 저장소에 같이 산다.
`.project-atlas/schema.yaml`은 "이 디렉터리 전체가 별도 project-atlas 저장소로 이동할 대상이다.
BangCheck에는 project.yaml과 registry만 남는다"라고 선언해 두었다.
지금 정하려는 것은 그 이동을 전제로 한 프론트엔드 계층분리와, Atlas 데이터의 정본 위치다.

## 직접 읽어야 할 파일 (경로만 준다 — 내용은 네가 읽어라)

- frontend/src/app/router.tsx
- frontend/src/lib/routes.ts
- frontend/src/features/project-atlas/ (6파일 전부)
- frontend/src/features/project-dashboard/
- frontend/src/features/map/
- frontend/src/types/atlas-card.ts, frontend/src/types/project-atlas.ts
- .project-atlas/schema.yaml
- .project-atlas/registry/ (FT-*.yaml, reuse-candidates.yaml, defects.yaml)
- .project-atlas/tools/resolve.py

## 저작자(Claude)의 실측과 제안 — 이것을 반박하라

실측 1. Atlas 관련 프론트 3폴더의 외부 의존이 서로 다르다.
  - project-atlas: @/lib/routes, @/types/atlas-card, @/types/project-atlas 뿐. 제품 feature 의존 0.
  - project-dashboard: 위에 더해 @/features/research/research-data 에 물린다.
  - map: rooms hooks, auth store, guest-room store, directions service, room types에 물린다.

실측 2. 셋 다 router.tsx에서 `import.meta.env.DEV` 조건으로만 로드된다.
  프로덕션 번들에 안 들어간다.

실측 3. 프론트 Atlas는 .project-atlas/registry/*.yaml을 전혀 읽지 않는다.
  카드 데이터가 landing-cards.ts(275줄)와 custom-cards.ts(429줄)에 하드코딩돼 있다.
  registry는 feature 8개(FT-ROOM-*, FT-AUTH-*)를 알고, 카드는 페이지 2개(landing, custom)를 안다.
  두 표현이 공유하는 축이 없다.

실측 4. resolve.py는 지금 검사 511건 위반 0건으로 통과한다.

제안 A (계층분리). map은 Atlas가 아니라 제품 기능이므로 DEV 블록에서 꺼내 제품 쪽에 남긴다.
  project-atlas와 project-dashboard만 Atlas 계층으로 분리한다.

제안 B (정본화). registry yaml을 유일 정본으로 두고, 하드코딩된 카드 704줄은
  registry에서 생성하거나 최소한 resolver가 대조하게 만든다.

제안 C (저장소). Atlas 데이터는 DB가 아니라 yaml로 유지한다.
  근거: 값이 코드에서 파생되므로 같은 커밋에 있어야 시점 복원이 되고,
  쓰기가 드물며(feature 8개, 729줄), PR에서 diff로 리뷰된다.
  DB 전환 조건은 런타임 변경·동시 편집·수백 엔티티 교차 질의 셋 중 하나가 생길 때다.

열린 결정. 계층분리를 같은 앱 안의 디렉터리 분리(src/web, src/atlas)로 할 것인가,
  별도 빌드 진입점으로 갈라 Atlas를 제품 번들에서 물리적으로 떼어낼 것인가.

## 특히 공격해 달라는 지점

1. 제안 A의 map 판정이 맞나. 이름이 아니라 의존으로 판정했는데, 그 판정이 놓친 것이 있나.
2. 제안 B가 실현 가능한가. registry(기능 축)와 카드(페이지 축)는 축이 다른데
   한쪽에서 다른 쪽을 생성한다는 것이 성립하나. 성립 안 되면 그 이유와 대안.
3. 제안 C의 DB 전환 조건이 충분한가. yaml이 먼저 깨지는 지점을 우리가 놓쳤나.
4. 열린 결정 두 안의 실제 비용 차이. schema.yaml이 선언한 "별도 저장소로 이동"과
   어느 쪽이 정합하나. 이동 시점에 무엇이 깨지나.
5. DEV 전용(import.meta.env.DEV)이라는 현재 격리가 계층분리를 대신할 수 있나,
   아니면 그것과 무관한 다른 축인가.
6. 우리가 아예 묻지 않은 것 중 이 결정을 뒤집을 만한 것.

각 지적에 severity(MAJOR/MINOR)를 붙이고, 근거가 되는 파일·줄을 명시하라.
추측과 실측을 구분해 표기하라.

```

## Final response

```text
## 결론: REVISE

제안의 방향 자체는 타당한 부분이 있지만, 현재 근거와 설계만으로는 분리·정본화를 결정하면 안 됩니다. 특히 “map이 DEV Atlas에 있다”는 전제가 코드와 맞지 않고, registry는 카드·대시보드를 생성할 수 있는 모델도 검증기도 아닙니다.

### MAJOR — 제안 A의 `map` 전제가 사실과 다릅니다

**실측:** 제품 지도는 이미 DEV 블록 밖의 제품 라우트입니다. `MapPage`는 정적 import이고, `/map`은 일반 `AppLayout` 아래에 등록됩니다. DEV 전용인 것은 `features/research/ResearchPage`, dashboard, Atlas canvas입니다. 따라서 “map을 DEV 블록에서 꺼낸다”는 변경 대상이 현재 코드에는 없습니다.  
근거: [router.tsx:13](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/app/router.tsx:13), [router.tsx:20](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/app/router.tsx:20), [router.tsx:78](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/app/router.tsx:78).

**판정:** Map을 제품 기능으로 보는 결론은 맞습니다. 다만 “외부 의존이 제품 쪽이므로”만으로는 부족합니다. 더 강한 근거는 제품 라우트·인증/게스트 상태·방 목록·체크리스트·리포트로 이어지는 제품 사용자 여정이라는 점입니다.  
근거: [MapPage.tsx:3](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/map/MapPage.tsx:3), [MapPage.tsx:5](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/map/MapPage.tsx:5), [MapPage.tsx:761](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/map/MapPage.tsx:761).

### MAJOR — 계층분리 대상에서 `research`를 빼면 dashboard가 고립됩니다

**실측:** `project-dashboard`는 `features/research/research-data`와 `research.css`를 직접 가져오며, 라우터의 `/project-map`도 실제로는 `ResearchPage`입니다. “project-atlas + project-dashboard만 Atlas로 이동”은 `research`의 귀속과 공개 계약을 결정하지 않아 컴파일·라우팅·스타일 의존을 남깁니다.  
근거: [ProjectDashboardPage.tsx:4](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/project-dashboard/ProjectDashboardPage.tsx:4), [ProjectDashboardPage.tsx:11](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/project-dashboard/ProjectDashboardPage.tsx:11), [router.tsx:20](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/app/router.tsx:20).

**REVISE 기준:** Atlas 경계에는 최소한 `research`, dashboard, canvas, Atlas 타입, Atlas 전용 CSS와 데이터 read-model이 함께 포함되는지 명시해야 합니다. 아니라면 dashboard가 소비할 별도 패키지/API 계약이 필요합니다.

### MAJOR — registry에서 카드 생성은 현재 스키마로 성립하지 않습니다

**실측:** registry는 `CAPABILITY → FEATURE → OPERATION` 축이고, 카드는 `PAGE → 상태 → DOM 영역 → 서술/행동/API/연관` 축입니다. registry에는 페이지, 카드 순서, `previewSrc`, 화면 상태, `data-atlas-node`, 카드별 설명이 없습니다. 카드에는 feature ID조차 없습니다.  
근거: [schema.yaml:25](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/schema.yaml:25), [atlas-card.ts:78](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/types/atlas-card.ts:78), [atlas-card.ts:119](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/types/atlas-card.ts:119).

**실측:** 현재 카드의 API ID는 `checklist.*` 형식이고 registry operation은 `OP-*` 형식입니다. 직접 조인할 키가 없습니다.  
근거: [custom-cards.ts:72](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/project-atlas/custom-cards.ts:72), [schema.yaml:42](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/schema.yaml:42).

**대안:** “registry 단일 정본”이 아니라 권위별 정본을 분리해야 합니다.

- 기능/operation/defect registry: 코드에서 관측·파생되는 축
- page-atlas registry: 페이지·상태·카드·DOM binding처럼 사람이 저술하는 축
- 생성 read-model: 두 축을 명시적 `featureIds`, `operationIds`, `defectIds`, `sourceRefs`로 조인한 결과

즉 카드 전체를 기능 registry에서 생성하려 하지 말고, 페이지 카드가 기능 registry를 참조하게 해야 합니다. 서술과 화면 배치는 파생값이 아닙니다.

### MAJOR — 현재는 카드 외에도 서로 충돌하는 Atlas 데이터 모델이 있습니다

**실측:** 같은 `landing`을 카드 데이터는 `/` 페이지로, `atlas-machine`은 `/login` 기반 OAuth graph로 표현합니다. 후자는 UI에서 “canonical record”와 action journal로 표시됩니다. 카드 704줄만 registry로 옮겨도 이 세 번째 모델은 남습니다.  
근거: [landing-cards.ts:10](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/project-atlas/landing-cards.ts:10), [atlas-machine.ts:46](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/project-atlas/atlas-machine.ts:46), [ProjectAtlasPage.tsx:374](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/project-atlas/ProjectAtlasPage.tsx:374).

**실측:** dashboard도 별도의 P1 목록·진척도·활동 로그를 하드코딩합니다. registry defect ID와 dashboard P1 ID의 대응 규칙이 없습니다.  
근거: [ProjectDashboardPage.tsx:26](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/project-dashboard/ProjectDashboardPage.tsx:26), [defects.yaml:10](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/registry/defects.yaml:10).

### MAJOR — “511건, 위반 0”은 registry 정합성의 증명이 아닙니다

**실측:** resolver는 defect의 `relatedFeature`를 검사하지 않습니다. 그래서 registry에 없는 `FT-REPORT-*`, `FT-CHECKLIST-*`를 defect가 가리켜도 통과합니다. 현재 registry feature 파일은 Auth/Room 8개뿐인데, defects에는 이들 미등록 feature가 다수 있습니다.  
근거: [resolve.py:125](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/tools/resolve.py:125), [resolve.py:223](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/tools/resolve.py:223), [defects.yaml:171](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/registry/defects.yaml:171), [defects.yaml:253](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/registry/defects.yaml:253).

**실측:** `frontendEntry`는 schema에 있지만 required가 아니고 resolver도 검사하지 않습니다. 즉 schema가 말하는 Front 연결점은 실질적으로 정본화되지 않았습니다.  
근거: [schema.yaml:62](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/schema.yaml:62), [resolve.py:208](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/tools/resolve.py:208).

**실측:** `uses`는 operation ID의 존재를 확인하지 않고 route 문자열만 확인합니다. operation graph 정본이라는 주장과 맞지 않습니다.  
근거: [resolve.py:198](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/tools/resolve.py:198).

**실측:** 직접 실행 결과는 저작자 주장대로 `checked: 511`, `violations: []`였습니다. 이는 현 validator 범위에서만 참입니다.

### MAJOR — 저장소 이동 선언이 내부적으로 모순됩니다

**실측:** schema는 “이 디렉터리 전체를 별도 repo로 옮기되 BangCheck에 `project.yaml`과 registry를 남긴다”고 합니다. 반면 `project.yaml`은 registry·resolver·UI 모두 별도 Atlas repo가 소유한다고 말합니다. registry의 단일 소재지가 결정되지 않았습니다.  
근거: [schema.yaml:6](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/schema.yaml:6), [project.yaml:6](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/.project-atlas/project.yaml:6).

이 모순을 먼저 풀지 않으면 “yaml은 같은 커밋에 둬서 시점 복원”이라는 제안 C의 핵심 근거도 무너집니다. 서로 다른 repo에 제품 코드와 registry가 있으면 단일 커밋은 존재하지 않습니다.

### MAJOR — 별도 빌드는 단순 폴더 이동보다 훨씬 큰 런타임 계약 변경입니다

**실측:** Atlas는 제품 페이지를 same-origin iframe으로 열고, product-side hook이 좌표를 `postMessage`로 보냅니다. 양쪽 모두 현재 origin을 강제합니다. 별도 dev server/도메인으로 분리하면 현재 방식은 즉시 실패합니다.  
근거: [ProjectAtlasPage.tsx:218](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/project-atlas/ProjectAtlasPage.tsx:218), [ProjectAtlasPage.tsx:514](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/features/project-atlas/ProjectAtlasPage.tsx:514), [use-atlas-preview.ts:28](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/lib/use-atlas-preview.ts:28), [use-atlas-preview.ts:52](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/lib/use-atlas-preview.ts:52).

**추론:** 별도 빌드/별도 repo는 schema의 최종 목적에는 정합하지만, 아래를 먼저 설계하지 않으면 분리가 아니라 기능 삭제가 됩니다.

- Atlas↔제품 preview protocol의 버전·허용 origin·실패 처리
- `/project-*` URL의 소유자와 배포 rewrite/redirect
- 제품 checkout·branch·commit을 Atlas가 어떻게 선택하고 읽는지
- registry snapshot과 제품 commit SHA의 원자적 연결 방식

동일 앱의 `src/web`, `src/atlas` 분리는 위 계약을 보존한 채 경계를 시험하는 중간 단계로는 저비용입니다. 그러나 import rule·독립 tsconfig/build·독립 배포가 없으면 단지 폴더명 변경일 뿐 물리적 격리가 아닙니다.

### MINOR — DEV 전용은 계층 경계가 아니라 노출/번들 정책입니다

**실측:** Atlas preview hook은 제품 코드에 남아 있고 DEV에서만 활성화됩니다. DEV 조건은 제품에서 Atlas를 숨기거나 tree-shake할 수는 있어도, 제품이 Atlas protocol을 알아야 한다는 결합을 제거하지 않습니다.  
근거: [use-atlas-preview.ts:5](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/lib/use-atlas-preview.ts:5), [use-atlas-preview.ts:28](/Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem/frontend/src/lib/use-atlas-preview.ts:28).

따라서 “프로덕션 번들에 없다”는 실측과 “계층적으로 분리됐다”는 결론은 서로 다른 주장입니다. 전자는 build artifact 측정, 후자는 import 방향·소유권·배포 독립성으로 측정해야 합니다.

### MAJOR — 제안 C의 DB 전환 조건은 부족합니다

**추론:** 런타임 변경·동시 편집·대규모 교차 질의는 DB 전환의 충분조건이 될 수 있지만, yaml 운영이 먼저 깨지는 지점은 더 많습니다.

- Atlas와 제품이 별도 repo가 되는 순간의 snapshot provenance와 원자적 버전 고정
- 여러 제품 repo/branch를 동시에 관측할 때의 registry 배치와 권한
- reviewer 승인·정정 이력·authoritative merge policy
- 코드 스캔 결과와 사람이 저술한 설명의 충돌 해소
- schema migration, 대량 생성 artifact, 검색/관계 탐색의 CI 비용

반대로 이런 문제가 생겨도 DB가 자동 답은 아닙니다. 코드와 정확히 대응하는 파생 데이터는 제품 commit SHA가 박힌 immutable YAML/JSON artifact가 더 적합할 수 있습니다. DB 판단 기준에는 “변경의 소유자·감사·commit provenance가 Git만으로 보존되는가”를 추가해야 합니다.

### MINOR — 결정의 완료 조건이 측정 가능하지 않습니다

다음 없이는 “정본화 완료”를 주장할 수 없습니다.

- 모든 card의 `defectIds`, `featureIds`, `operationIds`, `sourceRefs` 검증
- 모든 defect `relatedFeature`와 모든 `uses` operation의 dangling-reference 검증
- 제품 DOM node와 page-card binding의 누락/중복 검증
- product commit SHA, registry/schema 버전, generated artifact SHA를 한 화면/빌드에 노출
- product bundle에서 Atlas 코드가 제외되는지와 Atlas build가 제품 import 없이 되는지의 CI 측정

최종 권고는 “Atlas registry를 유일 정본으로 선언”이 아니라, **기능 registry와 page-atlas registry를 분리하고 검증 가능한 조인 read-model을 생성한 뒤**, 그 artifact·preview protocol·배포 경계를 기준으로 별도 빌드/별도 repo를 결정하는 것입니다.
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
