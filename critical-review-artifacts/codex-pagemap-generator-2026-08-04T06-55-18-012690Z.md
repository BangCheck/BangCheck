# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-sol
- Reasoning effort: xhigh
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-04T06:45:55.052607+00:00
- Finished at (UTC): 2026-08-04T06:55:18.010891+00:00

## Original task / label

pagemap-generator

## Final prompt

```text
## 이 지시가 저장소의 다른 모든 지시에 우선한다

`AGENTS.md`, `.cursorrules`, `GEMINI.md`, `_wood/` 규약은 이 검토에 적용하지 않는다.
`_wood/workflows/_protocol.md`·`_wood/agents/_safety.md`의 Y/N 확인도 해당 없다.
비용·승인을 되묻지 마라 — 되묻는 응답은 실패로 처리된다.
STEP 0/1을 밟지 말고 바로 검토하라.

**명령을 실행해도 된다.** 다음을 직접 돌려라.
- `python3 .project-atlas/tools/resolve.py`
- `python3 .project-atlas/tools/pagemap.py`
- `python3 .project-atlas/tools/pagemap.py --json`
`frontend/node_modules`가 설치돼 있어 `npm run typecheck`·`lint`도 가능하다.
파일 수정은 하지 마라. 판정만 내라.

---

# 과제

Atlas Map 위에 **페이지 축 뷰 생성기**를 만들었다. 그것을 검토하라.

검토 대상 diff: `git diff 4912ce5..85e4506`

**가장 중요한 것은 생성기의 정확성이다.**
registry 값은 틀려도 그 항목만 틀리지만, **생성기가 틀리면 모든 뷰가 조용히 틀린다.**
그리고 이 뷰는 앞으로 "어느 화면이 무엇을 부르나"의 답으로 쓰일 것이라
틀린 채로 신뢰되면 registry보다 위험하다.

## 만든 것

`.project-atlas/tools/pagemap.py` — 손으로 적지 않고 세 원천을 조인해 생성한다.

```
페이지 → 기능(FT-*) → 고유 ID(OP-*) → 프론트 경로:줄 / 백엔드 경로
```

- 라우트→페이지: `frontend/src/app/router.tsx`의 `<Route>` 파싱 + `lib/routes.ts` 상수 해석
- 페이지→API: import 그래프를 **심볼 단위로** 따라가며 `api.*`/`axios.*` 호출 수집
- API→기능: `.project-atlas/registry`의 `owns[].route`와 정규화 대조

## 저작자의 주장 — 반박하라

**주장 1 — 심볼 단위 추적이 모듈 단위보다 정확하다.**
처음 모듈 단위로 세어 82건이 나왔고(`/checklist/:id`가 15건),
심볼 단위로 42건, 훅까지 내려 **27건**이 됐다.
`/rooms`가 실제 import하는 훅 셋(`useRoomsList`·`useDeleteRoom`·`useChecklistItems`)과
생성 결과 3건이 정확히 맞는다고 주장한다.

**이 27건이 맞나. 과소 계상은 없나?**
특히 다음을 의심하라 —
- `import * as svc` (별칭 전체 import)를 모듈 전체로 처리하는데 옳은가
- 재export(`export { x } from './y'`)를 따라가나
- 컴포넌트가 다른 컴포넌트를 import하고 그쪽이 훅을 쓰는 경우를 따라가나
- 조건부/동적 import를 놓치나
- `useQueries` 같은 배열 조합 호출을 놓치나

**주장 2 — `uses`는 화면 무관한 기능 간 의존만 적는다.**
`schema.yaml`의 `operationRef`에 계약을 명문화하고,
기존 셋(`FT-CHECKLIST-SETTINGS`, `FT-DIRECTIONS-WALKING`,
`FT-ROOM-CREATE-WITH-CHECKLIST`)의 `uses`를 비웠다.
근거는 "같은 사실을 두 곳에 두면 갈라진다"이다.
**이 정리가 정보를 잃게 만들지는 않나?**

**주장 3 — `FT-ADDRESS-SEARCH`는 뷰가 잡은 구멍이다.**
`OP-ADDRESS-SEARCH`가 남의 `uses`에만 있고 소유자가 없어,
`uses`를 비우자 registry에서 사라졌다고 주장한다.
새로 등재하며 `auth`를 JWT로 적었다가 `SecurityConfig:61`의 permitAll에
반박당해 PUBLIC으로 고쳤다고 한다.

## 검증할 것

1. **생성기를 직접 돌리고 결과를 검증하라.**
   임의의 페이지 두셋을 골라 실제 코드를 읽고 호출 목록이 맞는지 대조하라.
   빠진 것(과소)과 남는 것(과대)을 각각 찾아라.

2. **파싱의 취약점.** `ROUTE_EL` 정규식이 놓치는 Route 형태가 있나.
   `lib/routes.ts`의 함수형 상수(`CHECKLIST_DETAIL: (id) => ...`)는 어떻게 되나.
   DEV 전용 라우트 셋(`/project-*`)이 결과에 없는데 의도된 것인가 버그인가.

3. **정규화 충돌.** `norm()`이 `{id}`와 `${roomId}`를 `{}`로 만든다.
   서로 다른 route가 정규화 후 같아지는 경우가 있나.

4. **resolver와의 관계.** `pagemap.py`와 `resolve.py`가 같은 추출 로직을
   각자 복제하고 있다. 두 곳이 갈라지면 무슨 일이 나나.

5. **이 뷰로 답할 수 없는 것.** 저작자는 "화면이 무엇을 부르나"를 답한다고
   주장하는데, 실제로 답 못 하는 질문이 있나.
   (예: 조건부 호출, 사용자 상태에 따른 분기, 서버 주도 호출)

6. **빠뜨린 것.** 위가 안 다뤘는데 이 구조의 값을 깎는 것.

## 형식

각 지적에 severity(MAJOR/MINOR)와 근거 파일·줄을 붙여라.
실행한 명령과 출력을 인용하고 실측과 추론을 구분하라.
마지막에 "이 생성기의 출력을 사실로 신뢰해도 되는가"에 대한 한 줄 판정을 내려라.

```

