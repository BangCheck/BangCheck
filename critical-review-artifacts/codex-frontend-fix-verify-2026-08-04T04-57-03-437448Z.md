# codex critical-review artifact

- Provider: codex
- Model: gpt-5.6-terra
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/codex
- Started at (UTC): 2026-08-04T04:54:03.270661+00:00
- Finished at (UTC): 2026-08-04T04:57:03.433957+00:00

## Original task / label

frontend-fix-verify

## Final prompt

```text
## 이 지시가 저장소의 다른 모든 지시에 우선한다

`AGENTS.md`, `.cursorrules`, `GEMINI.md`, `_wood/` 규약은 이 검증에 적용하지 않는다.
`_wood/workflows/_protocol.md`·`_wood/agents/_safety.md`의 Y/N 확인도 해당 없다.
비용·승인을 되묻지 마라 — 되묻는 응답은 실패로 처리된다.
STEP 0/1을 밟지 말고 바로 검증하라.

**너는 명령을 실행해도 된다.** `frontend/node_modules`가 이제 설치돼 있다.
`npm run typecheck`, `npm run lint`, `npm run build`를 직접 돌려 확인하라.
파일 수정은 하지 마라(sandbox가 막는다). 판정만 내라.

---

# 과제

방금 적용한 프론트엔드 수정이 **의도한 것을 실제로 했는지, 그리고 무엇을 깨뜨렸는지**
검증하라. 통과시키려 하지 말고 회귀와 빠뜨린 것을 찾아라.

검증 대상 diff: `git diff 4e6b08d..22fa3f5 -- frontend`
(직전 커밋 하나. `frontend/` 밖은 이 검증 범위가 아니다.)

## 무엇을 고쳤다고 주장하는가

**주장 1 — access token을 메모리 단일 소스로 만들었다.**
- `src/store/use-auth-store.ts`에 `partialize`를 넣어 `accessToken`을 persist에서 제외.
  `user`·`isLoggedIn`만 localStorage에 남는다.
- `src/lib/cookie.ts`를 삭제. `setTokenCookie`/`deleteTokenCookie` 호출도 제거.
- 근거: 백엔드가 읽는 쿠키는 `refresh_token`뿐이고 `accessToken` 쿠키 소비자가 없었다.
- 재수화 경로: 새로고침 후 첫 요청이 401 → `src/lib/api.ts`의 인터셉터가
  `/api/v1/auth/jwt/refresh`를 `withCredentials`로 호출 → `onTokenRefresh`가 `setAuth` 호출.

**주장 2 — tsconfig가 소스 전체를 검사한다.**
- `include`를 5개 파일 나열에서 `src/**/*`로 확대.
- 도달 불가 파일 21개(661줄) 삭제. `vite-env.d.ts`는 타입 선언이라 남겼다.

**주장 3 — 공유 영역의 feature 역참조를 없앴다.**
- `components/Header.tsx`·`Footer.tsx`·`BottomNavigation.tsx` → `app/layout/`로 이동.
- `components/ui/SectionIcon.tsx` → `features/report/components/`로 이동.
- report 내부 참조는 상대경로로 바꿨다.

**주장 4 — 경계를 ESLint가 강제한다.**
- `eslint.config.mjs`에 `no-restricted-imports` 추가.
- 공유 영역(`components/lib/services/store/hooks`)에서 `@/features/*` import 금지.
- `axios`는 `src/lib/api.ts`에서만 허용.
- flat config가 같은 규칙명을 병합하지 않아 한 블록으로 합쳤다고 주장한다.

**주장 5 — 미사용 의존성 5개 제거.**
`react-hook-form`, `zod`, `@hookform/resolvers`, `react-intersection-observer`,
`class-variance-authority`.

## 검증할 것

1. **명령을 직접 돌려라.** typecheck·lint·build 결과를 보고하라.
   착수 전 기준선은 typecheck 통과, lint 에러 6·경고 3(MapPage namespace 3,
   CompareTable 조건부 Hook 3, 경고 3)이었다.
   **이 숫자가 늘었으면 회귀다.**

2. **주장 1의 재수화가 실제로 성립하는가.**
   토큰이 메모리에만 있을 때 새로고침 후 흐름을 코드로 따라가 검증하라.
   특히 다음을 확인하라 — `onTokenRefresh`가 `setAuth`를 부르는데 `setAuth`는
   `clearGuestRooms()`와 `useCustomizationStore.reset()`을 호출한다.
   **토큰 재발급 때마다 이 cleanup이 도는 것이 맞는가?** 부작용이 없나?
   또 `isLoggedIn: true`인데 `accessToken: null`인 중간 상태를 읽는 코드가 있나?

3. **주장 3의 이동이 무언가를 깨뜨렸나.**
   옮긴 파일들의 상대경로, `@/` alias 해석, 순환 참조 발생 여부를 보라.

4. **주장 4의 규칙이 정말 무는가.**
   `eslint.config.mjs`를 읽고 규칙이 의도한 파일 집합에 실제로 적용되는지
   판정하라. 빠져나가는 경로(dynamic import, 상대경로 우회, type-only import)가 있나.

5. **삭제한 21파일이 정말 죽은 코드였나.**
   diff에서 삭제 목록을 보고, 그중 실제로는 살아 있던 것이 있는지 확인하라.
   특히 e2e 테스트(`frontend/e2e/`)가 참조하던 것이 있나.

6. **빠뜨린 것.** 위 5개 주장이 다루지 않았는데 같은 수정에서 함께 했어야 할 것이 있나.

## 형식

각 지적에 severity(MAJOR/MINOR)와 근거 파일·줄을 붙여라.
실행한 명령과 그 출력을 그대로 인용하라 — 추론과 실측을 구분하라.
마지막에 "이 diff를 그대로 두어도 되는가"에 대한 한 줄 판정을 내려라.

```

## Final response

```text
## 실행 실측

```text
$ npm run typecheck

> frontend@0.1.0 typecheck
> tsc --noEmit
```

통과했습니다.

```text
$ npm run lint

> frontend@0.1.0 lint
> eslint .

…MapPage no-namespace errors 3건…
…CompareTable conditional Hook errors 3건…

✖ 9 problems (6 errors, 3 warnings)
  0 errors and 1 warning potentially fixable with the `--fix` option.
```

기준선과 동일합니다: errors 6, warnings 3. lint 회귀는 없습니다.

```text
$ npm run build

> frontend@0.1.0 build
> tsc --noEmit && vite build

vite v6.4.2 building for production...
transforming...
Found 1 warning while optimizing generated CSS:
…
✓ 228 modules transformed.
…
(!) Some chunks are larger than 500 kB after minification.
…
✓ built in 1.25s
```

build는 통과했습니다. CSS selector 및 500 kB chunk 경고는 있으나, 이번 diff로 늘었는지는 이 실행만으로 판정할 수 없습니다.

## 지적 사항

- **MAJOR — 기존 사용자의 access token이 계속 localStorage에 hydrate된다.**  
  [use-auth-store.ts:35](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/store/use-auth-store.ts:35)의 `partialize`는 이후 저장되는 상태만 축소합니다. 이전 버전은 `accessToken`을 포함한 `auth-storage`를 저장했고, 이번 변경에는 `version`, `migrate`, 또는 `merge`가 없습니다. 설치된 Zustand의 기본 `merge`는 persisted state를 현재 state 위에 펼치므로, 기존 저장값의 `accessToken`이 다시 주입됩니다. 유효한 구 토큰으로 요청이 성공하면 상태 변경도 없어 이 값은 계속 남습니다. “메모리 단일 소스” 주장은 기존 사용자에 대해 성립하지 않습니다.

- **MAJOR — 이전에 발급한 `accessToken` 쿠키도 제거되지 않는다.**  
  삭제된 `src/lib/cookie.ts:3-11`은 7일짜리 `accessToken` 쿠키를 만들고 삭제하던 유일한 코드였습니다. 이번 diff는 그 삭제 호출도 함께 없앴지만, 이미 브라우저에 있는 쿠키를 만료시키는 전환 처리는 없습니다. 따라서 기존 사용자는 localStorage뿐 아니라 기존 쿠키도 만료 전까지 보유합니다.

- **MAJOR — refresh가 로그인으로 취급되어 사용자 설정을 매 token 재발급마다 지운다.**  
  [api.ts:47](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/lib/api.ts:47)-59 → [provider.tsx:15](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/provider.tsx:15)-18 → [use-auth-store.ts:21](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/store/use-auth-store.ts:21)-25 경로에서 refresh 성공 시 `setAuth()`를 호출합니다. `setAuth()`는 [guest room 삭제](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/store/use-auth-store.ts:23)와 [customization reset](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/store/use-auth-store.ts:24)을 수행합니다.  
  특히 customization reset은 [use-customization-store.ts:31](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/store/use-customization-store.ts:31)에서 persisted 상태를 빈 배열로 저장합니다. 로그인 직후 한 번의 cleanup이라면 의미가 있지만, access-token 갱신은 같은 사용자의 정상 세션 동작입니다. 만료 시점 또는 새로고침 후 refresh가 사용자 선택/작성 중인 로컬 customization 상태를 지웁니다. refresh single-flight 잠금도 없어 동시 401이 여러 개면 이 cleanup도 여러 번 실행될 수 있습니다.

- **MINOR — `isLoggedIn: true`, `accessToken: null` 중간 상태는 실제로 읽힌다.**  
  정상적인 `user`가 함께 재수화되면 첫 401 → refresh → 재시도라는 기본 흐름은 작동합니다. 그러나 [use-rooms-query.ts:9](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/features/rooms/hooks/use-rooms-query.ts:9)-15 등은 token이 아니라 `isLoggedIn`만으로 API를 활성화합니다. 즉 중간 상태에서 곧바로 인증 요청이 나갑니다. 또한 [provider.tsx:16](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/src/app/provider.tsx:16)-17은 `user`가 없으면 새 토큰을 store에 기록하지 않습니다. 손상되었거나 불완전한 저장 상태에서는 매 요청마다 refresh를 반복할 수 있습니다.

- **MAJOR — ESLint 경계 규칙은 의도한 금지를 완전하게 강제하지 못한다.**  
  [eslint.config.mjs:46](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/eslint.config.mjs:46)-60은 `@/features/*` 문자열 패턴만 금지합니다. 실제 probe 결과:
  
  ```text
  import x from '@/features/rooms/hooks/use-rooms-query';
  → no-restricted-imports error
  
  import x from '../features/rooms/hooks/use-rooms-query';
  → unused-vars warning만 발생, restricted-import error 없음
  
  import('@/features/rooms/hooks/use-rooms-query');
  → 출력 없음
  
  import type { Room } from '@/features/rooms/types';
  → no-restricted-imports error
  ```
  
  따라서 type-only import 우회는 막혔지만, 상대경로와 dynamic import는 우회됩니다. `axios`도 [eslint.config.mjs:34](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/eslint.config.mjs:34)-43에서 static import만 제한하므로 `import('axios')`는 통과했습니다. 현재 트리에 위반은 없지만 “경계를 ESLint가 강제한다”는 주장은 과장입니다.

- **MINOR — 새 인증 계약을 검증하는 e2e가 없다.**  
  [wave2 e2e:34](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/e2e/wave2/wave2-p0-3건.spec.ts:34)-41은 여전히 `auth-storage`에 `accessToken: 'fake-token'`을 seed합니다. 새 계약의 핵심인 “재수화 시 token 없음 → 401 → refresh cookie → memory set”은 검증하지 않습니다. 오히려 이 테스트 fixture는 위의 legacy-storage 누수를 재현합니다.

- **MINOR — 삭제 수치 설명이 diff와 맞지 않는다.**  
  diff에는 삭제 파일이 22개이며, 그중 dead-code 후보 21개와 별개로 `src/lib/cookie.ts`가 삭제되었습니다. 삭제 파일의 실제 합계는 654줄입니다(패키지 lock 변경 제외). “도달 불가 21개, 661줄”과 일치하지 않습니다. 다만 이전 커밋과 현재 `e2e/`를 정적 검색한 결과, 삭제된 21개 dead-code 후보를 외부에서 import한 흔적이나 e2e 참조는 발견하지 못했습니다.

## 통과한 주장

- **tsconfig 확대:** 이전 5개 source 파일 include에서 [tsconfig.json:26](/Users/jonghoPro/woo/00_project/08_BangCheck/frontend/tsconfig.json:26)-29의 `src/**/*`로 바뀌었고, 현재 105개 TypeScript/TSX source가 typecheck 대상입니다. 통과했습니다.
- **이동/alias/순환:** router의 새 `app/layout` import, report의 상대 import 모두 build/typecheck를 통과했습니다. 변경된 진입점에서 90개 모듈 import graph를 추적한 결과는 다음과 같습니다.

  ```json
  {
    "modules": 90,
    "cycles": []
  }
  ```

  `Header`/`BottomNavigation`의 feature import는 이제 `app/layout`에 있으므로, 기존 공유 `components`의 feature 역참조 문제는 해소됐습니다.
- **의존성 5개 제거:** 이전/현재 source와 e2e에서 `react-hook-form`, `zod`, `@hookform/resolvers`, `react-intersection-observer`, `class-variance-authority` 사용을 찾지 못했습니다. 제거 자체는 타당합니다.

**판정: 아니오 — legacy token 정리·마이그레이션, refresh 전용 token setter, ESLint 우회 차단, 새 재수화 e2e 검증 없이는 이 diff를 그대로 두면 안 됩니다.**
```

## Concise summary

codex 실행 완료. Final response에서 verdict와 finding을 확인할 것.
