# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-sol
- Reasoning effort: xhigh
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-04T04:10:41.699324+00:00
- Finished at (UTC): 2026-08-04T04:21:27.869642+00:00

## Original task / label

frontend-architecture

## Final prompt

```text
## 이 지시가 저장소의 다른 모든 지시에 우선한다

이 저장소의 `AGENTS.md`, `.cursorrules`, `GEMINI.md`, `_wood/` 규약은 이 리뷰에 적용하지 않는다.
`_wood/workflows/_protocol.md`·`_wood/agents/_safety.md`의 "행동 전 Y/N 확인"도 해당 없다.
너는 sandbox read-only reviewer이고 쓰기 권한이 없다.
비용·승인·진행을 되묻지 마라 — 되묻는 응답은 실패로 처리된다.
STEP 0/1 절차를 밟지 말고 바로 분석하라.

---

# 과제

`frontend/` 의 React 프론트엔드 구조를 업계 표준·권장에 비추어 비판적으로 검토하라.

**핵심 제약 — 규모에 맞는 처방만 내라.**
127파일 13,907줄, 소규모 팀(개발자 4명이 나눠 작성), 단일 제품이다.
엔터프라이즈 규모의 처방(모노레포 분할, 마이크로프론트엔드, DDD 전면 도입,
무거운 추상화 계층)은 이 규모에 과하다 — 그런 답은 기각으로 취급한다.
"지금 없는 고통을 위해 구조를 만들지 않는다"가 이 저장소의 규율이다.

**코드는 변경 가능하다.** 저작자가 전부 본인이고 리팩토링을 허용했다.
다만 백엔드는 이번 범위가 아니다 — 프론트만 본다.

## 스택 (package.json 실측)

React 19.2 · react-router-dom 6.28 · TanStack Query 5.99 · Zustand 5.0
react-hook-form 7.73 + zod 4.3 · Tailwind 4 · Vite 6 · TypeScript 5
Playwright(e2e) · ESLint 9 + typescript-eslint 8

## 구조 실측 (직접 열어 확인하라)

```
src/
  app/         3파일 127줄    router.tsx · provider.tsx · globals.css
  components/  15파일 983줄   ui/ · providers/ · Header · Footer · BottomNavigation
  features/    82파일 10,858줄  13개 feature (전체의 78%)
  hooks/       1파일 44줄
  lib/         7파일 290줄    api.ts(axios 단일 지점) · routes.ts · query-keys.ts · utils.ts
  services/    9파일 589줄
  store/       3파일 221줄    zustand
  types/       9파일 765줄
