import type { AtlasPageCards } from '@/types/atlas-card';

/**
 * 내 방 목록(/rooms)의 카드. 로그인 후 홈이다.
 *
 * 이 화면의 특징 —
 * 서버 방과 게스트 방이 같은 목록에 담긴다. 비로그인이면 useRoomsList가
 * enabled: isLoggedIn으로 막히고 브라우저에 쌓인 게스트 방을 대신 쓴다.
 * 그래서 게스트로 이 화면을 열면 서버 호출이 하나도 나가지 않는다.
 *
 * 필터 바는 데스크톱·모바일 두 벌로 렌더된다. 한 기능의 두 표현이라
 * 같은 data-atlas-node 값을 달았다 — ProjectAtlasPage가 중복 id를
 * "큰 쪽만 남김"으로 처리한다.
 *
 * 모든 항목은 2026-08-04 기준 소스를 읽고 적었다.
 * id는 제품 DOM의 data-atlas-node 값과 같다.
 */
export const ROOMS_PAGE_CARDS: AtlasPageCards = {
  pageId: 'rooms',
  title: '내 방 목록',
  route: '/rooms',
  previewSrc: '/rooms?atlasPreview=1',
  // 방이 0개면 본문이 EmptyState로 통째로 바뀐다(RoomsPage.tsx#L320).
  // 그 조건은 URL 파라미터가 아니라 데이터라 상태 탭으로 만들 수 없다.
  // 방이 없는 브라우저로 미리보기를 열면 O.03만 보이고 O.02는 보고되지 않는다.
  states: [],
  cards: [
    {
      id: 'rooms-view-tabs',
      code: 'O.00',
      title: '보기 전환 · 카드/지도',
      status: 'LIVE',
      headline: '카드 보기와 지도 보기를 가르는 탭. 지도는 다른 라우트다',
      overview: {
        what: '같은 방 목록을 카드로 볼지 지도로 볼지 고르는 탭이다.',
        where: '화면 최상단, 필터 바 위.',
      },
      behaviour: [
        { actor: 'FRONT', step: '"카드로 보기"는 현재 화면이라 활성 표시만 한다', source: 'RoomsPage.tsx#L332' },
        { actor: 'USER', step: '"지도로 보기"를 누른다', source: 'RoomsPage.tsx#L338' },
        { actor: 'FRONT', step: 'navigate(ROUTES.MAP)로 /map으로 떠난다. 같은 화면의 상태 전환이 아니라 라우트 이동이다', source: 'RoomsPage.tsx#L339' },
      ],
      api: [],
      related: [
        { targetId: null, label: '/map — 지도 보기', relation: 'USES', note: '같은 방 목록을 지도로 보여주는 화면. queryKey가 같아 캐시를 공유한다' },
      ],
      sources: [
        { layer: 'FRONT', path: 'frontend/src/features/rooms/pages/RoomsPage.tsx', symbol: 'RoomsPage' },
      ],
      defects: [],
    },
    {
      id: 'rooms-filter',
      code: 'O.01',
      title: '거래방식 필터 · 정렬',
      status: 'BOUND',
      headline: '필터와 정렬이 목록 조회의 질의 파라미터로 나간다',
      overview: {
        what: '거래방식(전세/월세 등)과 정렬 기준을 고르는 바다. 값이 바뀌면 목록을 다시 부른다.',
        where: '탭 아래 sticky 영역. 데스크톱과 모바일이 다른 마크업으로 렌더되지만 같은 기능이라 같은 마커를 단다.',
      },
      behaviour: [
        { actor: 'USER', step: '거래방식이나 정렬을 고른다', source: 'RoomsPage.tsx#L348' },
        { actor: 'FRONT', step: 'useRoomsList(transactionType, sortOption)의 인자가 바뀌고 queryKey가 달라져 재조회된다', source: 'use-rooms-query.ts#L11' },
        { actor: 'BACK', step: 'GET /api/v1/rooms가 질의 파라미터를 받아 필터·정렬된 목록을 낸다', source: 'RoomService.java#getRooms' },
      ],
      api: [
        {
          operationId: 'OP-ROOM-LIST',
          summary: '내 방 목록 조회',
          method: 'GET',
          path: '/api/v1/rooms',
          security: 'JWT',
          request: 'transactionType, sortOption (질의 파라미터, 둘 다 선택)',
          responses: [
            { code: '200', when: '로그인 상태. 방 목록을 낸다' },
            { code: 'skip', when: '비로그인. enabled: isLoggedIn이라 요청 자체가 나가지 않는다' },
          ],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [],
      sources: [
        { layer: 'FRONT', path: 'frontend/src/features/rooms/hooks/use-rooms-query.ts', symbol: 'useRoomsList' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/service/RoomService.java', symbol: 'getRooms' },
      ],
      defects: [],
    },
    {
      id: 'rooms-list',
      code: 'O.02',
      title: '내 방 목록 · 카드',
      status: 'BOUND',
      headline: '방 카드와 문제 뱃지. 삭제도 여기서 일어난다',
      overview: {
        what: '방마다 카드 한 장이다. 이름·주소·조건과 함께 체크리스트에서 나온 문제 뱃지(곰팡이·누수 등)를 단다.',
        where: '필터 바 아래 본문 전체. 방이 없으면 이 영역 대신 빈 상태가 그려진다.',
      },
      behaviour: [
        { actor: 'FRONT', step: '로그인이면 useRoomsList의 결과를, 비로그인이면 useGuestRoomStore의 게스트 방을 쓴다', source: 'RoomsPage.tsx#L272' },
        { actor: 'FRONT', step: 'RoomCard가 room.issues를 뱃지로 그린다. 항목 이름 문자열로 판정한다', source: 'RoomCard.tsx#L79' },
        { actor: 'USER', step: '카드를 누르면 체크리스트 상세로, 삭제를 누르면 확인 후 지운다', source: 'RoomsPage.tsx#L494' },
        { actor: 'BACK', step: 'DELETE /api/v1/rooms/{id}가 soft delete로 처리한다', source: 'RoomService.java#deleteRoom' },
      ],
      api: [
        {
          operationId: 'OP-ROOM-DELETE',
          summary: '내 방 삭제',
          method: 'DELETE',
          path: '/api/v1/rooms/{id}',
          security: 'JWT',
          request: 'id (경로 변수)',
          responses: [
            { code: '200', when: '본인 방을 지웠다. is_deleted를 세우는 soft delete다' },
            { code: '404', when: '없는 id이거나 남의 방' },
          ],
          safety: { sideEffect: 'WRITE', writes: ['rooms'], rerunSafe: true, abortOnFail: 'FULL_ROLLBACK' },
        },
        {
          operationId: 'OP-CHECKLIST-ITEMS-CUSTOMIZED',
          summary: '체크리스트 항목 조회',
          method: 'GET',
          path: '/api/checklist/items',
          security: 'JWT',
          request: null,
          responses: [{ code: '200', when: '사용자 설정이 반영된 항목 목록' }],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        { targetId: null, label: '/checklist/:id — 체크리스트 상세', relation: 'USES', note: '카드를 누르면 이동한다' },
      ],
      sources: [
        { layer: 'FRONT', path: 'frontend/src/components/RoomCard.tsx', symbol: 'RoomCard' },
        { layer: 'FRONT', path: 'frontend/src/features/rooms/hooks/use-rooms-query.ts', symbol: 'useDeleteRoom' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/service/RoomService.java', symbol: 'deleteRoom' },
      ],
      // 뱃지가 이 화면에 실제로 그려지므로(RoomCard.tsx#L176) 두 결함이 여기서 드러난다.
      defects: ['BC-LIST-01', 'BC-LIST-02', 'BC-LIST-03'],
    },
  ],
};
