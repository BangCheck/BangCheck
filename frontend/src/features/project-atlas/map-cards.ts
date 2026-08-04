import type { AtlasPageCards } from '@/types/atlas-card';

/**
 * 지도 화면(/map)의 카드.
 *
 * 이 페이지를 지배하는 사실 하나 —
 * 백엔드에 지도 전용 API 네 개(GET·POST·DELETE /api/v1/map/points, GET /api/v1/map/rooms)가
 * 있는데 프런트가 하나도 부르지 않는다. 기준점은 코드 안 상수 LANDMARK_PRESETS와
 * localStorage('landmark-selection')로만 돌아가고, 거리·정렬도 브라우저가 다시 계산한다.
 * 서버는 이미 거리·도보분·정렬을 계산해 주는데 화면이 그것을 쓰지 않는다.
 * 근거: `grep -rn "api/v1/map" frontend/src` 0건, registry의 FT-MAP-POINT-MANAGE ·
 * FT-MAP-ROOM-OVERLAY 둘 다 frontendEntry 없음(2026-08-04 실측).
 *
 * 이 화면이 실제로 부르는 서버 경로는 둘뿐이다 —
 * GET /api/v1/rooms(페이지가 직접), GET /api/v1/directions/walking(방 카드를 골랐을 때만).
 *
 * MapPage.tsx가 1068줄이라 파일 구조가 아니라 화면상 의미 단위로 나눴다.
 * 모든 항목은 2026-08-04 기준 소스를 읽고 적었다. id는 data-atlas-node 값과 같다.
 */