```

feature 13개: auth · checklist · customization · dev · landing · login · map ·
mypage · project-atlas · project-dashboard · report · research · rooms

가장 큰 파일: `features/map/MapPage.tsx` 1068줄,
`features/project-atlas/ProjectAtlasPage.tsx` 770,
`features/customization/SettingsPage.tsx` 556,
`features/rooms/pages/RoomsPage.tsx` 520

## 저작자(Claude)가 이미 찾은 것 — 반복하지 말고 그 너머를 봐라

**좋은 관례로 판단한 것:**
1. axios가 `lib/api.ts` 한 곳에만 있다. 컴포넌트에서 직접 호출하지 않는다.
2. 데이터 패칭이 feature별 `hooks/use-*-query.ts`로 일관된다
   (checklist·customization·map·rooms 네 곳 모두 같은 형태).
3. 13개 feature의 폴더 관례가 대체로 지켜진다.

**문제로 판단한 것:**
4. **feature에 공개 API(`index.ts`)가 하나도 없다.** 그래서 교차 import가
   내부 경로를 직접 뚫는다 — 예: `@/features/checklist/hooks/use-checklist-items`.
5. **`rooms ↔ checklist` 순환 의존이 있다.**
   `rooms/pages/RoomsPage.tsx` → `checklist/hooks/use-checklist-items`,
   `checklist/ChecklistNewPage.tsx` → `rooms/hooks/use-rooms-query`.
6. 교차 feature import 6쌍: checklist→rooms, map→rooms,
   project-dashboard→research, report→checklist, report→rooms, rooms→checklist.
7. `MapPage.tsx` 1068줄 — 단일 파일이 과대하다.

## 답해야 할 것

**질문 1 — 이 구조를 업계 표준에 비추어 평가하라.**
- 어느 부분이 현재 React 생태계의 표준 관행에 부합하는가 (그대로 두어야 할 것)
- 어느 부분이 알려진 안티패턴인가 (구체적 실패 시나리오와 함께)
- feature-based(=feature-sliced 계열) 구조를 표방하는데 실제로 그 계약을
  지키고 있는가. 안 지키는 지점은 어디이고 그것이 무엇을 깨뜨리는가
- `services/`(589줄)와 feature별 `hooks/`가 공존하는데 역할이 갈리는가 겹치는가

**질문 2 — 이 규모에서 실제로 할 가치가 있는 것만 골라라.**
발견한 문제 전부를 고치라고 하지 마라. 다음 셋으로 분류하라.
- **지금 한다** — 비용 대비 값이 명확한 것. 각각 대략의 작업량을 적어라
- **트리거 대기** — 조건이 오면 한다. 그 조건을 측정 가능하게 적어라
- **하지 않는다** — 이 규모에 과한 것. 왜 과한지 적어라

**질문 3 — 경계를 기계가 지키게 하려면.**
이 저장소에는 백엔드 쪽에 아키텍처 검사(ArchUnit 등)가 없다는 것이 이미
지적됐다. 프론트에서 같은 문제 — feature 경계·순환 의존·public API 강제 — 를
기계가 검사하게 하는 현실적 방법을 제시하라.
이미 있는 도구(ESLint 9 + typescript-eslint 8)로 되는 것과 새 의존성이
필요한 것을 구분하고, 새 의존성은 비용을 명시하라.

## 형식

각 지적에 severity(MAJOR/MINOR)와 근거 파일·줄을 붙여라.
실측(파일에서 읽은 것)과 추론(일반 지식)을 반드시 구분하라.
공식 문서 근거가 있으면 링크하라.
마지막에 "이 규모에서 가장 먼저 손댈 것 하나"를 한 문장으로 지목하라.

```

## Final response

