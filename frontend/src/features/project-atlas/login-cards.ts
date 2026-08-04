import type { AtlasPageCards } from '@/types/atlas-card';

/**
 * 로그인 화면(/login)의 카드.
 *
 * 이 페이지가 스스로 부르는 서버 경로는 하나뿐이다 — GET /api/v1/auth/oauth2/{provider}.
 * 기계가 뽑은 목록에 함께 있는 GET /api/v1/rooms는 이 페이지의 것이 아니다.
 * LoginPage.tsx에는 useRoomsList 호출이 없고, /login이 AppLayout 아래 라우트라
 * Header(#L21)와 BottomNavigation(#L42)이 그 훅을 부른다. 게다가 그 훅은
 * enabled: isLoggedIn이라 이 화면이 그려지는 조건(비로그인)에서는 요청이 나가지 않는다.
 * 자세한 판정은 L.00에 적었다.
 *
 * 모든 항목은 2026-08-04 기준 소스를 읽고 적었다. id는 data-atlas-node 값과 같다.
 */
export const LOGIN_PAGE_CARDS: AtlasPageCards = {
  pageId: 'login',
  title: '로그인',
  route: '/login',
  previewSrc: '/login?atlasPreview=1',
  // 로그인 상태로 들어오면 화면을 그리지 않고 /rooms로 보낸다(LoginPage.tsx#L130).
  // 즉 "로그인 후 로그인 화면"은 존재하지 않는다 — 상태 탭을 두지 않는 이유다.
  states: [],
  cards: [
    {
      id: 'login-guard',
      code: 'L.00',
      title: '진입 가드 · 레이아웃 유래 호출',
      status: 'LIVE',
      headline: '로그인 상태면 화면을 그리지 않는다. 이 페이지 자신은 방 목록을 부르지 않는다',
      overview: {
        what: '이미 로그인한 사람이 /login에 오면 화면을 그리지 않고 방 목록으로 보낸다. 함께 이 카드에 "이 화면에서 관측되는 서버 호출 중 무엇이 페이지의 것이고 무엇이 레이아웃의 것인가"를 적는다.',
        where: '화면에 보이지 않는다. DOM 마커가 없고 카드로만 존재한다.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '주소창이나 다른 화면의 로그인 버튼으로 /login에 들어온다',
          source: null,
        },
        {
          actor: 'FRONT',
          step: 'useAuthStore의 isLoggedIn을 읽어 참이면 navigate(ROUTES.HOME, { replace: true }) 후 null을 반환한다. 랜딩이 <Navigate>를 반환하는 것과 달리 렌더 중에 navigate를 부른다',
          source: 'LoginPage.tsx#L130',
        },
        {
          actor: 'FRONT',
          step: 'Atlas 미리보기(DEV + atlasPreview=1)에서는 이 이동을 건너뛴다. 랜딩과 같은 처리다',
          source: 'LoginPage.tsx#L128, src/lib/use-atlas-preview.ts',
        },
        {
          actor: 'FRONT',
          step: '/login은 AppLayout 아래 라우트라 Header·Footer·BottomNavigation이 함께 그려진다. 그 둘이 useRoomsList()를 부른다 — LoginPage.tsx에는 그 훅이 없다',
          source: 'src/app/router.tsx, Header.tsx#L21, BottomNavigation.tsx#L42',
        },
        {
          actor: 'FRONT',
          step: 'useRoomsList는 enabled: isLoggedIn이다. 이 화면이 실제로 그려지는 조건은 비로그인이므로 그 요청은 나가지 않는다. 로그인 상태로 /login에 오면 같은 렌더에서 /rooms로 떠나므로, 요청이 나가더라도 이 화면의 데이터로 쓰이지 않는다',
          source: 'use-rooms-query.ts#L13',
        },
        {
          actor: 'FRONT',
          step: '/login은 PROTECTED_ROUTES에 없다. 이 화면 자체는 보호 대상이 아니다',
          source: 'src/lib/routes.ts',
        },
      ],
      api: [
        {
          operationId: 'login.routeGuard',
          summary: '로그인 여부로 이 화면을 그릴지 가른다',
          method: 'CLIENT',
          path: 'navigate(ROUTES.HOME, { replace: true })',
          security: 'PUBLIC — 서버 호출 없이 클라이언트 store만 읽는다',
          request: null,
          responses: [
            { code: 'navigate /rooms', when: 'isLoggedIn === true (미리보기 아님)' },
            { code: 'render', when: 'isLoggedIn === false 또는 atlasPreview=1' },
          ],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
        {
          operationId: 'OP-ROOM-LIST',
          summary: '방 목록 — 이 페이지가 아니라 AppLayout이 부른다',
          method: 'GET',
          path: '/api/v1/rooms',
          security: 'JWT (registry FT-ROOM-LIST auth: JWT)',
          request: '없음. 호출 주체는 Header#L21과 BottomNavigation#L42이며 두 곳의 queryKey가 같아 한 요청으로 합쳐진다',
          responses: [
            { code: 'skip', when: '비로그인 — enabled: false라 요청이 나가지 않는다. /login이 그려지는 정상 조건이 이것이다' },
            { code: '200', when: '로그인 상태로 /login에 진입한 순간 — 다만 같은 렌더에서 /rooms로 이동한다' },
          ],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'login-oauth',
          label: '소셜 로그인 버튼',
          relation: 'USED_BY',
          note: '이 가드가 통과해야 버튼이 화면에 나온다.',
        },
        {
          targetId: null,
          label: '랜딩 · 페이지 진입 가드',
          relation: 'SHARES_CODE',
          note: '두 화면 모두 로그인 상태면 ROUTES.HOME으로 보낸다. 방식이 다르다 — 랜딩은 <Navigate>를 반환하고 이쪽은 렌더 중에 navigate()를 부른다.',
        },
        {
          targetId: null,
          label: 'AuthCallbackPage',
          relation: 'USED_BY',
          note: 'OAuth가 끝나면 /auth/callback/{provider}가 토큰을 교환하고 /rooms로 보낸다. 그 화면은 AppLayout 밖이라 헤더가 없다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/login/LoginPage.tsx', symbol: 'LoginPage' },
        { layer: 'FRONT', path: 'src/app/router.tsx', symbol: 'AppLayout' },
        { layer: 'FRONT', path: 'src/app/layout/Header.tsx', symbol: 'Header' },
        { layer: 'FRONT', path: 'src/app/layout/BottomNavigation.tsx', symbol: 'BottomNavigation' },
      ],
      defects: [],
    },

    {
      id: 'login-intro',
      code: 'L.01',
      title: '로고 · 안내 문구',
      status: 'LIVE',
      headline: '정적 문구. 게스트로 쓰면 데이터가 안 남는다고 여기서만 말한다',
      overview: {
        what: '로고와 두 줄 인사, 그리고 "비로그인시 데이터가 저장되지 않습니다" 한 줄. 모두 하드코딩된 문구이고 서버에서 받지 않는다.',
        where: '카드 상단. 데스크톱과 모바일이 같은 LoginCard를 크기만 바꿔 두 번 렌더한다(hidden md:flex / flex md:hidden).',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'LogoWithText와 고정 문구를 그린다. 상호작용이 없다',
          source: 'LoginPage.tsx#L87',
        },
        {
          actor: 'FRONT',
          step: '"비로그인시 데이터가 저장되지 않습니다"가 게스트 모드의 유일한 안내다. 실제로 게스트 방은 브라우저 store에만 쌓이고 한도(GUEST_ROOM_LIMIT)가 따로 있다',
          source: 'LoginPage.tsx#L101, src/store/use-guest-room-store.ts',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'login-oauth',
          label: '소셜 로그인 버튼',
          relation: 'SHARES_CODE',
          note: '같은 LoginCard 컴포넌트 안에 있고 sizeClass만 데스크톱·모바일로 갈린다.',
        },
        {
          targetId: null,
          label: '게스트 방 한도 (지도 · 방 목록)',
          relation: 'INCONSISTENT_WITH',
          note: '여기서는 "저장되지 않습니다"라고만 하고 한도가 있다는 말은 없다. 한도는 다른 화면에서 모달로 처음 알려 준다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/login/LoginPage.tsx', symbol: 'LoginCard' },
        { layer: 'FRONT', path: 'src/components/Logo.tsx', symbol: 'LogoWithText' },
      ],
      defects: [],
    },

    {
      id: 'login-oauth',
      code: 'L.02',
      title: '소셜 로그인 버튼',
      status: 'BOUND',
      headline: '이 화면이 서버를 부르는 유일한 곳. 받은 주소로 브라우저를 통째로 넘긴다',
      overview: {
        what: '네이버·구글 두 버튼. 누르면 서버에 provider별 인가 URL을 물어보고, 받은 주소로 window.location.href를 바꿔 이 앱을 떠난다.',
        where: '안내 문구 아래. 두 버튼이 세로로 놓인다.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '네이버 또는 Google 버튼을 누른다',
          source: 'LoginPage.tsx#L14',
        },
        {
          actor: 'FRONT',
          step: 'loadingProvider를 세워 두 버튼을 비활성하고 라벨을 "로그인 중..."으로 바꾼다',
          source: 'LoginPage.tsx#L33, LoginPage.tsx#L48',
        },
        {
          actor: 'BACK',
          step: 'GET /api/v1/auth/oauth2/{provider}가 서명 JWT로 state를 즉석 생성해 authorizeUrl에 실어 돌려준다. 서버에 저장하는 것은 없다',
          source: 'global/auth/oauth/service/OAuthStateService.java#generateState',
        },
        {
          actor: 'FRONT',
          step: 'window.location.href = url — SPA 이동이 아니라 문서 전체 이동이다. 여기서 앱을 떠난다',
          source: 'LoginPage.tsx#L19',
        },
        {
          actor: 'FRONT',
          step: '요청이 실패하면 provider를 가리지 않는 고정 문구 "로그인에 실패하였습니다. 다시 시도해주세요."만 띄우고 버튼을 되살린다. 상태 코드도 원인도 화면에 남지 않는다',
          source: 'LoginPage.tsx#L21',
        },
        {
          actor: 'BACK',
          step: '돌아온 뒤의 코드 교환은 이 화면이 아니라 /auth/callback/{provider}가 한다',
          source: 'src/features/auth/AuthCallbackPage.tsx#exchangeOAuthCode',
        },
      ],
      api: [
        {
          operationId: 'OP-AUTH-OAUTH-AUTHORIZE',
          summary: 'provider별 인가 URL을 받는다',
          method: 'GET',
          path: '/api/v1/auth/oauth2/{provider}',
          security: 'PUBLIC — SecurityConfig의 authBasePath + authOauthBasePath + "/**" permitAll (registry FT-AUTH-OAUTH-LOGIN auth: PUBLIC)',
          request: 'path: provider — 이 화면이 보내는 값은 naver · google 둘뿐이다',
          responses: [
            { code: '200', when: 'ApiResponse.data.authorizeUrl — 곧바로 그 주소로 문서를 옮긴다' },
            { code: 'error', when: '어떤 실패든 화면에는 같은 한 문장만 나온다' },
          ],
          safety: {
            sideEffect: 'READ',
            writes: [],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
      ],
      related: [
        {
          targetId: 'login-guard',
          label: '진입 가드',
          relation: 'USES',
          note: '로그인에 성공해 돌아오면 이 화면은 더 이상 그려지지 않는다.',
        },
        {
          targetId: null,
          label: 'OP-AUTH-OAUTH-CALLBACK (/api/v1/auth/oauth2/{provider}/callback)',
          relation: 'USES',
          note: '여기서 만든 state가 그 경로에서 검증된다. 같은 feature(FT-AUTH-OAUTH-LOGIN)의 두 operation이다.',
        },
        {
          targetId: null,
          label: '랜딩 · 기능 소개의 LoginRequiredModal',
          relation: 'USED_BY',
          note: '다른 화면의 "로그인" 선택지가 전부 /login으로 들어와 이 두 버튼에 도달한다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/login/LoginPage.tsx', symbol: 'useOAuthLogin' },
        { layer: 'FRONT', path: 'src/services/auth-service.ts', symbol: 'getOAuthAuthorizeUrl' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/auth/controller/AuthController.java', symbol: 'authorize' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/global/auth/oauth/service/OAuthStateService.java', symbol: 'generateState' },
      ],
      // BC-AUTH-01: 여기서 만드는 state가 1회용이 아니다(TTL 안에서 재사용 가능).
      // BC-AUTH-90: 같은 auth-service.ts에 백엔드에 없는 /api/v1/users/me를 부르는 죽은 함수가 있다.
      // BC-AUTH-90(죽은 getCurrentUser)은 뺐다. 같은 파일에 있을 뿐 이 버튼의
      // 흐름이 부르지 않아 사용자에게 나타나지 않는다.
      defects: ['BC-AUTH-01'],
    },

    {
      id: 'login-terms',
      code: 'L.03',
      title: '약관 · 개인정보 링크',
      status: 'MOCK',
      headline: '두 링크 모두 갈 곳이 라우터에 없다. 눌러도 랜딩으로 되돌아온다',
      overview: {
        what: '"시작하기를 누르면 이용약관 및 개인정보 처리방침에 동의하게 됩니다" 한 줄과 두 링크. 동의 체크박스는 없고, 버튼을 누르는 행위 자체가 동의로 처리된다.',
        where: '카드 최하단.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '"이용약관" 또는 "개인정보 처리방침"을 누른다',
          source: 'LoginPage.tsx#L67, LoginPage.tsx#L69',
        },
        {
          actor: 'FRONT',
          step: '/terms · /privacy 라우트가 router.tsx에 없다. AppLayout의 마지막 "*" 라우트에 걸려 랜딩(/)으로 replace 이동한다 — 약관 내용을 볼 방법이 화면에 없다',
          source: 'src/app/router.tsx',
        },
      ],
      api: [
        {
          operationId: 'login.terms.openDocument',
          summary: '약관 문서로 이동한다 (대상 라우트 없음)',
          method: 'CLIENT',
          path: 'Link to /terms | /privacy',
          security: 'PUBLIC — 서버 호출 없음',
          request: null,
          responses: [
            { code: 'navigate /', when: '항상 — 정의된 라우트가 없어 "*"가 랜딩으로 보낸다' },
          ],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'login-oauth',
          label: '소셜 로그인 버튼',
          relation: 'INCONSISTENT_WITH',
          note: '문구는 버튼을 누르면 두 문서에 동의한 것이라고 말하는데, 그 문서를 여는 경로가 앱에 존재하지 않는다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/login/LoginPage.tsx', symbol: 'TermsText' },
        { layer: 'FRONT', path: 'src/app/router.tsx', symbol: 'Router' },
      ],
      defects: [],
    },
  ],
};
