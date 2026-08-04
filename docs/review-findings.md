# 교차 리뷰 발견 목록 (2026-08-04)

> **쉽게**: 하루 동안 돌린 검토 넷에서 나온 문제들을 한 자리에 모은 것.
> 언제 보나: 이슈를 올릴 때, 또는 "그 지적 어디 있었지"를 찾을 때.

이 문서는 **요약이지 정본이 아니다.**
각 항목의 정본은 `critical-review-artifacts/`의 아티팩트 파일이다.

## 이 목록의 성격

Atlas 구축이 끝난 뒤 이슈로 올릴 재료다.
**지금 고치지 않는다** — 코드가 움직이면 Atlas가 움직이는 대상을 쫓게 된다.

`[확인]`은 이 목록을 만들면서 파일을 직접 열어 재현한 것이다.
`[전달]`은 아티팩트의 지적을 옮긴 것이고 아직 직접 확인하지 않았다.

## 돌린 검토

| 대상 | 모델 | 결과 | 아티팩트 |
|---|---|---|---|
| registry 소재지 모순 | terra/high | REVISE, MAJOR 8 · MINOR 2 | `codex-front-layering-atlas-registry-r2-*` |
| java core 템플릿 | sol/xhigh | 승격 불가, MAJOR 14 · MINOR 2 | `codex-java-core-template-*` (템플릿 저장소) |
| Spring 패턴 중재 | sol/xhigh | 두 Claude 패스를 부분 기각 | `codex-spring-pattern-arbitration-*` |
| 프론트 구조 | sol/xhigh | 전면 개편 불필요, MAJOR 6 · MINOR 2 | `codex-frontend-architecture-*` |

첫 실행 하나는 분석 없이 끝났다(`...-registry-2026-08-04T00-14-03-*`).
이 저장소의 `AGENTS.md`가 codex를 `_wood` STEP 0/1 절차로 끌고 가
"진행할까요? (Y/N)"만 반환했다.
**exit code 0이었으나 통과가 아니라 미실행이었다** — 실행 시간(19초)과
응답 길이로 판정했다.

---

# 프론트엔드

## FE-1 인증 토큰이 두 곳에 영속화된다 [확인]

`store/use-auth-store.ts:17`의 `persist()`가 `accessToken`을 포함한 전체
auth store를 localStorage에 저장하고, 같은 토큰을 `lib/cookie.ts:6`이
`document.cookie`에도 기록한다.
쿠키에 `HttpOnly`도 `Secure`도 없다.

XSS 한 건이면 양쪽에서 읽힌다.
둘 중 하나만 갱신·정리되면 인증 상태가 갈린다.
OWASP는 인증 토큰의 localStorage 저장을 명시적으로 금지한다.

처방: `partialize`로 토큰을 영속화에서 빼고 메모리 단일 소스로 둔다.
서버 소비자가 없으면 쿠키 쓰기를 제거한다.
리뷰가 꼽은 **가장 먼저 손댈 것 하나**다.

## FE-2 tsconfig가 소스 대부분을 검사하지 않는다 [확인]

`tsconfig.json`의 `include`가 5개 파일만 명시한다 —
`main.tsx`, `vite-env.d.ts`, `app/router.tsx`, `app/provider.tsx`,
`services/get-query-client.ts`.

import로 도달하는 파일은 따라 들어가지만 **도달하지 않는 파일은 `tsc` 밖이다.**
실제로 `main.tsx`에서 도달 불가한 파일이 21개 642줄 있다 [전달].

그래서 레거시 경로가 타입 검사 없이 살아 있다.
`useCreateChecklist`는 `['checklists']`를 무효화하는데 실제 방 목록은
`['rooms']`를 쓴다 — 이름만 보고 쓰면 UI가 갱신되지 않는다 [전달].

처방: `include`를 `src/**/*`로 넓히고 도달 불가 코드를 정리한다.

## FE-3 feature 경계가 선언만 있고 강제되지 않는다 [확인]

`frontend/CLAUDE.md`가 feature 외부 import 금지와
`app → features → services` 방향을 선언한다.
그런데 공개 API(`index.ts`)가 하나도 없어 교차 import가 내부 경로를 직접 뚫는다.

역방향도 있다 [전달] — `components/Header.tsx`,
`components/BottomNavigation.tsx`, `components/ui/SectionIcon.tsx`,
`services/checklist-service.ts`가 feature를 참조한다.

**`index.ts`만 추가해도 해결되지 않는다.** 역방향과 폴더 순환이 남는다.

## FE-4 rooms ↔ checklist 폴더 순환 [확인, 등급 정정]

`rooms/pages/RoomsPage.tsx` → `checklist/hooks/use-checklist-items`,
`checklist/ChecklistNewPage.tsx` → `rooms/hooks/use-rooms-query`.

**런타임 ESM 순환은 아니다** [전달] — import graph 실측에서
`types/checklist.ts` ↔ `types/room.ts`의 type-only 순환 하나만 나왔다.
따라서 위험은 즉시 실패가 아니라 두 feature를 독립적으로 바꿀 수 없다는 것이다.