```text
# 총평

전면 개편할 구조는 아니다. 현재 구조는 이 규모에 적절한 “기능별 응집 + 공용 데이터 계층”에 가깝고, 유지보수 기반도 나쁘지 않다. 다만 엄밀한 Feature-Sliced Design은 아니다. `features/`가 페이지·도메인 데이터·개발 도구를 모두 뜻하고, 실제 의존 규칙도 지켜지지 않는다.

핵심 문제는 폴더 이름보다 다음 네 가지다.

1. 인증 토큰을 브라우저 영구 저장소에 중복 보관한다.
2. 사용 중인 데이터 경로와 미사용 레거시 경로가 공존한다.
3. 경계를 설명하는 규칙은 있지만 기계가 막지 않는다.
4. `customization` 저장과 `MapPage` 외부 SDK 연동이 한 단위에 너무 많은 책임을 가진다.

## 질문 1 — 구조 평가

### 그대로 두어야 할 것

- `main → AppProvider → Router` 조합이 명확하다. 전역 provider와 라우팅이 분리되고 `StrictMode`도 적용되어 있다.  
  실측: [main.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/main.tsx:13), [provider.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/provider.tsx:25)

- API 호출 함수와 TanStack Query hook의 기본 분리는 좋다. `service`는 HTTP·DTO 변환, hook은 query key·활성 조건·캐시 무효화를 맡는다.  
  실측: [room-service.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/services/room-service.ts:15), [use-rooms-query.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/rooms/hooks/use-rooms-query.ts:8)

- Query key를 한곳에 모으고, `['rooms']` prefix로 목록·상세를 일괄 무효화하는 방식도 적절하다.  
  실측: [query-keys.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/lib/query-keys.ts:1), [use-rooms-query.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/rooms/hooks/use-rooms-query.ts:18)

- 대부분의 서버 상태는 TanStack Query, 게스트 방처럼 실제 클라이언트 소유 상태는 Zustand로 구분한다. 이는 TanStack Query가 의도한 서버 상태 관리 모델에 부합한다. [TanStack Query 공식 설명](https://tanstack.com/query/latest/docs/framework/react/overview)

- Atlas·research·dashboard의 큰 파일은 운영 기능과 같은 무게로 취급할 필요가 없다. 세 페이지는 DEV 조건부 lazy import다.  
  실측: [router.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/router.tsx:20)

### 주요 지적

#### [MAJOR] 인증 토큰이 localStorage와 JS cookie에 중복 영속화된다

실측:

- `persist()`가 `accessToken`을 포함한 전체 auth store를 `auth-storage`에 저장한다. [use-auth-store.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/store/use-auth-store.ts:16)
- 같은 토큰을 `document.cookie`에도 기록하며 `HttpOnly`·`Secure`가 없다. [cookie.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/lib/cookie.ts:3)

추론/실패 시나리오:

- XSS 한 건이면 localStorage와 cookie 양쪽에서 access token을 읽을 수 있다.
- 두 저장소 중 하나만 정리되거나 갱신되면 인증 상태가 서로 달라진다.
- OWASP는 인증 토큰을 localStorage에 저장하지 말 것을 명시하고, 세션 cookie에는 `HttpOnly` 사용을 권장한다. [OWASP HTML5 Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html), [MDN cookie 보안](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies)

프론트에서는 access token을 메모리에만 두고, Zustand `partialize`로 토큰 영속화를 제외해야 한다. `document.cookie` 쓰기도 문서화된 서버 소비자가 없다면 제거하는 것이 맞다.

#### [MAJOR] 엄밀한 feature-sliced 계약은 지키지 않는다

실측:

- 저장소 자체 규칙은 feature 외부 import를 금지하고 `app → features → services` 방향을 선언한다. [frontend/CLAUDE.md](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/CLAUDE.md:5)
- 반대로 공유 영역이 feature를 역참조한다.
  - [Header.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/components/Header.tsx:6)
  - [BottomNavigation.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/components/BottomNavigation.tsx:6)
  - [SectionIcon.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/components/ui/SectionIcon.tsx:2)
- `services`도 feature mapper를 역참조한다. [checklist-service.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/services/checklist-service.ts:3)

추론:

- 현재 `features/`는 엄격한 독립 모듈이라기보다 “관련 파일을 찾기 쉽게 모은 폴더”다.
- FSD에서는 같은 layer의 slice 간 직접 import를 원칙적으로 금지하고, 외부 소비는 public API를 통하도록 한다. [FSD layer import rule](https://feature-sliced.design/docs/reference/layers), [FSD Public API](https://feature-sliced.design/docs/reference/public-api)
- public `index.ts`만 추가해도 해결되지 않는다. shared→feature 역방향과 feature 폴더 순환은 그대로 남기 때문이다.

교차 import 6쌍도 동일하게 평가하면 안 된다.

- `map/report → rooms/checklist`: 페이지가 데이터 기능을 조합하는 정상적인 의존일 수 있다. 문제는 이 페이지와 데이터 기능이 모두 `features`라는 같은 층에 있다는 점이다.
- `project-dashboard → research`: DEV 전용이므로 운영 구조의 우선순위가 낮다.
- `rooms ↔ checklist`: feature 폴더 수준의 순환이다. 현재 런타임 ESM 순환은 아니다. 직접 import graph에서는 런타임 순환이 없었고, [types/checklist.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/types/checklist.ts:1)와 [types/room.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/types/room.ts:54)의 type-only 순환 하나만 발견됐다.

따라서 현재 실패 위험은 즉시 `undefined`가 생기는 런타임 순환보다, 두 feature를 독립적으로 변경할 수 없고 향후 실제 순환을 만들기 쉽다는 것이다.

#### [MINOR] 실제 경로와 레거시 경로가 두 벌이다

실측 import graph에서 `main.tsx`로부터 도달하지 않는 파일이 21개, 642줄이었다. 대표적으로:

- 미사용 Query provider: [react-query-provider.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/components/providers/react-query-provider.tsx:1)
- 미사용 hook: [use-checklist-query.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/checklist/hooks/use-checklist-query.ts:1)
- 미사용 service: [checklist-service.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/services/checklist-service.ts:1), [comparison-service.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/services/comparison-service.ts:1)

실패 시나리오:

- 새 개발자가 이름만 보고 `useCreateChecklist`를 사용하면 `['checklists']`를 무효화하지만 실제 방 목록은 `['rooms']`를 사용하므로 UI가 갱신되지 않는다.
- 레거시 경로는 `/api/v1/rooms`와 오래된 mapper를 쓰지만, 현재 생성 경로는 `/api/v1/rooms/check-results`와 `room-mappers`를 사용한다. 잘못된 API 계약을 선택하기 쉽다.

#### [MAJOR] customization은 서버 상태·영속 상태·저장 트랜잭션이 중첩된다

실측:

- 동일한 설정을 TanStack Query와 persisted Zustand 양쪽에 둔다. [use-customization.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:24), [use-customization-store.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/store/use-customization-store.ts:14)
- 수동 signature/ref로 양쪽을 동기화한다. [use-customization.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:80)
- 저장은 deselect→select→delete→add→settings를 순차 실행한다. [use-customization.ts](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/customization/hooks/use-customization.ts:202)

실패 시나리오:

- custom item 추가가 성공한 뒤 마지막 `saveSettings`가 실패하면 서버는 일부 변경됐지만 pending state는 그대로다.
- 재시도하면 이미 성공한 custom item을 다시 추가할 수 있다.
- 다른 탭에서 서버 설정이 바뀌어도 현재 mount에서는 ref guard가 갱신을 무시할 수 있다.

React 역시 중복된 state는 동기화 오류를 만든다고 경고한다. [React state 구조 가이드](https://react.dev/learn/choosing-the-state-structure)

#### [MAJOR] MapPage의 문제는 줄 수보다 외부 시스템 책임의 결합이다

실측:

- SDK 타입 선언·loader: [MapPage.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/map/MapPage.tsx:325)
- 지도 생명주기: [MapPage.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/map/MapPage.tsx:503)
- marker/geocoding: [MapPage.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/map/MapPage.tsx:617)
- 필터·정렬: [MapPage.tsx](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/map/MapPage.tsx:695)
- 600줄가량의 UI 렌더링까지 한 파일에 있다.

실패 시나리오:

- 필터 UI 변경이 SDK effect dependency나 marker 생명주기에 영향을 주기 쉽다.
- 비동기 geocoding callback, 전역 인증 callback, marker listener를 한 컴포넌트가 관리하므로 unmount·재초기화 회귀를 격리 테스트하기 어렵다.

React도 외부 시스템과의 복잡한 Effect 조정은 별도 hook/객체로 추출할 가치가 있다고 설명한다. [React Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

#### [MAJOR] TypeScript 검사가 전체 소스를 보장하지 않는다

실측:

- `strict`, `noUnusedLocals` 등 옵션은 좋다.
- 하지만 `include`는 일부 entry 파일만 나열한다. [tsconfig.json](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/tsconfig.json:26)
- 따라서 import되지 않은 레거시 파일은 `tsc` 검사 대상에서 빠질 수 있다.

실패 시나리오:

- dormant service/hook이 타입 오류 상태로 남아 있다가 다시 import되는 PR에서 갑자기 빌드를 깨거나, 더 나쁘게는 오래된 계약을 정상 코드처럼 제공한다.

`include: ["src/**/*", "vite.config.ts"]`처럼 전체 구현 파일을 명시하는 것이 맞다. TypeScript도 구현 파일은 `include` 패턴으로 포함하라고 설명한다. [TSConfig reference](https://www.typescriptlang.org/tsconfig/explainFiles.html)

#### [MINOR] 선언된 스택과 실제 사용 스택이 다르다

실측:

- `react-hook-form`, `zod`, resolver, `react-intersection-observer`, `class-variance-authority`는 package에 있지만 `src/`와 e2e에서 import가 없다. [package.json](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/package.json:15)

추론:

- 현재 폼을 RHF/Zod로 전환해야 한다는 뜻은 아니다. 사용하지 않는 의존성을 제거하는 편이 이 규모의 원칙에 맞는다.

### services와 feature hooks의 관계

역할은 대체로 잘 갈린다.

| 영역 | 현재 역할 | 판정 |
|---|---|---|
| `services/*-service.ts` | HTTP, DTO 반환, mapper 호출 | 유지 |
| `features/*/hooks/use-*-query.ts` | Query key, enabled, invalidation, React 상태 결합 | 유지 |
| `room-mappers.ts` | DTO↔폼 변환 | service라기보다 data mapper지만 현재 규모에서는 이동 불필요 |
| `get-query-client.ts` | 앱 인프라 설정 | `services`보다 `app`/`lib`가 더 정확 |
| `use-customization.ts` | query hook + draft store + 저장 use-case | 역할이 겹치고 과대 |
| `ReportPage`의 직접 service 사용 | `useQueries` 조합 | 단독 사례라 허용 가능 |

즉 `services/` 전체를 feature 안으로 옮길 이유는 없다. 현재의 수평 데이터 계층은 오히려 feature 순환을 줄일 수 있다. 예외와 레거시만 정리하면 된다.

## 질문 2 — 규모에 맞는 우선순위

### 지금 한다

| 작업 | 예상 작업량 |
|---|---:|
| access token을 Zustand persist와 JS cookie에서 제거하고 refresh 기반 재수화 검증 | 0.5–1일 |
| `tsconfig`를 전체 `src/**/*` 검사로 바꾸고, 도달 불가 레거시 642줄 및 미사용 의존성 정리 | 0.5–1일 |
| 최소 경계 계약 확정: feature 외부는 root public API만 사용, 내부는 상대경로, shared/service는 feature import 금지 | 0.5–1일 |
| 여러 화면이 쓰는 `useRooms*`, `useChecklistItems`만 중립적인 `data/rooms`, `data/checklist` 계층으로 이동해 folder cycle 제거 | 0.5–1일 |
| customization 저장을 실패 후 재시도 가능한 구조로 바꾸고, 서버 데이터의 persisted Zustand 복제를 제거 | 1–2일 |
| MapPage에서 `useNaverMap`, 순수 geo/filter 함수, `MapRoomCardCompact` 세 덩어리만 추출 | 1–2일 |

`Header`·`BottomNavigation`은 공용 UI가 아니라 앱 shell이므로 `app/layout` 쪽으로, `SectionIcon`은 report 전용으로 이동하면 역방향 의존도 작은 비용으로 없앨 수 있다.

### 트리거 대기

- 모든 production route lazy loading: 초기 JS gzip이 250KB를 넘거나 실측 초기 로딩 회귀가 생길 때.
- `services/` 전면 재배치: service 파일이 15개 이상이거나 한 도메인이 service/mapper/type 3파일 이상을 지속적으로 소유할 때.
- 나머지 500줄 페이지 분할: 한 달에 동일 파일 충돌이 2회 이상이거나, 독립적인 외부 Effect가 3개 이상 생길 때.
- RHF/Zod 도입: 같은 validation 규칙을 공유하는 폼이 3개 이상이거나 validation 결함이 반복될 때.
- `eslint-plugin-boundaries` 도입: feature가 20개를 넘거나 경계 예외 목록이 5개 이상이 되어 core ESLint 설정이 읽기 어려워질 때.

### 하지 않는다

- 전체 FSD 7계층, DDD, repository/use-case 계층 도입
- 모노레포·마이크로프론트엔드 분할
- 모든 feature·shared 하위 폴더에 무차별 `index.ts` 생성
- 300줄을 넘었다는 이유만으로 모든 페이지 분리
- 성능 측정 없이 모든 route를 lazy 처리
- 현재 없는 다중 백엔드나 교체 가능성을 위한 API adapter 추상화

FSD 공식 문서도 모든 layer를 사용할 필요가 없다고 명시한다. [FSD Layers](https://feature-sliced.design/docs/reference/layers)

## 질문 3 — 기계적 경계 검사

### 기존 도구만으로 가능한 것

ESLint 9의 core `no-restricted-imports`로 다음을 막을 수 있다.

- `@/features/<feature>/...` deep import 금지
- 외부에서는 `@/features/<feature>` public API만 허용
- `components/**`, `lib/**`, `services/**`, `store/**`에서 `@/features/**` import 금지
- `axios`는 `lib/api.ts`에서만 import 허용

ESLint는 regex pattern과 custom message를 지원한다. 다만 이 규칙은 정적 import만 검사하고 `import()`는 검사하지 않는다. [ESLint no-restricted-imports](https://eslint.org/docs/latest/rules/no-restricted-imports)

운영 방식은 다음이 적절하다.

- slice 내부: 상대경로로 전체 경로 import
- slice 외부: alias를 통해 root `index.ts`만 import
- `index.ts`에서는 필요한 symbol만 명시 export하고 `export *` 금지
- `router.tsx`의 dynamic import는 `no-restricted-syntax` 또는 아래 graph 검사로 보완

새 의존성 없이도 기존 TypeScript compiler API를 사용하는 작은 `check-boundaries.mjs`를 작성해 SCC 순환 검사를 할 수 있다. 비용은 약 0.5–1일이지만, alias·type-only import·dynamic import 처리를 팀이 직접 유지해야 한다.

### 새 의존성이 필요한 선택지

권장안은 `dependency-cruiser` 하나다.

- 비용: direct devDependency 1개, production bundle 비용 0
- 초기 설정 및 CI 연결: 약 0.5일
- 검사:
  - module-level circular dependency
  - `scope: "folder"`를 이용한 feature 폴더 수준 순환
  - shared/service→feature 역방향
  - feature public API 우회
  - orphan 파일은 우선 warning

특히 module cycle이 없어도 폴더 간 cycle을 검출할 수 있어 현재 `rooms ↔ checklist` 상황에 맞는다. [dependency-cruiser folder/circular 규칙](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)

`eslint-plugin-boundaries`도 TypeScript와 flat config를 지원하고 editor에서 좋은 오류를 주지만, 지금은 core ESLint 규칙과 역할이 겹친다. feature 수나 예외가 증가할 때 도입하면 된다. [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)

`dependency-cruiser`, `eslint-plugin-boundaries`, Madge, Steiger를 동시에 넣을 필요는 없다. 이 저장소에는 ESLint core + dependency-cruiser 조합이면 충분하다.

검증상 제한도 있다. 현재 `frontend/node_modules`가 없어 실제 명령은 각각 `sh: tsc: command not found`, `sh: eslint: command not found`로 종료됐다. 따라서 위 결과는 파일 실측과 read-only import graph 분석에 기반하며, 설치 후 `npm run typecheck && npm run lint` 재검증이 필요하다.

**이 규모에서 가장 먼저 손댈 것 하나: Zustand persist와 JS cookie에서 `accessToken`을 제거해 인증 토큰을 메모리 단일 소스로 만드는 것이다.**
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
