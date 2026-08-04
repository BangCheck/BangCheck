import type { AtlasPageCards } from '@/types/atlas-card';

/**
 * 마이페이지(/my)의 카드.
 *
 * 이 화면에는 두 가지 사실이 있다.
 *
 * 하나 — 페이지 자신은 서버를 부르지 않는다. pagemap이 잡은 GET /api/v1/rooms는
 * 전부 AppLayout의 Header·BottomNavigation에서 온다(Header.tsx#L21,
 * BottomNavigation.tsx#L42). MyPage.tsx에 useRoomsList 호출이 없다.
 *
 * 둘 — 로그아웃이 서버까지 가지 않는다. MyPage.tsx#L30에
 * `TODO(api-spec A-4): 서버 세션 종료 POST /api/v1/auth/logout 미연동`이
 * 그대로 있고 handleLogout은 로컬 store만 비운다. 그래서 화면은 로그아웃인데
 * refresh_token 행과 HttpOnly 쿠키는 서버에 남는다.
 * 이 관측치는 아직 defects.yaml에 등재돼 있지 않아 defects 배열에 넣지 않았다 —
 * 없는 ID를 가리키면 resolver가 막는다.
 *
 * 모든 항목은 2026-08-04 기준 소스를 읽고 적었다.
 * id는 제품 DOM의 data-atlas-node 값과 같다.
 */
export const MY_PAGE_CARDS: AtlasPageCards = {
  pageId: 'my',
  title: '마이페이지',
  route: '/my',
  previewSrc: '/my?atlasPreview=1',
  // 로그인 여부로 보이는 것이 갈리지만, 비로그인으로 이 경로에 오면
  // 아바타 이니셜이 '?'가 될 뿐 영역 구성은 같다. 상태 탭을 두지 않는다.
  states: [],
  cards: [
    {
      id: 'my-header',
      code: 'M.00',
      title: '페이지 제목',
      status: 'LIVE',
      headline: '제목 한 줄. 서버를 부르지 않는다',
      overview: {
        what: '"마이페이지" 제목만 있는 머리 영역이다.',
        where: '화면 최상단, 본문과 밑줄로 갈린다.',
      },
      behaviour: [
        { actor: 'FRONT', step: '정적 텍스트를 그린다. 상태도 요청도 없다', source: 'MyPage.tsx#L44' },
      ],
      api: [],
      related: [],
      sources: [
        { layer: 'FRONT', path: 'frontend/src/features/mypage/MyPage.tsx', symbol: 'MyPage' },
      ],
      defects: [],
    },
    {
      id: 'my-account',
      code: 'M.01',
      title: '프로필 · 로그아웃',
      status: 'BOUND',
      headline: '아바타와 로그아웃 버튼. 로그아웃이 서버까지 가지 않는다',
      overview: {
        what: '로그인한 사용자의 이니셜 아바타(프로필 이미지가 있으면 그것)와 로그아웃 버튼이다.',
        where: '제목 아래 중앙. 최대 320px 폭으로 세로 정렬된다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'useAuthStore의 user에서 nickname 또는 email을 읽어 첫 글자를 이니셜로 쓴다. User 타입에 name 필드가 없어 Figma의 이름 표기는 placeholder다',
          source: 'MyPage.tsx#L26',
        },
        {
          actor: 'USER',
          step: '로그아웃 버튼을 누른다',
          source: 'MyPage.tsx#L67',
        },
        {
          actor: 'FRONT',
          step: 'logout()이 auth·guest room·customization store를 비우고 홈으로 보낸다',
          source: 'MyPage.tsx#L32, use-auth-store.ts#L27',
        },
        {
          actor: 'BACK',
          step: '아무 요청도 받지 않는다. POST /api/v1/auth/logout이 미연동이라 refresh_token 행과 HttpOnly 쿠키가 남는다',
          source: 'MyPage.tsx#L30',
        },
      ],
      api: [],
      related: [
        {
          targetId: null,
          label: 'FT-AUTH-SESSION-LIFECYCLE — POST /api/v1/auth/logout',
          relation: 'INCONSISTENT_WITH',
          note: '서버에 로그아웃 operation이 있는데 이 화면이 부르지 않는다. 화면은 로그아웃 상태인데 서버 세션은 살아 있어, 다음 401에서 인터셉터가 재발급에 성공할 수 있다. registry의 FT-AUTH-SESSION-LIFECYCLE 참고',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'frontend/src/features/mypage/MyPage.tsx', symbol: 'handleLogout' },
        { layer: 'FRONT', path: 'frontend/src/store/use-auth-store.ts', symbol: 'logout' },
      ],
      defects: [],
    },
  ],
};
