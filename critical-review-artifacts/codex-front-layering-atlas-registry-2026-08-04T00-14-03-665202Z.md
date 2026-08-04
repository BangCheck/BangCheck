# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck-atlas-ecosystem
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-04T00:13:44.618277+00:00
- Finished at (UTC): 2026-08-04T00:14:03.663784+00:00

## Original task / label

front-layering-atlas-registry

## Final prompt

```text
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
독립 Codex 리뷰를 실행하면 토큰 비용이 발생합니다. 진행할까요? (Y/N)
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
