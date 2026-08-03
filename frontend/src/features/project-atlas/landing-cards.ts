import type { AtlasPageCards } from '@/types/atlas-card';

/**
 * 랜딩 페이지의 카드.
 *
 * 모든 항목은 2026-08-03 기준 소스를 읽고 적었다. 추정한 곳은 없고,
 * 확인하지 못한 칸은 비우는 대신 그 사실을 문장으로 적었다.
 * id는 제품 DOM의 data-atlas-node 값과 같아야 한다 — 그 값이 카드와 화면 영역을 잇는다.
 */
export const LANDING_PAGE_CARDS: AtlasPageCards = {
  pageId: 'landing',
  title: '첫 진입 · 랜딩',
  route: '/',
  previewSrc: '/?atlasPreview=1',
  // 랜딩은 로그인 상태로 들어오면 화면을 그리지 않고 /rooms로 보낸다(LandingPage.tsx#L55).
  // 즉 "로그인 후 랜딩"이라는 화면은 존재하지 않는다 — 상태 탭을 만들지 않는 이유다.
  states: [],
  cards: [
    {
      id: 'landing-route-guard',
      code: 'S.00',
      title: '페이지 진입 가드',
      status: 'LIVE',
      headline: '로그인 상태면 랜딩을 건너뛴다',
      overview: {
        what: '랜딩에 들어온 사람이 이미 로그인돼 있으면 화면을 그리지 않고 방 목록으로 보낸다.',
        where: '화면에 보이지 않는다. 페이지 전체를 감싸는 판정이라 카드로만 존재한다.',
      },
      behaviour: [
        { actor: 'USER', step: '주소창이나 링크로 / 에 들어온다', source: null },
        {
          actor: 'FRONT',
          step: 'useAuthStore의 isLoggedIn을 읽는다',
          source: 'src/store/use-auth-store.ts',
        },
        {
          actor: 'FRONT',
          step: '로그인 상태이고 Atlas 미리보기가 아니면 /rooms로 replace 이동한다',
          source: 'LandingPage.tsx#L55',
        },
        {
          actor: 'FRONT',
          step: '비로그인이면 Hero · 후기 · 기능 소개 세 섹션을 그린다',
          source: 'LandingPage.tsx#L59',
        },
      ],
      api: [
        {
          operationId: 'landing.routeGuard',
          summary: '로그인 여부로 랜딩 렌더 여부를 가른다',
          method: 'CLIENT',
          path: 'Navigate(ROUTES.HOME, { replace: true })',
          security: 'PUBLIC — 서버 호출 없이 클라이언트 store만 읽는다',
          request: null,
          responses: [
            { code: 'navigate', when: 'isLoggedIn === true (미리보기 아님)' },
            { code: 'render', when: 'isLoggedIn === false 또는 atlasPreview=1' },
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
          targetId: null,
          label: 'AuthCallbackPage',
          relation: 'USES',
          note: '로그인 성공 시 무조건 /rooms로 보낸다(AuthCallbackPage.tsx#L30). 이 가드와 같은 목적지다.',
        },
        {
          targetId: 'landing-hero',
          label: '히어로 CTA',
          relation: 'SHARES_CODE',
          note: '둘 다 ROUTES.HOME을 목적지로 쓴다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/landing/LandingPage.tsx', symbol: 'LandingPage' },
      ],
      defects: [],
    },

    {
      id: 'landing-hero',
      code: 'S.01',
      title: '히어로 · 체크리스트 시작',
      status: 'BOUND',
      headline: '첫 화면과 주 CTA. 서버를 부르지 않는다',
      overview: {
        what: '배경 이미지 위에 제품 한 줄 소개와 주 CTA를 놓는다. 이 페이지에서 유일하게 화면 영역이 Atlas에 좌표로 보고되는 요소다.',
        where: '페이지 최상단. 높이 413px(모바일) / 600px(데스크톱) 고정.',
      },
      behaviour: [
        { actor: 'USER', step: '체크리스트 시작하기를 누른다', source: null },
        {
          actor: 'FRONT',
          step: 'react-router Link가 ROUTES.HOME(/rooms)으로 이동한다. 로그인 여부를 보지 않는다',
          source: 'HeroSection.tsx#L30',
        },
        {
          actor: 'FRONT',
          step: '/rooms에서 온보딩 모달 또는 EmptyState가 뜬다',
          source: 'src/features/rooms/pages/RoomsPage.tsx#L277',
        },
      ],
      api: [
        {
          operationId: 'landing.hero.startChecklist',
          summary: '방 목록으로 이동한다',
          method: 'CLIENT',
          path: 'Link to ROUTES.HOME',
          security: 'PUBLIC — 인증 검사 없음',
          request: null,
          responses: [{ code: 'navigate', when: '항상' }],
          safety: {
            sideEffect: 'NONE',
            writes: [],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
      ],
      related: [
        {
          targetId: 'landing-features',
          label: '기능 소개의 같은 이름 CTA',
          relation: 'INCONSISTENT_WITH',
          note: '라벨이 "체크리스트 시작하기"로 같은데 동작이 다르다. 이쪽은 무조건 이동하고, 저쪽은 비로그인이면 LoginRequiredModal을 띄운다.',
        },
        {
          targetId: 'landing-route-guard',
          label: '페이지 진입 가드',
          relation: 'SHARES_CODE',
          note: '같은 ROUTES.HOME 상수를 목적지로 쓴다.',
        },
      ],
      sources: [
        {
          layer: 'FRONT',
          path: 'src/features/landing/components/HeroSection.tsx',
          symbol: 'HeroSection',
        },
      ],
      defects: [],
    },

    {
      id: 'landing-testimonials',
      code: 'S.02',
      title: '사용자 후기',
      status: 'LIVE',
      headline: '정적 인용문. 상호작용도 서버 호출도 없다',
      overview: {
        what: '사용자 후기를 여러 줄로 흘려 보여준다. 문구는 코드 안 상수 배열이고 서버에서 받지 않는다.',
        where: '히어로 바로 아래. SectionWrapper로 감싼 어두운 배경 구간.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'ROWS 상수 배열을 읽어 QuoteCard를 줄마다 배치한다',
          source: 'TestimonialsSection.tsx#L6',
        },
        {
          actor: 'FRONT',
          step: 'ROW_OFFSETS로 줄마다 가로 오프셋을 준다. 클릭 대상은 없다',
          source: 'TestimonialsSection.tsx#L27',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'landing-features',
          label: '기능 소개',
          relation: 'SHARES_CODE',
          note: '둘 다 SectionWrapper로 레이아웃을 잡는다.',
        },
      ],
      sources: [
        {
          layer: 'FRONT',
          path: 'src/features/landing/components/TestimonialsSection.tsx',
          symbol: 'TestimonialsSection',
        },
      ],
      defects: [],
    },

    {
      id: 'landing-features',
      code: 'S.03',
      title: '기능 소개 · 게스트 분기',
      status: 'BOUND',
      headline: '이 페이지에서 로그인 분기가 일어나는 유일한 곳',
      overview: {
        what: '기능 세 가지를 소개하고, 그 안의 CTA가 로그인 여부에 따라 갈린다. 비로그인이면 이번 세션에 한 번 LoginRequiredModal을 띄운다.',
        where: '페이지 최하단. 모바일과 데스크톱이 서로 다른 배치를 쓴다.',
      },
      behaviour: [
        { actor: 'USER', step: '체크리스트 시작하기를 누른다', source: null },
        {
          actor: 'FRONT',
          step: 'isLoggedIn이면 곧장 /rooms로 이동한다',
          source: 'FeaturesSection.tsx#L57',
        },
        {
          actor: 'FRONT',
          step: '비로그인이고 sessionStorage에 표시 기록이 있으면 모달 없이 /rooms로 이동한다',
          source: 'FeaturesSection.tsx#L61',
        },
        {
          actor: 'FRONT',
          step: '비로그인이고 첫 시도면 표시 기록을 남기고 모달을 연다',
          source: 'FeaturesSection.tsx#L67',
        },
        {
          actor: 'USER',
          step: '모달에서 게스트로 계속(/rooms) 또는 로그인(/login)을 고른다',
          source: 'FeaturesSection.tsx#L79',
        },
      ],
      api: [
        {
          operationId: 'landing.features.startChecklist',
          summary: '로그인 여부와 세션 기록으로 목적지를 가른다',
          method: 'CLIENT',
          path: 'navigate(ROUTES.HOME) | navigate(ROUTES.LOGIN)',
          security: 'PUBLIC — useAuthStore의 클라이언트 상태만 본다. 서버 검증 없음',
          request: 'sessionStorage[SESSION_KEY_LANDING_MODAL_SHOWN]',
          responses: [
            { code: 'navigate /rooms', when: '로그인 상태이거나 모달을 이미 본 세션' },
            { code: 'modal', when: '비로그인 + 이번 세션 첫 시도' },
            { code: 'navigate /login', when: '모달에서 로그인을 고름' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['sessionStorage'],
            rerunSafe: false,
            abortOnFail: 'NONE',
          },
        },
      ],
      related: [
        {
          targetId: 'landing-hero',
          label: '히어로의 같은 이름 CTA',
          relation: 'INCONSISTENT_WITH',
          note: '같은 라벨인데 히어로는 분기 없이 이동한다. 사용자는 같은 버튼이라 여기지만 결과가 다르다.',
        },
        {
          targetId: null,
          label: '로그인 페이지',
          relation: 'USES',
          note: '모달의 로그인 경로가 /login으로 나간다. 그 뒤 OAuth는 Naver·Google 두 가지다.',
        },
      ],
      sources: [
        {
          layer: 'FRONT',
          path: 'src/features/landing/components/FeaturesSection.tsx',
          symbol: 'ChecklistStartButton',
        },
        {
          layer: 'FRONT',
          path: 'src/components/ui/Modals.tsx',
          symbol: 'LoginRequiredModal',
        },
      ],
      defects: [],
    },
  ],
};