교차 import 6쌍은 성격이 갈린다.
`map/report → rooms/checklist`는 페이지가 데이터 기능을 조합하는 정상 의존이고,
문제는 페이지와 데이터 기능이 같은 `features` 층에 있다는 점이다.

처방: 여러 화면이 쓰는 `useRooms*`·`useChecklistItems`만 중립 `data/` 층으로.

## FE-5 customization이 서버·영속·트랜잭션을 한 단위에 겹친다 [전달]

같은 설정을 TanStack Query와 persisted Zustand 양쪽에 두고 수동
signature/ref로 동기화한다.
저장은 deselect→select→delete→add→settings를 순차 실행한다.

custom item 추가가 성공한 뒤 마지막 `saveSettings`가 실패하면 서버는 일부만
변경되고, 재시도하면 이미 성공한 항목을 다시 추가할 수 있다.

## FE-6 MapPage가 외부 시스템 책임까지 겹친다 [전달]

1068줄. 문제는 줄 수보다 결합이다 — SDK 타입 선언·loader, 지도 생명주기,
marker/geocoding, 필터·정렬, 600줄 UI가 한 파일에 있다.

처방: `useNaverMap`, 순수 geo/filter 함수, `MapRoomCardCompact` 세 덩어리만 추출.

## FE-8 기존 사용자에게는 토큰 제거가 적용되지 않는다 [전달]

2026-08-04에 FE-1을 고치면서 `partialize`로 `accessToken`을 persist에서 뺐다.
그런데 `partialize`는 **앞으로 저장할 것만** 줄인다.
`version`·`migrate`가 없어 이미 `auth-storage`에 저장된 구 데이터는
zustand 기본 `merge`로 다시 주입된다.

같은 이유로 이미 발급된 7일짜리 `accessToken` 쿠키도 만료되지 않는다.
`deleteTokenCookie` 호출을 없애면서 정리 경로까지 함께 사라졌다.

즉 **메모리 단일 소스는 새 사용자에게만 참이다.**

처방: persist에 `version` + `migrate`를 넣어 구 저장값에서 토큰을 떨어내고,
그 시점에 레거시 쿠키를 만료시킨다.

## FE-9 ESLint 경계 규칙에 우회 경로가 있다 [전달]

2026-08-04에 넣은 `no-restricted-imports`는 문자열 패턴 기반이라
다음이 뚫린다 — codex가 probe로 실측했다.

| 형태 | 결과 |
|---|---|
| `'@/features/...'` 정적 import | 막힘 |
| `'../features/...'` 상대경로 | **안 막힘** |
| `import('@/features/...')` dynamic | **안 막힘** |
| `import('axios')` dynamic | **안 막힘** |

현재 트리에 위반은 없으나 "경계를 ESLint가 강제한다"는 주장은 과장이다.

처방: `dependency-cruiser` 도입 시 함께 닫는다(리뷰 권장안).
그전까지는 ESLint가 정적 `@/` import만 막는다는 것을 계약에 명시한다.

## FE-10 e2e가 새 인증 계약을 검증하지 않는다 [전달]

`e2e/wave2/wave2-p0-3건.spec.ts:34`가 여전히 `auth-storage`에
`accessToken: 'fake-token'`을 seed한다.
"재수화 시 토큰 없음 → 401 → refresh 쿠키 → 메모리 set"이라는 새 계약을
검증하지 않고, 오히려 FE-8의 레거시 누수를 재현하는 fixture다.

## FE-7 선언된 스택과 실제 사용이 다르다 [확인]

`react-hook-form`, `zod`, `@hookform/resolvers`,
`react-intersection-observer`, `class-variance-authority` —
다섯 전부 `src`와 `e2e`에서 import 0건이다.

폼을 RHF/Zod로 전환하라는 뜻이 아니다. 안 쓰는 의존성을 지우는 쪽이 맞다.

---

# 백엔드

백엔드는 **이번 범위가 아니다** — Atlas 구축 중에는 건드리지 않는다.
아래는 Spring 패턴 중재에서 나온 것이고, 이관 브랜치
(`feat/atlas-page-canvas`)가 아니라 **main 코드에도 해당하는 것만** 추렸다.

## BE-1 방 6개 상한이 경쟁 상태에서 뚫린다 [확인]

`api/room/service/RoomService.java:34`와 `:79`에
`countByUserIdAndIsDeletedFalse(userId) >= 6` 검사가 있고 락이 없다.
방 5개 사용자의 동시 2건 요청이 7개를 만들 수 있다.

registry의 `BC-REG-05`가 이 결함을 이미 등재하고 있다.
**리팩토링이 만든 것이 아니라 레거시에 원래 있던 것**이다.

## BE-2 report만 응답 봉투를 쓰지 않는다 [확인]

`api/report/controller/ReportController.java:21,30`이
`ResponseEntity<ReportInfoResponseDTO>`와 `ResponseEntity<CompareRoomResponseDTO>`를
봉투 없이 반환한다.
나머지는 전부 `ResponseEntity<ApiResponse<T>>`다.

클라이언트가 이 두 엔드포인트만 분기 처리해야 한다.