## Final response

```text
## 판정: REVISE

27건은 “각 페이지 컴포넌트에서 제한된 정규식으로 도달한 API의 조건 없는 합집합”일 뿐, 실제 화면 호출의 정확한 목록은 아닙니다. 실코드 기준 과소·과대 계상이 모두 있습니다.

### 핵심 지적

1. **MAJOR — 라우트 레이아웃의 호출을 전부 누락한다**

`load_pages()`는 최종 페이지 파일만 반환하고, 이후 `calls_from(page)`만 실행합니다. 중첩 라우트의 `AppLayout`은 그래프에 들어오지 않습니다. 근거: [pagemap.py:177](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:177), [pagemap.py:205](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:205), [router.tsx:73](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/router.tsx:73).

실제 `AppLayout`의 `Header`와 `BottomNavigation`은 모두 `useRoomsList()`를 사용합니다. 근거: [Header.tsx:18](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/layout/Header.tsx:18), [Header.tsx:21](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/layout/Header.tsx:21), [BottomNavigation.tsx:38](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/layout/BottomNavigation.tsx:38), [BottomNavigation.tsx:42](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/layout/BottomNavigation.tsx:42).

실측:

```text
app/layout/Header.tsx
  GET /api/v1/rooms frontend/src/services/room-service.ts:19
app/layout/BottomNavigation.tsx
  GET /api/v1/rooms frontend/src/services/room-service.ts:19
```

그러나 생성 결과는 `/my`를 다음처럼 냅니다.

```text
/my   (frontend/src/features/mypage/MyPage.tsx)
   API 호출 없음
