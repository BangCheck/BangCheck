import type { AtlasPageCards } from '@/types/atlas-card';

/**
 * 비교 리포트(/report)의 카드.
 *
 * 이 페이지에는 지배적인 사실이 하나 있다 —
 * 백엔드에 비교 전용 API 두 개(GET /api/v1/report/info, POST /api/v1/report/compare)가
 * 있는데 프런트가 하나도 부르지 않는다. 화면은 방 목록·방 상세·체크리스트 항목
 * 세 조회로 받아 비교표를 브라우저에서 직접 조립한다.
 * 근거: `grep -rn "api/v1/report" frontend/` 0건, registry의 FT-REPORT-INFO ·
 * FT-REPORT-COMPARE 둘 다 frontendEntry 없음(2026-08-04 실측).
 * 그래서 BC-RPT-01~05는 이 화면에 지금 나타나지 않는 결함이다 — R.04에 그 사실과 함께 단다.
 *
 * 모든 항목은 2026-08-04 기준 프런트·백엔드 소스를 읽고 적었다.
 * id는 제품 DOM의 data-atlas-node 값과 같다.
 */
export const REPORT_PAGE_CARDS: AtlasPageCards = {
  pageId: 'report',
  title: '비교 리포트',
  route: '/report',
  previewSrc: '/report?atlasPreview=1',
  // 이 화면의 모습을 가르는 것은 로그인이 아니라 "방이 2개 이상인가"다(ReportPage.tsx#L93).
  // 그 조건은 URL 파라미터로 만들 수 없고 데이터를 지어내야 하므로 상태 탭을 두지 않는다.
  // 방이 2개 미만인 브라우저로 미리보기를 열면 빈 화면만 보이고 R.01~R.04 영역은 보고되지 않는다.
  states: [],
  cards: [
    {
      id: 'report-data',
      code: 'R.00',
      title: '데이터 적재 · 빈 상태',
      status: 'BOUND',
      headline: '조회 3종으로 비교 재료를 모은다. 방이 2개 미만이면 여기서 끝난다',
      overview: {
        what: '비교표를 그리기 전에 필요한 것을 모으는 층이다. 로그인 상태면 서버 3종을 부르고, 비로그인이면 브라우저에 쌓인 게스트 방과 번들에 든 기본 항목을 대신 쓴다.',
        where: '화면에 보이지 않는다. DOM 마커가 없고 카드로만 존재한다. 다만 방이 2개 미만이면 이 층의 결과로 본문 대신 "비교하려면 방이 2개 이상 필요해요" 한 화면만 나온다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'useRoomsList()로 방 목록을 받는다. enabled: isLoggedIn이라 비로그인이면 요청 자체가 나가지 않는다',
          source: 'ReportPage.tsx#L26, use-rooms-query.ts#L13',
        },
        {
          actor: 'FRONT',
          step: '비로그인이면 useGuestRoomStore의 guestRooms로 대체한다. 서버 방과 게스트 방이 같은 변수에 담긴다',
          source: 'ReportPage.tsx#L28',
        },
        {
          actor: 'FRONT',
          step: 'useChecklistItems()는 로그인 상태에서만 GET /api/checklist/items를 부르고, 비로그인이면 번들 상수 GUEST_CHECKLIST_ITEMS를 쓴다',
          source: 'use-checklist-items.ts#L30',
        },
        {
          actor: 'FRONT',
          step: '방이 2개 이상이면 앞의 2개를 자동 선택한다. 선택된 방마다 useQueries로 GET /api/v1/rooms/{id}를 병렬 호출한다',
          source: 'ReportPage.tsx#L35, ReportPage.tsx#L45',
        },
        {
          actor: 'FRONT',
          step: '방이 2개 미만이면 비교표를 그리지 않고 "체크리스트 추가하기" 한 화면으로 끝낸다',
          source: 'ReportPage.tsx#L93',
        },
        {
          actor: 'FRONT',
          step: 'AppLayout의 Header·BottomNavigation도 같은 useRoomsList를 부른다. queryKey가 같아(react-query rooms.list) 네트워크 요청은 한 번으로 합쳐진다',
          source: 'Header.tsx#L21, BottomNavigation.tsx#L42',
        },
        {
          actor: 'BACK',
          step: '세 경로 모두 SecurityConfig의 permitAll 목록에 없어 anyRequest().authenticated()에 걸린다. 토큰이 없으면 필터가 401로 끊는다',
          source: 'global/config/SecurityConfig.java#L68',
        },
      ],
      api: [
        {
          operationId: 'OP-ROOM-LIST',
          summary: '내 방 목록을 받는다',
          method: 'GET',
          path: '/api/v1/rooms',
          security: 'JWT (registry FT-ROOM-LIST auth: JWT)',
          request: 'query: rentType, sort — 이 화면은 둘 다 넘기지 않는다(useRoomsList() 인자 없음)',
          responses: [
            { code: '200', when: 'RoomListItem[] — 목록 카드용 요약' },
            { code: '401', when: '토큰 없음 · Security 필터가 차단' },
          ],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
        {
          operationId: 'OP-ROOM-DETAIL',
          summary: '선택한 방 하나의 상세와 체크 답변을 받는다',
          method: 'GET',
          path: '/api/v1/rooms/{id}',
          security: 'JWT (registry FT-ROOM-DETAIL auth: JWT)',
          request: 'path: id. 선택된 방 수(2~6)만큼 병렬로 나간다',
          responses: [
            { code: '200', when: 'RoomDetailApi — mapApiToForms가 폼 구조로 바꾼다' },
            { code: '401', when: '토큰 없음' },
          ],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
        {
          operationId: 'OP-CHECKLIST-ITEMS-CUSTOMIZED',
          summary: '내 설정이 반영된 체크리스트 항목을 받는다',
          method: 'GET',
          path: '/api/checklist/items',
          security: 'JWT (registry FT-CHECKLIST-CATALOG auth: JWT)',
          request: '없음. userId는 JWT principal에서 꺼낸다',
          responses: [
            { code: '200', when: 'ChecklistItemResponse[] — 방 상세 응답을 답변으로 풀 때 쓰인다' },
            { code: '401', when: '토큰 없음' },
            { code: 'local', when: '비로그인 — 호출하지 않고 GUEST_CHECKLIST_ITEMS를 쓴다' },
          ],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'report-compare',
          label: '비교표',
          relation: 'USED_BY',
          note: '여기서 모은 셋(rooms · roomDetails · checklistItems)을 CompareTable이 그대로 소비한다.',
        },
        {
          targetId: 'report-config',
          label: '비교 설정 패널',
          relation: 'USED_BY',
          note: '방 목록이 선택 후보가 되고, 방이 2개뿐이면 선택이 잠긴다(isLockedSelection).',
        },
        {
          targetId: null,
          label: '지도 화면 · 방 목록 화면',
          relation: 'SHARES_CODE',
          note: '세 화면이 같은 useRoomsList 훅과 같은 queryKey를 쓴다. 한 화면에서 목록이 갱신되면 나머지도 같이 바뀐다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/report/ReportPage.tsx', symbol: 'ReportPage' },
        { layer: 'FRONT', path: 'src/features/rooms/hooks/use-rooms-query.ts', symbol: 'useRoomsList' },
        { layer: 'FRONT', path: 'src/features/checklist/hooks/use-checklist-items.ts', symbol: 'useChecklistItems' },
        { layer: 'FRONT', path: 'src/services/room-service.ts', symbol: 'getRoomDetail' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/controller/RoomController.java', symbol: 'getRooms' },
      ],
      // BC-LIST-03은 이 화면이 실제로 부르는 OP-ROOM-LIST의 등록된 결함이다.
      // 방 6개 상한 덕에 지금은 드러나지 않지만 이 화면이 그 쿼리 비용을 그대로 물려받는다.
      defects: ['BC-LIST-03'],
    },

    {
      id: 'report-subheader',
      code: 'R.01',
      title: '서브 헤더 · 공유 · PDF',
      status: 'LIVE',
      headline: 'PDF는 브라우저 인쇄를 부른다. 공유 버튼은 아직 아무 일도 하지 않는다',
      overview: {
        what: '제목과 현재 선택 요약을 보여주고, 설정 패널 열기/닫기·공유·PDF 다운로드를 놓는다. 서버를 부르는 버튼은 하나도 없다.',
        where: '화면 상단. 글로벌 헤더 바로 아래에 sticky로 붙는다(top-14 / md:top-16).',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '← 를 눌러 방 목록으로 돌아간다',
          source: 'ReportPage.tsx#L131',
        },
        {
          actor: 'FRONT',
          step: '"설정 열기/닫기"가 isConfigOpen을 뒤집어 아래 설정 패널을 접었다 편다',
          source: 'ReportPage.tsx#L138, components/FilterToggle.tsx',
        },
        {
          actor: 'USER',
          step: '공유를 누른다 — onClick이 없어 아무 일도 일어나지 않는다. 버튼 모양만 있다',
          source: 'ReportPage.tsx#L145',
        },
        {
          actor: 'FRONT',
          step: 'PDF 다운로드는 로그인 상태면 window.print()를 부르고, 비로그인이면 LoginRequiredModal을 연다. 파일을 만드는 코드는 없다',
          source: 'ReportPage.tsx#L155',
        },
        {
          actor: 'FRONT',
          step: '소스에 "TODO(E06-S06): html2canvas + jsPDF 교체 예정" 주석이 남아 있다 — 지금 구현이 임시라는 표시다',
          source: 'ReportPage.tsx#L151',
        },
      ],
      api: [
        {
          operationId: 'report.subheader.print',
          summary: '브라우저 인쇄 대화상자를 연다',
          method: 'CLIENT',
          path: 'window.print() | LoginRequiredModal',
          security: 'PUBLIC — useAuthStore의 클라이언트 상태만 본다. 서버 검증 없음',
          request: null,
          responses: [
            { code: 'print', when: 'isLoggedIn === true' },
            { code: 'modal', when: 'isLoggedIn === false' },
            { code: 'navigate /login', when: '모달에서 로그인을 고름' },
          ],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'report-config',
          label: '비교 설정 패널',
          relation: 'USES',
          note: '이 헤더의 토글이 그 패널의 표시 여부를 소유한다(isConfigOpen).',
        },
        {
          targetId: null,
          label: '랜딩 · 기능 소개의 게스트 분기',
          relation: 'SHARES_CODE',
          note: '같은 LoginRequiredModal 컴포넌트를 쓴다. 다만 이쪽은 sessionStorage 기록을 남기지 않아 누를 때마다 뜬다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/report/ReportPage.tsx', symbol: 'ReportPage' },
        { layer: 'FRONT', path: 'src/features/report/components/FilterToggle.tsx', symbol: 'FilterToggle' },
        { layer: 'FRONT', path: 'src/components/ui/Modals.tsx', symbol: 'LoginRequiredModal' },
      ],
      defects: [],
    },

    {
      id: 'report-config',
      code: 'R.02',
      title: '비교 설정 패널',
      status: 'LIVE',
      headline: '무엇을 비교할지 고른다. 전부 브라우저 state다',
      overview: {
        what: '비교할 방(최소 2 · 최대 6)과 볼 섹션(최소 1 · 전체 7)을 고른다. 선택 결과는 컴포넌트 state에만 남고 서버로도 localStorage로도 나가지 않는다.',
        where: '서브 헤더 바로 아래. 처음 진입 시 열려 있고(isConfigOpen 초기값 true) 헤더 토글로 접는다.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '방 카드를 눌러 비교 대상에 넣거나 뺀다',
          source: 'components/ConfigCard.tsx',
        },
        {
          actor: 'FRONT',
          step: '방이 정확히 2개면 isLockedSelection이 켜져 토글 자체를 무시한다. 3개 이상일 때만 고를 수 있다',
          source: 'ReportPage.tsx#L55, ReportPage.tsx#L58',
        },
        {
          actor: 'FRONT',
          step: '선택은 2개 미만으로 내려가지 않고 6개(REPORT_MAX_SELECT)를 넘지 않는다. 한계에서는 클릭이 조용히 무시된다',
          source: 'ReportPage.tsx#L61, lib/sections.ts#L17',
        },
        {
          actor: 'USER',
          step: '섹션 칩을 눌러 비교표에서 볼 카테고리를 켜고 끈다. 마지막 한 개는 끌 수 없다',
          source: 'ReportPage.tsx#L67',
        },
        {
          actor: 'USER',
          step: '"초기화"를 누르면 선택 방이 앞의 2개로, 섹션이 전체로 되돌아간다',
          source: 'ReportPage.tsx#L73',
        },
      ],
      api: [
        {
          operationId: 'report.config.select',
          summary: '비교 대상과 섹션을 브라우저 state에서 정한다',
          method: 'CLIENT',
          path: 'setSelectedIds / setActiveSections',
          security: 'PUBLIC — 서버 호출 없음',
          request: null,
          responses: [
            { code: 'state', when: '선택 변경 — 선택된 방이 늘면 그 방의 상세 조회가 따라 나간다' },
            { code: 'noop', when: '최소·최대 한계에 걸린 클릭' },
          ],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'report-data',
          label: '데이터 적재',
          relation: 'USES',
          note: '선택이 늘면 useQueries의 대상이 늘어 GET /api/v1/rooms/{id}가 추가로 나간다.',
        },
        {
          targetId: 'report-compare',
          label: '비교표',
          relation: 'USED_BY',
          note: '여기서 고른 방과 섹션이 그대로 비교표의 열과 절이 된다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/report/components/ConfigCard.tsx', symbol: 'ConfigCard' },
        { layer: 'FRONT', path: 'src/features/report/lib/sections.ts', symbol: 'REPORT_SECTIONS' },
        { layer: 'FRONT', path: 'src/features/report/ReportPage.tsx', symbol: 'toggleRoom' },
      ],
      defects: [],
    },

    {
      id: 'report-section-tabs',
      code: 'R.03',
      title: '섹션 탭 내비게이션',
      status: 'LIVE',
      headline: '스크롤 위치를 관찰해 현재 섹션을 표시한다',
      overview: {
        what: '켜 둔 섹션만 탭으로 늘어놓고, 누르면 그 절로 스크롤한다. 화면에 무엇이 보이는지는 IntersectionObserver로 되짚는다.',
        where: '설정 패널 아래. 방이 2개 이상일 때만 그린다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'activeSections에 든 섹션의 DOM(section-{id})을 IntersectionObserver로 관찰한다 (rootMargin -15% / -70%)',
          source: 'components/SectionTabNav.tsx#L13',
        },
        {
          actor: 'USER',
          step: '탭을 누른다',
          source: 'components/SectionTabNav.tsx#L57',
        },
        {
          actor: 'FRONT',
          step: 'sticky 헤더 높이를 코드에 적힌 숫자(모바일 56+52, 데스크톱 64+56, 여백 8)로 빼고 window.scrollTo 한다. 헤더 높이가 바뀌면 이 숫자도 같이 고쳐야 한다',
          source: 'components/SectionTabNav.tsx#L35',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'report-compare',
          label: '비교표',
          relation: 'USES',
          note: 'section-{id} DOM id는 CompareTable의 SectionCard가 만든다. 그 규약이 깨지면 탭이 조용히 안 움직인다.',
        },
        {
          targetId: 'report-config',
          label: '비교 설정 패널',
          relation: 'USES',
          note: '탭 목록은 설정에서 켜 둔 섹션의 부분집합이다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/report/components/SectionTabNav.tsx', symbol: 'SectionTabNav' },
        { layer: 'FRONT', path: 'src/features/report/components/CompareTable.tsx', symbol: 'SectionCard' },
      ],
      defects: [],
    },

    {
      id: 'report-compare',
      code: 'R.04',
      title: '비교표 · 클라이언트 조립',
      status: 'BOUND',
      headline: '백엔드에 비교 API가 있으나 이 화면은 쓰지 않는다. 표는 브라우저가 만든다',
      overview: {
        what: '방 상세 응답과 방 목록 요약을 섞어 카테고리별 비교표를 만든다. 서버의 비교 결과를 받아 그리는 것이 아니라 표 자체를 브라우저가 조립한다.',
        where: '섹션 탭 아래 본문 전체. 켜 둔 섹션 수만큼 절이 쌓인다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: '방마다 상세(details[i])를 먼저 보고, 없으면 목록 응답의 raw로 되돌아간다. 두 출처가 한 표에 섞인다',
          source: 'components/CompareTable.tsx#L150',
        },
        {
          actor: 'FRONT',
          step: '기본·건물·문제 요소 절은 상세의 basic/building/interior 구조를 그대로 읽는다',
          source: 'components/CompareTable.tsx#L185',
        },
        {
          actor: 'FRONT',
          step: '내부 상태·안전/생활·주변 환경 절은 답변을 하드코딩된 항목 번호로 찾는다 — ans(details, i, 9) … ans(details, i, 38). 시드에서 항목 id가 바뀌면 그 줄은 예외 없이 조용히 "-"가 된다',
          source: 'components/CompareTable.tsx#L259, #L281, #L297',
        },
        {
          actor: 'BACK',
          step: '서버에도 같은 일을 하는 POST /api/v1/report/compare가 있다. 이 화면은 부르지 않는다 — registry FT-REPORT-COMPARE의 frontendEntry가 비어 있는 이유다',
          source: 'backend/api/report/service/ReportService.java#compareRooms',
        },
        {
          actor: 'BACK',
          step: '진입용 요약 GET /api/v1/report/info도 마찬가지로 소비자가 없다',
          source: 'backend/api/report/service/ReportService.java#getRoomsForCompare',
        },
      ],
      api: [
        {
          operationId: 'report.compare.assemble',
          summary: '받아 둔 방 상세·목록으로 비교표를 브라우저에서 만든다',
          method: 'CLIENT',
          path: 'CompareTable(rooms, activeSections, details)',
          security: 'PUBLIC — 조립 단계에는 서버 호출이 없다. 재료를 받을 때만 JWT가 쓰인다',
          request: 'selectedRooms + roomDetails + activeSections',
          responses: [
            { code: 'render', when: '선택 방이 2개 이상' },
            { code: '"-"', when: '해당 항목 답변이 없거나 항목 번호가 어긋남' },
          ],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'report-data',
          label: '데이터 적재',
          relation: 'USES',
          note: '표의 모든 값이 그 층에서 받은 세 응답에서 나온다.',
        },
        {
          targetId: null,
          label: '백엔드 비교 API (/api/v1/report/info · /api/v1/report/compare)',
          relation: 'INCONSISTENT_WITH',
          note: '같은 비교 로직이 서버와 브라우저 두 곳에 있고 화면은 브라우저 쪽만 쓴다. 2026-08-04 기준 frontend/에 "api/v1/report" 문자열이 0건이다. 그래서 BC-RPT-02~05를 고쳐도 이 화면은 달라지지 않고, 반대로 응답 형태를 바꿔도 이 화면은 깨지지 않는다.',
        },
        {
          targetId: null,
          label: '체크리스트 맞춤 설정(/custom)',
          relation: 'USES',
          note: '거기서 정한 항목 집합이 방 상세의 답변 범위를 정하고, 그 답변이 이 표의 칸을 채운다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/report/components/CompareTable.tsx', symbol: 'CompareTable' },
        { layer: 'FRONT', path: 'src/services/room-mappers.ts', symbol: 'mapApiToForms' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/report/service/ReportService.java', symbol: 'compareRooms' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/report/controller/ReportController.java', symbol: 'getRoomsForCompare' },
      ],
      // 다섯 건 모두 백엔드 /api/v1/report/* 경로의 결함이다.
      // 이 화면이 그 경로를 부르지 않으므로 지금은 사용자에게 나타나지 않는다.
      // 여기 다는 이유는 "이 화면이 대신 하고 있는 일이 무엇의 중복인가"를 가리키기 위해서다.
      defects: ['BC-RPT-01', 'BC-RPT-02', 'BC-RPT-03', 'BC-RPT-04', 'BC-RPT-05'],
    },
  ],
};