## BE-3 slice-local 예외 핸들러가 전역에 걸린다 [확인]

`feature/roomregistration/adapter/web/RoomRegistrationExceptionHandler.java:28`의
`@RestControllerAdvice`에 `basePackages`도 `assignableTypes`도 없다.
폴더만 slice 안에 있을 뿐 Spring MVC 전체에 적용되고,
`@Order(HIGHEST_PRECEDENCE)`라 전역 핸들러보다 먼저 평가된다.

*이 항목은 `feat/atlas-page-canvas`에만 있다 — main에는 해당 파일이 없다.*

## BE-4 Java 소스 트리에 Flyway SQL 복제본 [확인]

`global/common/exception/V13__add_room_fields.sql`.
정본은 `src/main/resources/db/migration`에 있고 checksum도 같다.

## BE-5 AD-2 의존 방향을 검사하는 장치가 없다 [확인]

`build.gradle`에 ArchUnit도 Spring Modulith도 없다.
`feature/*/application`이 repository를 직접 import하지 않는다는 규칙이
사람 리뷰로만 지켜진다.

---

# Atlas / registry

## AT-1 resolver의 검사 구멍 셋 [전달]

- `defects`의 `relatedFeature`를 검사하지 않는다 — registry에 없는
  feature를 가리켜도 통과한다
- `frontendEntry`가 schema에 있으나 required가 아니고 resolver도 안 본다
- `uses`는 operation ID 존재를 확인하지 않고 route 문자열만 본다

그래서 "검사 N건 위반 0건"은 **현 validator 범위에서만 참**이다.

## AT-2 registry가 제품 표면의 36%만 덮는다 [확인]

route oracle 28개 중 등재 10개.
미등재 18개는 checklist 8, map 4, auth 3, report 2, directions 1이다.

`defects.yaml`이 이미 `FT-CHECKLIST-CATALOG`,
`FT-CHECKLIST-CUSTOM-ITEM`, `FT-CHECKLIST-SETTINGS`,
`FT-REPORT-COMPARE`, `FT-REPORT-INFO`를 참조하는데 그 파일이 없다.
**ID를 발명할 자리가 아니라 이미 참조되는 ID에 실체를 채울 자리다.**

## AT-3 카드와 registry의 축이 다르다 [확인]

registry는 `CAPABILITY → FEATURE → OPERATION`,
카드는 `PAGE → 상태 → DOM 영역`이다.
카드의 `operationId`는 `checklist.saveSettings` 형식이고 registry는 `OP-*`라
겹치는 값이 0이다.

다만 **조인 하나는 이미 살아 있다** — 카드의 `defects: ['BC-CHK-03']`이
`defects.yaml`에 실존한다(BC-CHK-01~06 전부 확인).

축이 안 맞아서가 아니라 **registry가 checklist를 아직 안 덮어서** 이을 대상이
없는 것이다. AT-2가 풀리면 이 문제도 성격이 바뀐다.

---

# 2026-08-04 처리 현황

| 항목 | 상태 |
|---|---|
| FE-1 토큰 중복 영속화 | **부분 해소** — 신규 사용자만. 기존 사용자는 FE-8 |
| FE-2 tsconfig 범위 | **해소** — `src/**/*`, 도달불가 22파일 654줄 삭제 |
| FE-3 공유→feature 역참조 | **해소** — `app/layout`·report로 이동, 역참조 0 |
| FE-7 미사용 의존성 | **해소** — 5개 제거 |
| FE-4·5·6 | 미착수 |
| FE-8·9·10 | 위 수정이 만들었거나 남긴 것 |

수정 검증(codex terra, 명령 직접 실행): typecheck 통과,
lint 에러 6·경고 3으로 착수 전 기준선 동일, build 성공,
import graph 90모듈 순환 0.

착수 중 회귀 하나를 만들고 같은 날 닫았다 — 토큰 재발급이 `setAuth`를 타
새로고침마다 커스터마이징을 지웠다.
`refreshToken`을 따로 두어 해소(`1b0ca05`).
**"고치는 변경이 회귀를 만든다"는 것을 검증 패스가 잡았다.**

# 이슈로 올릴 때의 순서

리뷰들이 공통으로 지목한 것은 **"규율은 선언돼 있는데 기계가 안 지킨다"**이다.
프론트(FE-3)와 백엔드(BE-5)와 Atlas(AT-1)에서 같은 병이 세 번 나왔다.

1. **FE-1** — 유일하게 보안 등급이다. 다른 것과 독립적으로 지금 고칠 수 있다.
2. **FE-2** — 고치는 순간 숨어 있던 타입 오류가 드러난다. 정리 작업의 입구다.
3. **AT-2** — Atlas 구축의 본작업. 코드를 안 바꾸므로 병행 가능하다.
4. **AT-1** — AT-2가 끝나야 검사를 걸 수 있다(빈칸에서 전부 실패하므로).
5. 나머지 — Atlas가 서고 난 뒤.

BE 계열은 전부 5번이다. 지금 백엔드를 건드리면 Atlas가 움직이는 대상을 쫓는다.