```

따라서 `/my`는 명백한 과소 계상입니다. 같은 이유로 `/login`, `/checklist/:id`, `/custom`에서도 `GET /api/v1/rooms`가 빠졌습니다. 현행 규칙대로 페이지별 고유 endpoint를 세어도 27건이 아니라 최소 31건입니다. 인증 refresh까지 포함하면 더 늘지만, 조건 의미부터 먼저 정의해야 합니다.

2. **MAJOR — 심볼 추적은 AST 심볼 추적이 아니라 “export 사이의 텍스트 구간”이다**

`symbol_spans()`는 export 선언부터 다음 export 선언 전까지를 함수 본문으로 간주합니다. 근거: [pagemap.py:89](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:89).

이 때문에 모듈 초기화 코드와 interceptor 같은 top-level side effect가 잘못된 심볼에 귀속됩니다. `api`를 쓰는 모든 요청은 401일 때 refresh를 호출할 수 있지만, interceptor는 `api` export 구간 밖에 있습니다. 근거: [api.ts:10](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/lib/api.ts:10), [api.ts:41](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/lib/api.ts:41), [api.ts:50](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/lib/api.ts:50).

실측한 전체 정적 호출과 페이지 합집합 차이:

```text
all static frontend routes: 19
page union: 17
not attributed:
GET /api/v1/users/me frontend/src/services/auth-service.ts:39
POST /api/v1/auth/jwt/refresh frontend/src/lib/api.ts:50
```

`GET /users/me`는 현재 미사용 서비스라 페이지 누락이 아닐 수 있지만, refresh는 페이지 요청에 의해 실제로 발생하는 조건부 호출입니다.

의심 항목별 판정은 다음과 같습니다.

- `import * as svc`: 일반적으로 모듈 전체 처리하면 안 됩니다. [pagemap.py:145](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:145). 현재 유일한 사례인 `customService`는 우연히 8개 API 함수가 모두 `useCustomization` 안에서 실제 사용되므로 `/custom` 8건은 맞습니다. 새 export 하나만 추가돼도 즉시 과대 계상됩니다.
- 재export: 따라가지 않습니다. `export { x } from`/`export * from` 파서가 없습니다. barrel을 거치면 `regions=[]`가 되어 조용히 누락됩니다.
- 하위 컴포넌트: 지원되는 정적 import 형태라면 따라갑니다. `Checklist*Page → BasicInfo → AddressSearchInput → searchAddress`는 실제로 잡혔습니다. 근거: [01_basic-info.tsx:2](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/checklist/components/01_basic-info.tsx:2), [AddressSearchInput.tsx:4](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/checklist/components/ui/AddressSearchInput.tsx:4).
- 동적/조건부 import: `calls_from()`의 import 정규식은 정적 `import … from`만 처리하므로 지원하지 않습니다. 근거: [pagemap.py:120](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:120).
- `useQueries`: 현재 `/report` 사례는 `getRoomDetail`을 직접 import하므로 잡힙니다. 배열 구조를 이해한 것이 아니라 파일 안에 심볼명이 있어서 잡힌 것입니다. 근거: [ReportPage.tsx:42](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/report/ReportPage.tsx:42).

3. **MAJOR — 결과가 “가능한 호출”과 “실제로 발생하는 호출”을 구분하지 않아 과대 계상한다**

예를 들어 `/rooms`는 3건을 표시하지만 비로그인 상태에서는:

- `useRoomsList`가 `enabled: isLoggedIn`이라 호출하지 않고,
- `useChecklistItems`는 서버 함수 대신 로컬 `GUEST_CHECKLIST_ITEMS`를 사용하며,
- delete mutation도 사용자 동작 전에는 실행되지 않습니다.

근거: [use-rooms-query.ts:8](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/rooms/hooks/use-rooms-query.ts:8), [use-rooms-query.ts:13](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/rooms/hooks/use-rooms-query.ts:13), [use-checklist-items.ts:29](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/checklist/hooks/use-checklist-items.ts:29), [use-checklist-items.ts:33](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/checklist/hooks/use-checklist-items.ts:33).

따라서 게스트 `/rooms`의 실제 서버 호출은 0인데 출력에는 3건이 남습니다. `/map`의 directions 역시 기준점과 방을 선택해야만 활성화됩니다. 근거: [MapPage.tsx:455](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/map/MapPage.tsx:455), [use-directions-query.ts:12](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/map/hooks/use-directions-query.ts:12).

출력이 “어떤 상태에서든 호출 가능”을 뜻한다면 endpoint 합집합으로는 쓸 수 있습니다. 하지만 현재 출력에는 `onLoad`, `onAction`, `memberOnly`, `guest`, `conditional` 같은 구분이 없어 구체적인 화면 질문에는 과대·과소 양쪽으로 답을 틀립니다.

4. **MAJOR — `ROUTE_EL`이 실제 Route 16개 중 페이지 11개만 남기며 조용히 버린다**

실측:

```text
ROUTE_EL matches: 16
('ROUTES.PROJECT_MAP', 'Suspense')
('ROUTES.PROJECT_DASHBOARD', 'Suspense')
('ROUTES.PROJECT_PAGE_PATTERN', 'Suspense')
('"/settings"', 'Navigate')
('"*"', 'Navigate')
load_pages: 11
```

DEV 라우트는 내부 페이지가 아니라 `Suspense`를 컴포넌트로 캡처합니다. `Suspense`가 default/lazy import map에 없으므로 세 라우트가 탈락합니다. 근거: [pagemap.py:40](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:40), [router.tsx:55](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/router.tsx:55).

이는 의도적인 생산환경 필터가 아닙니다. 코드에 DEV 제외 조건이 없고, 정규식이 `Suspense`를 지원하려다 fallback JSX에서 실패한 결과입니다. `/settings` redirect와 wildcard도 `Navigate`를 해석하지 못해 빠집니다.

함수형 상수도 지원하지 않습니다. `consts`는 문자열 리터럴만 읽으므로 `CHECKLIST_DETAIL: (id) => ...`가 Route 선언에 사용되면 `ROUTES.CHECKLIST_DETAIL`이라는 문자열이 그대로 남습니다. 근거: [pagemap.py:181](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:181), [routes.ts:5](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/lib/routes.ts:5), [routes.ts:9](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/lib/routes.ts:9).

5. **MAJOR — `uses` 제거는 page 관계와 feature 관계를 혼동해 실제 정보를 잃는다**

`FT-CHECKLIST-SETTINGS`의 `saveCurrentSettings`는 단순히 같은 화면에 operation이 놓여 있는 것이 아니라, 해당 feature의 저장 작업 안에서 다른 feature의 operation을 순서대로 직접 호출합니다. 근거: [use-customization.ts:203](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:203), [use-customization.ts:213](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:213), [use-customization.ts:217](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:217), [use-customization.ts:232](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:232).

페이지 맵은 `/custom → 여덟 endpoint`만 보여 줍니다. 다음은 답하지 못합니다.

- 어느 operation이 `FT-CHECKLIST-SETTINGS` 저장의 일부인가
- 조회와 저장 workflow를 어떻게 구분하는가
- deselect → select → delete → add → save 순서
- 중간 실패 시 부분 적용 관계

따라서 page→operation과 feature→operation은 중복된 같은 사실이 아닙니다. [FT-CHECKLIST-SETTINGS.yaml:51](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/registry/FT-CHECKLIST-SETTINGS.yaml:51)의 관계를 비우면 정보가 소실됩니다.

Directions 파일도 “OP-ROOM-LIST 결과 없이는 절대 호출되지 않는다”고 적은 직후 `uses: []`로 비워 의미 계약과 충돌합니다. 근거: [FT-DIRECTIONS-WALKING.yaml:37](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/registry/FT-DIRECTIONS-WALKING.yaml:37).

또한 schema는 대체물이 `pages.yaml`이라고 쓰지만 실제 저장소에 그런 파일은 없습니다. FEC-01도 전역 frontend route 존재 여부만 검사할 뿐 페이지 축을 만들지 않습니다. 근거: [schema.yaml:65](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/schema.yaml:65), [resolve.py:172](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:172).

6. **MAJOR — resolver 초록불은 pagemap 정확성을 전혀 보증하지 않으며 추출 로직은 이미 갈라졌다**

호출 정규식과 `norm()`이 두 파일에 복제돼 있습니다. 근거: [pagemap.py:34](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:34), [pagemap.py:43](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:43), [resolve.py:123](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:123), [resolve.py:130](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:130).

이미 동작이 다릅니다.

- resolver는 해석 불가능한 호출을 위반으로 셉니다. [resolve.py:141](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:141), [resolve.py:193](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:193)
- pagemap은 같은 상황을 `continue`로 버리고 결국 “API 호출 없음”으로 표시합니다. [pagemap.py:133](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:133), [pagemap.py:220](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:220)

또한 resolver의 `uses` 검증은 route 존재만 보고 operationId가 실제 owner에 정의됐는지 확인하지 않습니다. `operation_ids`는 추가와 중복 검사에만 사용됩니다. 근거: [resolve.py:286](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:286), [resolve.py:335](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:335).

그래서 다음 결과는 registry 경로 등이 존재한다는 뜻이지 페이지 맵이 맞다는 뜻이 아닙니다.

```text
Atlas resolver — 검사 941건, 위반 0건, 등재된 결함 1건
registry의 모든 참조가 실제 저장소에서 resolve 됨
```

pagemap 관련 테스트도 발견되지 않았습니다(`rg` exit 1, `.project-atlas` test 파일 0개). 생성기를 정본처럼 쓸 목적과 맞지 않습니다.

7. **MAJOR — 출력의 backend 경로는 operation에서 추출한 경로가 아니다**

`load_registry()`는 feature의 `implementedBy.slice/useCase` 하나를 모든 `owns` operation에 복사합니다. 실제 controller route나 handler 메서드를 해석하지 않습니다. 근거: [pagemap.py:156](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:156), [pagemap.py:164](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:164).

따라서 출력의 “백엔드”는 “registry가 이 feature의 대표 구현이라고 주장한 파일”이지, 해당 endpoint가 실제로 도달하는 코드 경로가 아닙니다. 서버 내부 외부 호출·이벤트·비동기 작업도 전혀 추적하지 않습니다. 예를 들어 주소 화면은 서버의 Juso API 호출까지 이어지지만 pagemap은 이를 발견하지 않습니다. 근거: [AddressSearchService.java:29](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/api/address/service/AddressSearchService.java:29).

프론트 경로 역시 페이지/훅의 호출 지점이 아니라 service 선언 위치 하나만 남기며, 동일 정규화 route의 여러 호출자는 `setdefault()`로 하나만 보존합니다. 근거: [pagemap.py:137](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:137).

8. **MINOR — 현재 정규화 충돌은 없지만 충돌 시 조용히 덮어쓴다**

실측:

```text
normalized owns routes: 28
collisions: 0
raw oracle routes: 33
normalized oracle routes: 33
collisions: 0
```

따라서 현재 `{id}`와 `${roomId}` 때문에 충돌하는 route는 없습니다. 다만 `load_registry()`는 충돌 검사 없이 동일 key에 마지막 feature를 대입합니다. 근거: [pagemap.py:43](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:43), [pagemap.py:166](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/pagemap.py:166).

향후 `{id:\d+}`와 `{slug}`처럼 동일 모양이지만 의미가 다른 route가 생기면 sorted filename상 마지막 값으로 조용히 오귀속됩니다.

9. **MINOR — `FT-ADDRESS-SEARCH`의 owner 추가와 PUBLIC 판정은 맞지만 registry 근거 하나가 틀렸다**

긍정적으로 확인된 부분:

- 기존 commit에는 `OP-ADDRESS-SEARCH`가 `uses`에만 있었고 owner가 없었습니다.
- 현행 controller route는 실제 존재합니다.
- `SecurityConfig`가 정확히 permitAll로 엽니다. 근거: [SecurityConfig.java:61](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/global/config/SecurityConfig.java:61).

따라서 owner 추가와 `auth: PUBLIC` 교정은 타당합니다.

다만 `legacyPath`는 `AddressController.java#search`를 가리키는데 실제 메서드는 `getJuso`입니다. 근거: [FT-ADDRESS-SEARCH.yaml:31](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/registry/FT-ADDRESS-SEARCH.yaml:31), [AddressController.java:29](/Users/jonghoPro/woo/00_project/08_BangCheck/backend/src/main/java/com/room/backend/api/address/controller/AddressController.java:29). Resolver가 문자열 포함만 검사해 `@GetMapping("/search")`를 심볼로 오인하고 통과시킨 것입니다. 근거: [resolve.py:211](/Users/jonghoPro/woo/00_project/08_BangCheck/.project-atlas/tools/resolve.py:211).