export const MAP_PAGE_CARDS: AtlasPageCards = {
  pageId: 'map',
  title: '지도로 보기',
  route: '/map',
  previewSrc: '/map?atlasPreview=1',
  // 이 화면을 가르는 조건은 로그인이 아니라 "주소가 있는 방이 있는가"다(MapPage.tsx#L484).
  // URL 파라미터로 만들 수 없고 데이터를 지어내야 하므로 상태 탭을 두지 않는다.
  // 방이 없는 브라우저로 미리보기를 열면 M.06(빈 상태)만 보고되고 M.04·M.05는 렌더되지 않는다.
  states: [],
  cards: [
    {
      id: 'map-view-tabs',
      code: 'M.00',
      title: '보기 전환 탭',
      status: 'LIVE',
      headline: '카드 보기와 지도 보기를 오간다. 두 화면은 서로 다른 라우트다',
      overview: {
        what: '"카드로 보기"와 "지도로 보기" 두 탭. 지금 탭은 눌러도 아무 일이 없고, 다른 탭은 /rooms로 이동한다.',
        where: '페이지 최상단, 글로벌 헤더 바로 아래.',
      },
      behaviour: [
        { actor: 'USER', step: '"카드로 보기"를 누른다', source: null },
        {
          actor: 'FRONT',
          step: 'navigate(ROUTES.HOME)로 /rooms에 간다. 탭처럼 보이지만 같은 화면의 전환이 아니라 라우트 이동이다',
          source: 'MapPage.tsx#L795',
        },
        {
          actor: 'FRONT',
          step: '"지도로 보기"는 cursor-default에 핸들러가 없다. 현재 탭 표시 전용이다',
          source: 'MapPage.tsx#L805',
        },
      ],
      api: [
        {
          operationId: 'map.tabs.toRoomsView',
          summary: '카드 목록 화면으로 이동한다',
          method: 'CLIENT',
          path: 'navigate(ROUTES.HOME)',
          security: 'PUBLIC — 인증 검사 없음. /map도 PROTECTED_ROUTES에 없다',
          request: null,
          responses: [{ code: 'navigate /rooms', when: '항상' }],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'map-rooms',
          label: '방 카드 목록',
          relation: 'INCONSISTENT_WITH',
          note: '탭 이름은 "지도로 보기"인데 이 화면에도 방 카드 목록이 지도 위에 그대로 있다. 두 탭의 차이는 카드의 유무가 아니라 지도의 유무다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'MapPage' },
        { layer: 'FRONT', path: 'src/lib/routes.ts', symbol: 'ROUTES' },
      ],
      defects: [],
    },

    {
      id: 'map-landmark',
      code: 'M.01',
      title: '기준점 선택 · 저장',
      status: 'LIVE',
      headline: '기준점은 코드 안 상수 8개뿐이고 localStorage에만 남는다. 서버 기준점 API는 쓰지 않는다',
      overview: {
        what: '거리를 재는 기준점을 고른다. 후보는 서버에서 받지 않고 코드에 박힌 LANDMARK_PRESETS 8곳(연세대·이대·신촌역·이대역·서대문역·서울역·종로5가역·동대입구역)뿐이다. 고른 값은 localStorage 키 landmark-selection에 저장된다.',
        where: '세 곳에 나뉘어 있다 — 선택 후 상단에 뜨는 sticky 배너, 데스크톱 필터 바 안의 "원하는 기준점을 입력해주세요" 버튼, 모바일 검색 바. 지도 위 마커를 눌러도 같은 선택이 된다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: '진입 시 localStorage의 landmark-selection을 읽어 name·lat·lng 타입을 검사하고, 어긋나면 키를 지운다',
          source: 'MapPage.tsx#L489',
        },
        {
          actor: 'USER',
          step: '빠른 선택 패널이나 지도 마커에서 기준점을 고른다. 자유 입력처럼 보이지만 실제로는 목록 선택이다',
          source: 'MapPage.tsx#L878, MapPage.tsx#L585',
        },
        {
          actor: 'FRONT',
          step: 'selectLandmark가 state를 바꾸고 같은 값을 localStorage에 쓴다. 서버로는 아무것도 나가지 않는다',
          source: 'MapPage.tsx#L756',
        },
        {
          actor: 'FRONT',
          step: '기준점이 있으면 상단 배너가 나타나고, 지도의 해당 마커가 강조되고, 모든 방까지 점선이 그어지고, 거리 정렬이 풀린다',
          source: 'MapPage.tsx#L594, MapPage.tsx#L620, MapPage.tsx#L783',
        },
        {
          actor: 'USER',
          step: '"초기화"를 누르면 state와 localStorage 키를 함께 지운다',
          source: 'MapPage.tsx#L763',
        },
      ],
      api: [
        {
          operationId: 'map.landmark.select',
          summary: '기준점을 브라우저에 저장한다',
          method: 'CLIENT',
          path: "localStorage['landmark-selection']",
          security: 'PUBLIC — 서버 호출 없음. 로그인 여부와 무관하다',
          request: '{ name, lat, lng } — LANDMARK_PRESETS의 한 항목',
          responses: [
            { code: 'stored', when: '프리셋 선택 또는 지도 마커 클릭' },
            { code: 'removed', when: '초기화 클릭' },
            { code: 'discarded', when: '저장값이 형식 검사에 걸림 — 키를 지우고 기준점 없음으로 시작' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['localStorage'],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
      ],
      related: [
        {
          targetId: null,
          label: '백엔드 기준점 API (/api/v1/map/points)',
          relation: 'INCONSISTENT_WITH',
          note: '서버에 기준점 등록·조회·삭제 세 operation이 있고 map_points 테이블까지 있는데 화면은 부르지 않는다. 서버 기준점과 화면 기준점이 서로 다른 저장소에 산다 — registry FT-MAP-POINT-MANAGE가 frontendEntry를 비워 둔 이유다.',
        },
        {
          targetId: 'map-rooms',
          label: '방 카드 목록',
          relation: 'USED_BY',
          note: '기준점이 있어야 카드에 거리가 붙고 거리 정렬이 열리고 도보 경로 조회가 켜진다.',
        },
        {
          targetId: 'map-canvas',
          label: 'NCP 지도 본체',
          relation: 'USED_BY',
          note: '기준점 마커 강조와 방까지의 점선이 지도 위에 그려진다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'LANDMARK_PRESETS' },
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'selectLandmark' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/map/service/MapService.java', symbol: 'createMapPoint' },
      ],
      defects: [],
    },

    {
      id: 'map-filter',
      code: 'M.02',
      title: '필터 · 정렬 바',
      status: 'LIVE',
      headline: '거래방식과 정렬을 고른다. 서버 파라미터가 아니라 브라우저 계산이다',
      overview: {
        what: '거래방식 칩 4개(전체·전세·월세·단기), 기준점 선택 버튼, 정렬 드롭다운 5개, 초기화, 비교 리포트 버튼이 한 줄에 있다. 필터와 정렬 모두 이미 받아 둔 목록을 브라우저에서 거르고 다시 늘어놓는 것이다.',
        where: '데스크톱(lg 이상)에서만 한 줄로 보인다. 모바일에서는 기준점이 검색 바로, 정렬이 카운터 줄의 버튼으로 흩어진다.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '거래방식 칩을 고른다',
          source: 'MapPage.tsx#L846',
        },
        {
          actor: 'FRONT',
          step: 'TYPE_TO_CHIP 매핑으로 roomsWithAddress를 걸러낸다. useRoomsList에 rentType을 넘기지 않으므로 서버 필터는 쓰지 않는다',
          source: 'MapPage.tsx#L703',
        },
        {
          actor: 'USER',
          step: '정렬을 고른다. "기준점 거리 가까운순·먼순"은 기준점이 없으면 비활성이고 "(기준점 필요)"가 붙는다',
          source: 'MapPage.tsx#L783, MapPage.tsx#L926',
        },
        {
          actor: 'FRONT',
          step: '보증금 정렬은 목록 응답의 deposit으로, 거리 정렬은 geocoding으로 얻은 roomPositions와 Haversine distanceKm으로 브라우저가 계산한다',
          source: 'MapPage.tsx#L710, MapPage.tsx#L292',
        },
        {
          actor: 'FRONT',
          step: '"초기화"는 거래방식과 정렬만 되돌린다. 기준점은 건드리지 않는다 — 배너의 "초기화"와 이름이 같고 대상이 다르다',
          source: 'MapPage.tsx#L776',
        },
        {
          actor: 'USER',
          step: '"비교 리포트"를 누르면 /report로 간다. 주소 있는 방이 0개면 비활성이다',
          source: 'MapPage.tsx#L947',
        },
      ],
      api: [
        {
          operationId: 'map.filter.applyLocally',
          summary: '받아 둔 목록을 브라우저에서 거르고 정렬한다',
          method: 'CLIENT',
          path: 'useMemo(filtered) → useMemo(sorted)',
          security: 'PUBLIC — 서버 호출 없음',
          request: 'transactionType · sortOption · landmark · roomPositions',
          responses: [
            { code: 'render', when: '항상 — 필터·정렬 결과가 곧 카드 목록이다' },
            { code: 'partial', when: '거리 정렬 중 아직 geocoding이 안 끝난 방은 뒤로 밀린다' },
          ],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: null,
          label: '백엔드 지도용 목록 API (GET /api/v1/map/rooms)',
          relation: 'INCONSISTENT_WITH',
          note: '서버가 rentType 필터·기준점 거리·도보분·정렬 4종을 이미 계산해 준다. 화면은 그것 대신 GET /api/v1/rooms를 받아 같은 계산을 브라우저에서 다시 한다 — 같은 정책이 두 곳에 산다(registry FT-MAP-ROOM-OVERLAY).',
        },
        {
          targetId: 'map-landmark',
          label: '기준점 선택',
          relation: 'USES',
          note: '거리 정렬이 열리는 조건이 기준점의 존재다. 기준점 선택 버튼도 이 바 안에 있다.',
        },
        {
          targetId: null,
          label: '비교 리포트(/report)',
          relation: 'USES',
          note: '여기 버튼이 그 화면의 진입점 중 하나다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'SORT_OPTIONS' },
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'distanceKm' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/map/controller/MapController.java', symbol: 'getMapRooms' },
      ],
      defects: [],
    },

    {
      id: 'map-counter',
      code: 'M.03',
      title: '등록 방 수 · 모바일 정렬',
      status: 'LIVE',
      headline: '한도는 로그인 여부로 갈린다. 두 숫자의 출처가 다르다',
      overview: {
        what: '"등록된 방 n개/m개"를 보여준다. n은 로그인 상태면 서버 목록 길이, 비로그인이면 게스트 방 길이다. m은 ROOM_LIMIT 또는 GUEST_ROOM_LIMIT다.',
        where: '필터 바 아래 한 줄. 모바일에서는 오른쪽에 정렬 토글이 함께 있다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'totalRooms는 필터 전 전체 방 수다 — 화면에 보이는 카드 수(필터·주소 유무를 거친 결과)와 다를 수 있다',
          source: 'MapPage.tsx#L782, MapPage.tsx#L479',
        },
        {
          actor: 'FRONT',
          step: '한도는 isLoggedIn으로 갈린다(ROOM_LIMIT / GUEST_ROOM_LIMIT). 클라이언트 상태만 보고 정한다',
          source: 'MapPage.tsx#L781',
        },
        {
          actor: 'USER',
          step: '모바일에서 정렬 버튼을 누르면 데스크톱 드롭다운과 같은 isFilterOpen을 뒤집는다',
          source: 'MapPage.tsx#L1007',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'map-filter',
          label: '필터 · 정렬 바',
          relation: 'SHARES_CODE',
          note: '모바일 정렬 버튼과 데스크톱 드롭다운이 같은 isFilterOpen · sortOption state를 공유한다.',
        },
        {
          targetId: 'map-empty',
          label: '주소 있는 방 없음',
          relation: 'INCONSISTENT_WITH',
          note: '방이 있어도 주소가 없으면 카운터는 n개라고 말하는데 본문은 "주소가 등록된 방이 없어요"가 된다. 두 문장이 같은 화면에 동시에 있을 수 있다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'MapPage' },
        { layer: 'FRONT', path: 'src/lib/constants.ts', symbol: 'GUEST_ROOM_LIMIT' },
      ],
      defects: [],
    },

    {
      id: 'map-rooms',
      code: 'M.04',
      title: '방 카드 목록',
      status: 'BOUND',
      headline: '거리는 카드가 직접 계산하고, 카드를 고르면 그때만 도보 경로를 부른다',
      overview: {
        what: '필터·정렬을 거친 방을 카드로 늘어놓는다. 카드마다 기준점 거리와 고정 역 6곳까지의 거리를 브라우저가 계산해 붙인다. 카드를 고르면 그 방만 도보 경로를 서버에 물어본다.',
        where: '카운터 아래 그리드(데스크톱 3열 · 태블릿 2열 · 모바일 1열). 지도 본체보다 위에 있다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: '목록은 useRoomsList()로 받는다. 이 화면이 직접 부르는 것이고, AppLayout의 Header·BottomNavigation도 같은 queryKey로 부르지만 요청은 하나로 합쳐진다',
          source: 'MapPage.tsx#L472, Header.tsx#L21, BottomNavigation.tsx#L42',
        },
        {
          actor: 'FRONT',
          step: '비로그인이면 서버 대신 useGuestRoomStore의 게스트 방을 그린다(useRoomsList는 enabled: isLoggedIn이라 요청 자체가 없다)',
          source: 'MapPage.tsx#L474',
        },
        {
          actor: 'FRONT',
          step: '카드의 거리 문구는 roomPositions(지오코딩 결과)와 Haversine으로 매 렌더 계산한다. 고정 역 6곳 칩은 데스크톱에서만 보인다',
          source: 'MapPage.tsx#L139, MapPage.tsx#L142',
        },
        {
          actor: 'FRONT',
          step: '"문제요소 n건"은 목록 응답의 issues 객체에서 true인 값을 센다',
          source: 'MapPage.tsx#L132',
        },
        {
          actor: 'USER',
          step: '카드를 누르면 그 방이 선택되고, 다시 누르면 해제된다',
          source: 'MapPage.tsx#L1046',
        },
        {
          actor: 'FRONT',
          step: '기준점과 선택 방 좌표가 모두 있을 때만 도보 경로 질의가 켜진다(enabled: params !== null). 즉 이 호출은 방 목록과 지오코딩이 끝난 뒤에만 일어난다',
          source: 'MapPage.tsx#L463, use-directions-query.ts#L13',
        },
        {
          actor: 'BACK',
          step: 'DirectionsService가 SK Tmap 보행자 경로에 POST 한다. 응답이 비면 null을 그대로 200으로 감싸 보낸다 — 실패가 성공처럼 보인다',
          source: 'backend/api/directions/service/DirectionsService.java',
        },
        {
          actor: 'FRONT',
          step: '응답이 오면 카드에 "도보 n분 · 거리"가 붙고, 오기 전에는 "경로 불러오는 중…"이 뜬다. 실패(retry: false)면 그 문구가 그대로 남는다',
          source: 'MapPage.tsx#L1036',
        },
        {
          actor: 'USER',
          step: '핀 버튼으로 지도를 그 방으로 옮기거나, "자세히 보기"로 /checklist/{id}에 간다',
          source: 'MapPage.tsx#L1047, MapPage.tsx#L225',
        },
      ],
      api: [
        {
          operationId: 'OP-ROOM-LIST',
          summary: '내 방 목록을 받는다',
          method: 'GET',
          path: '/api/v1/rooms',
          security: 'JWT (registry FT-ROOM-LIST auth: JWT)',
          request: 'query: rentType, sort — 이 화면은 둘 다 넘기지 않고 브라우저에서 거른다',
          responses: [
            { code: '200', when: 'RoomListItem[] — 주소·보증금·월세·issues 요약' },
            { code: '401', when: '토큰 없음 · Security 필터가 차단' },
            { code: 'skip', when: '비로그인 — enabled: false라 요청이 나가지 않고 게스트 방을 쓴다' },
          ],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
        {
          operationId: 'OP-DIRECTIONS-WALKING',
          summary: '기준점에서 선택한 방까지의 도보 경로를 받는다',
          method: 'GET',
          path: '/api/v1/directions/walking',
          security: 'PUBLIC — SecurityConfig#L62에서 이 GET만 permitAll이다. 컨트롤러도 userId를 보지 않는다',
          request: 'query: startLat, startLng, goalLat, goalLng — 기준점 좌표는 localStorage, 방 좌표는 NCP 지오코딩 결과다',
          responses: [
            { code: '200', when: 'path(좌표열) · distance · duration' },
            { code: '200 (data: null)', when: '외부 응답이 비었을 때 — 실패가 성공 코드로 나간다' },
          ],
          safety: {
            sideEffect: 'EXTERNAL',
            writes: [],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
      ],
      related: [
        {
          targetId: 'map-canvas',
          label: 'NCP 지도 본체',
          relation: 'USES',
          note: '카드의 거리·도보 경로는 지도가 지오코딩으로 채운 roomPositions에 전적으로 의존한다. 지도가 못 뜨면 좌표가 없어 거리도 경로도 나오지 않는다.',
        },
        {
          targetId: 'map-landmark',
          label: '기준점 선택',
          relation: 'USES',
          note: '기준점이 없으면 거리 문구도 도보 경로도 없다.',
        },
        {
          targetId: null,
          label: '방 목록 화면 · 비교 리포트',
          relation: 'SHARES_CODE',
          note: '세 화면이 같은 useRoomsList 훅과 queryKey를 쓴다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'MapRoomCardCompact' },
        { layer: 'FRONT', path: 'src/features/map/hooks/use-directions-query.ts', symbol: 'useWalkingDirections' },
        { layer: 'FRONT', path: 'src/services/directions-service.ts', symbol: 'getWalkingDirections' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/directions/controller/DirectionsController.java', symbol: 'getWalkingDirections' },
      ],
      // 카드의 "문제요소 n건"이 목록 응답의 issues에서 나온다 — 그 값을 만드는 경로의 등록된 결함이다.
      defects: ['BC-LIST-01', 'BC-LIST-02'],
    },

    {
      id: 'map-canvas',
      code: 'M.05',
      title: 'NCP 지도 본체',
      status: 'BOUND',
      headline: '방 좌표는 브라우저가 네이버 지오코딩으로 매번 다시 구한다',
      overview: {
        what: '네이버 클라우드 플랫폼 지도 SDK를 스크립트로 불러 지도를 띄우고, 방 주소를 좌표로 바꿔 마커를 찍고, 기준점 마커·점선·도보 경로선·InfoWindow를 얹는다.',
        where: '카드 목록 아래 높이 500px 고정 영역.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'maps.js를 geocoder 서브모듈과 함께 동적으로 붙인다. 키는 VITE_NCP_MAP_CLIENT_ID이고, 인증 실패는 navermap_authFailure 콜백으로 받아 화면에 문구로 띄운다',
          source: 'MapPage.tsx#L415, MapPage.tsx#L516',
        },
        {
          actor: 'FRONT',
          step: '방마다 naver.maps.Service.geocode로 주소 → 좌표를 구한다. 결과는 state(roomPositions)에만 남고 서버에 저장되지 않아 새로고침하면 다시 부른다',
          source: 'MapPage.tsx#L639, MapPage.tsx#L646',
        },
        {
          actor: 'FRONT',
          step: 'geocoder 서브모듈이 없으면 콘솔 경고만 남기고 마커를 하나도 그리지 않는다. 화면에는 아무 안내가 없다',
          source: 'MapPage.tsx#L631',
        },
        {
          actor: 'FRONT',
          step: '마커·InfoWindow 문자열은 escHtml로 이스케이프한 뒤 보간한다(방 이름·주소는 사용자 입력이다)',
          source: 'MapPage.tsx#L106',
        },
        {
          actor: 'FRONT',
          step: '지도 idle마다 중심이 서울 범위를 벗어나면 clamp하고, 서대문 범위를 벗어나면 "서비스 지역이 아닙니다" 배지를 띄운다. 두 범위 모두 코드 안 상수다',
          source: 'MapPage.tsx#L541, MapPage.tsx#L550',
        },
        {
          actor: 'FRONT',
          step: '기준점이 있으면 모든 방까지 점선을 긋고, 선택한 방에는 도보 경로 실선을 따로 긋는다',
          source: 'MapPage.tsx#L620, MapPage.tsx#L744',
        },
      ],
      api: [
        {
          operationId: 'map.canvas.geocode',
          summary: '주소를 좌표로 바꾼다 (네이버 지도 SDK 직접 호출)',
          method: 'CLIENT',
          path: 'naver.maps.Service.geocode — 우리 백엔드를 거치지 않는다',
          security: 'PUBLIC — 브라우저가 NCP 클라이언트 키로 직접 부른다',
          request: '{ query: room.address }. 방 수만큼 개별 호출한다',
          responses: [
            { code: 'OK', when: '좌표를 얻어 roomPositions에 넣고 마커를 찍는다' },
            { code: 'ERROR', when: '조용히 건너뛴다 — 그 방은 지도에도 거리 계산에도 나타나지 않는다' },
            { code: 'no-service', when: 'geocoder 미로드 — 콘솔 경고만 남고 마커가 전부 없다' },
          ],
          safety: {
            sideEffect: 'EXTERNAL',
            writes: [],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
      ],
      related: [
        {
          targetId: 'map-rooms',
          label: '방 카드 목록',
          relation: 'USED_BY',
          note: '여기서 채운 roomPositions가 카드의 거리·거리 정렬·도보 경로 조회의 유일한 좌표 출처다.',
        },
        {
          targetId: null,
          label: '주소 검색(FT-ADDRESS-SEARCH)',
          relation: 'INCONSISTENT_WITH',
          note: '방 등록 때 주소를 고르면서 좌표를 얻을 수 있는데 지도는 그 좌표를 쓰지 않고 화면에서 주소를 다시 지오코딩한다.',
        },
        {
          targetId: 'map-landmark',
          label: '기준점 선택',
          relation: 'USES',
          note: '지도 위 프리셋 마커 클릭이 기준점 선택의 세 번째 입구다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'loadNcpMaps' },
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'escHtml' },
      ],
      defects: [],
    },

    {
      id: 'map-empty',
      code: 'M.06',
      title: '주소 있는 방 없음',
      status: 'LIVE',
      headline: '주소 있는 방이 0개면 지도도 카드도 그리지 않는다',
      overview: {
        what: '주소가 있는 방이 하나도 없을 때 지도와 카드 목록을 통째로 대체하는 화면이다. 방이 있어도 주소가 비어 있으면 여기로 온다.',
        where: '카운터 아래 본문 전체. 이 화면이 나오면 지도 초기화 자체가 일어나지 않는다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'roomsWithAddress가 비면 showEmpty가 켜지고, 지도 초기화 useEffect가 맨 앞에서 빠져나간다',
          source: 'MapPage.tsx#L484, MapPage.tsx#L512',
        },
        {
          actor: 'USER',
          step: '"체크리스트 시작하기"를 누른다',
          source: 'MapPage.tsx#L1021',
        },
        {
          actor: 'FRONT',
          step: '비로그인이고 게스트 방이 한도에 닿았으면 LoginRequiredModal을 띄우고, 아니면 /checklist/new로 간다',
          source: 'MapPage.tsx#L768',
        },
        {
          actor: 'USER',
          step: '모달에서 게스트로 계속(/checklist/new) 또는 로그인(/login)을 고른다',
          source: 'MapPage.tsx#L1094',
        },
      ],
      api: [
        {
          operationId: 'map.empty.startChecklist',
          summary: '게스트 한도를 보고 목적지를 가른다',
          method: 'CLIENT',
          path: 'navigate(ROUTES.CHECKLIST_NEW) | LoginRequiredModal',
          security: 'PUBLIC — useAuthStore의 클라이언트 상태와 게스트 방 개수만 본다',
          request: 'isLoggedIn · guestRooms.length',
          responses: [
            { code: 'navigate /checklist/new', when: '로그인 상태이거나 게스트 한도 미만' },
            { code: 'modal', when: '비로그인 + 게스트 한도 도달' },
            { code: 'navigate /login', when: '모달에서 로그인을 고름' },
          ],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'map-counter',
          label: '등록 방 수',
          relation: 'INCONSISTENT_WITH',
          note: '카운터는 주소 유무를 보지 않는다. 주소 없는 방만 있으면 "등록된 방 2개"와 "주소가 등록된 방이 없어요"가 함께 보인다.',
        },
        {
          targetId: null,
          label: '랜딩 · 기능 소개의 게스트 분기',
          relation: 'SHARES_CODE',
          note: '같은 LoginRequiredModal을 쓴다. 이쪽 조건은 세션 기록이 아니라 게스트 방 한도다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/map/MapPage.tsx', symbol: 'MapEmptyState' },
        { layer: 'FRONT', path: 'src/components/ui/Modals.tsx', symbol: 'LoginRequiredModal' },
      ],
      defects: [],
    },
  ],
};