### 페이지별 실코드 대조

| 페이지 | 생성 결과 | 실코드 대조 |
|---|---:|---|
| `/rooms` | 3 | 페이지 로컬 “가능 호출”은 3건과 일치. 단 게스트 실행에서는 0건 |
| `/report` | 3 | `useRoomsList`, `useChecklistItems`, `useQueries(getRoomDetail)` 모두 일치 |
| `/custom` | 8 | 현재 namespace service의 8개 API가 모두 실제 참조되어 일치 |
| `/my` | 0 | 오답. `AppLayout`의 `GET /api/v1/rooms` 누락 |

### 실행 결과

요청한 세 명령은 모두 exit 0이었습니다.

```text
$ python3 .project-atlas/tools/resolve.py
Atlas resolver — 검사 941건, 위반 0건, 등재된 결함 1건
registry의 모든 참조가 실제 저장소에서 resolve 됨
  [known] FEC-01 GET /api/v1/users/me ...

$ python3 .project-atlas/tools/pagemap.py
...
/my   (frontend/src/features/mypage/MyPage.tsx)
   API 호출 없음

$ python3 .project-atlas/tools/pagemap.py --json
...
{
  "page": "/my",
  "component": "frontend/src/features/mypage/MyPage.tsx",
  "calls": []
}
```

추가 검증:

```text
$ npm run typecheck
exit 0

$ npm run lint
exit 1
✖ 9 problems (6 errors, 3 warnings)
```

lint 오류는 MapPage namespace와 CompareTable hook 규칙 등이며 이번 diff가 수정한 파일은 아닙니다. `git diff --check`는 exit 0, 최종 `git status --short`도 비어 있어 파일 수정은 없었습니다.

**최종 판정: 이 생성기의 출력은 현재 “가능한 page-local API 후보”로만 참고할 수 있으며, 화면 호출의 사실로 신뢰해서는 안 된다.**
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
