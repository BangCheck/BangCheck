import type { AtlasPageCards } from '@/types/atlas-card';

/**
 * 방 등록(/checklist/new)의 카드.
 *
 * 이 화면의 구조적 특징 둘이 카드 전체를 지배한다.
 *
 * 1. 폼 전체가 서버를 부르지 않는다. 입력은 useChecklistState의 로컬 useState에만 쌓이고,
 *    쓰기 API는 하단 "저장하기" 하나에서만 나간다. /custom과 같은 형태다.
 * 2. 로그인 여부로 두 갈래가 된다. 로그인이면 항목을 서버에서 받고 방을 POST로 만든다.
 *    비로그인이면 정적 카탈로그(GUEST_CHECKLIST_ITEMS)를 쓰고 방을 localStorage에 넣는다.
 *    같은 화면, 같은 버튼인데 목적지가 다르다.
 *
 * pageId는 페이지 맵(research-data.ts)의 노드 id 'checklist'와 맞췄다 —
 * 그 노드의 OPEN CANVAS 링크가 이 캔버스로 오게 하려면 같아야 한다.
 *
 * 미리보기는 토큰이 없어 항상 비로그인 갈래로 그려진다. 그래서 상태 탭을 만들지 않았다 —
 * isLoggedIn을 덮어써도 3개 조회가 401이 나 화면이 오히려 비므로 보여줄 것이 줄어든다.
 * 로그인 갈래의 차이는 각 카드 본문에 적었다.
 *
 * 모든 항목은 2026-08-04 기준 프론트·백엔드 소스를 읽고 적었다.
 */
export const CHECKLIST_NEW_PAGE_CARDS: AtlasPageCards = {
  pageId: 'checklist',
  title: '방 등록 · 현장 체크리스트',
  route: '/checklist/new',
  previewSrc: '/checklist/new?atlasPreview=1',
  states: [],
  cards: [
    {
      id: 'checklist-new-header',
      code: 'N.00',
      title: '페이지 헤더 · 나가기',
      status: 'LIVE',
      headline: '뒤로 가기 하나뿐. 입력값을 지키지 않는다',
      overview: {
        what: '제목과 뒤로 가기 버튼만 있는 얇은 헤더다. 글로벌 헤더 아래에 따로 붙는 두 번째 헤더다.',
        where: '글로벌 헤더 바로 아래(sticky top-14 / md:top-16). 높이 56px.',
      },
      behaviour: [
        { actor: 'USER', step: '왼쪽 화살표를 누른다', source: 'components/ui/ChecklistPageHeader.tsx' },
        {
          actor: 'FRONT',
          step: 'navigate(ROUTES.HOME)으로 /rooms에 간다. 확인 창이 없고 입력한 값은 그대로 사라진다',
          source: 'ChecklistNewPage.tsx#L93',
        },
        {
          actor: 'FRONT',
          step: '/custom에 있는 이탈 가드(beforeunload)에 해당하는 것이 이 화면에는 없다',
          source: 'src/features/customization/SettingsPage.tsx#L53',
        },
      ],
      api: [
        {
          operationId: 'checklistNew.leave',
          summary: '방 목록으로 되돌아간다',
          method: 'CLIENT',
          path: 'navigate(ROUTES.HOME)',
          security: 'PUBLIC — 서버 호출 없음',
          request: null,
          responses: [{ code: 'navigate /rooms', when: '항상. 미저장 입력이 있어도 묻지 않는다' }],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'checklist-new-submit',
          label: '저장 · 방 등록',
          relation: 'INCONSISTENT_WITH',
          note: '저장은 성공하면 /rooms로 가고 뒤로 가기도 /rooms로 간다. 목적지가 같아 사용자는 저장됐는지 여부를 화면 이동으로 구별할 수 없다.',
        },
        {
          targetId: null,
          label: '체크리스트 수정(/checklist/:id)의 헤더',
          relation: 'SHARES_CODE',
          note: '같은 ChecklistPageHeader다. 저쪽은 actions로 삭제 버튼을 하나 더 넣는다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/ui/ChecklistPageHeader.tsx', symbol: 'ChecklistPageHeader' },
        { layer: 'FRONT', path: 'src/features/checklist/ChecklistNewPage.tsx', symbol: 'ChecklistNewPage' },
      ],
      defects: [],
    },

    {
      id: 'checklist-new-tabnav',
      code: 'N.01',
      title: '섹션 탭 · 로그인 분기',
      status: 'LIVE',
      headline: '10개 탭 중 하나가 비로그인에서 사라진다',
      overview: {
        what: '본문 섹션 10개로 건너뛰는 가로 탭이다. 비로그인이면 "나만의 체크 항목" 탭을 빼고 9개만 그린다.',
        where: '페이지 헤더 바로 아래 가로 스크롤 바.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'SECTION_TABS(10개)를 filter로 거른다 — isLoggedIn이 false면 id === "custom"을 뺀다',
          source: 'ChecklistNewPage.tsx#L101',
        },
        { actor: 'USER', step: '탭을 누른다', source: 'components/ui/ChecklistTabNav.tsx' },
        {
          actor: 'FRONT',
          step: 'scrollToSection이 대상 섹션의 문서 좌표에서 HEADER_OFFSET 120px을 빼고 window.scrollTo한다',
          source: 'hooks/use-section-scroll.ts#L59',
        },
        {
          actor: 'FRONT',
          step: 'IntersectionObserver가 가장 많이 보이는 섹션을 활성 탭으로 바꾼다. 등록은 마운트 시 한 번뿐이라(의존성 배열이 비었다) 항목 쿼리가 끝난 뒤에 생기는 섹션은 관찰 대상에 들어가지 않는다',
          source: 'hooks/use-section-scroll.ts#L18',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'checklist-new-dynamic',
          label: '체크 항목 6구간',
          relation: 'USES',
          note: '탭 6개(내부 상태·문제 요소·안전/보안·생활 편의·주변 환경·나만의 체크 항목)가 그 카드의 섹션을 가리킨다.',
        },
        {
          targetId: null,
          label: '체크리스트 수정(/checklist/:id)의 섹션 탭',
          relation: 'INCONSISTENT_WITH',
          note: '같은 컴포넌트인데 저쪽은 filter를 넘기지 않아 비로그인에서도 "나만의 체크 항목" 탭이 남는다. 같은 사용자 상태에서 탭 수가 다르다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/ui/ChecklistTabNav.tsx', symbol: 'ChecklistTabNav' },
        { layer: 'FRONT', path: 'src/features/checklist/hooks/use-section-scroll.ts', symbol: 'useSectionScroll' },
        { layer: 'FRONT', path: 'src/features/checklist/checklist-constants.ts', symbol: 'SECTION_TABS' },
      ],
      defects: [],
    },

    {
      id: 'checklist-new-basic',
      code: 'N.02',
      title: '기본 정보 · 주소 검색',
      status: 'BOUND',
      headline: '이 화면에서 입력 중에 서버를 부르는 유일한 곳',
      overview: {
        what: '매물 이름·주소·거래 유형·보증금·월세·관리비·융자·전입신고·입주가능일을 받는다. 주소 칸만 입력할 때마다 외부 주소 API를 탄다.',
        where: '본문 첫 번째 섹션. 매물정보와 주소가 데스크톱에서 2열로 나란히 놓인다.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '주소 칸에 검색어를 친다',
          source: 'components/ui/AddressSearchInput.tsx#L43',
        },
        {
          actor: 'FRONT',
          step: '입력값을 그대로 basic.address에 넣고, 300ms 디바운스 뒤 searchAddress를 부른다. 입력 중간값도 주소로 저장된다',
          source: 'components/ui/AddressSearchInput.tsx#L31',
        },
        {
          actor: 'BACK',
          step: 'AddressController가 행정안전부 주소 API를 대신 호출해 도로명·지번·우편번호를 돌려준다',
          source: 'backend/.../api/address/service/AddressSearchService.java',
        },
        {
          actor: 'FRONT',
          step: '실패하면 catch가 결과를 비우고 드롭다운을 닫는다. 오류 문구는 나오지 않는다',
          source: 'components/ui/AddressSearchInput.tsx#L36',
        },
        {
          actor: 'USER',
          step: '후보를 고르면 roadAddr가 주소 칸에 들어간다. 고르지 않고 넘어가도 막지 않는다',
          source: 'components/ui/AddressSearchInput.tsx#L50',
        },
        {
          actor: 'FRONT',
          step: '거래 유형이 전세면 월세 칸을 감추고, 관리비 "모름"이면 관리비 칸을 잠그고, 융자 "있음"일 때만 금액 칸을 연다',
          source: 'components/01_basic-info.tsx#L66',
        },
      ],
      api: [
        {
          operationId: 'OP-ADDRESS-SEARCH',
          summary: '주소 검색어로 도로명·지번 후보를 받는다',
          method: 'GET',
          path: '/api/v1/address/search',
          security: 'PUBLIC — SecurityConfig#L61이 GET /api/v1/address/search를 permitAll로 연다. 토큰 없이도 부를 수 있다',
          request: 'query: keyword (빈 문자열이면 프런트가 호출 자체를 막는다)',
          responses: [
            { code: '200', when: 'AddressResult[] — roadAddr · jibunAddr · zipNo' },
            { code: '실패', when: '어떤 오류든 프런트는 결과를 비우고 조용히 닫는다. 화면에 구분이 남지 않는다' },
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
          targetId: 'checklist-new-submit',
          label: '저장 · 방 등록',
          relation: 'USED_BY',
          note: '여기 적은 주소 문자열이 저장 시 서버 지오코딩의 입력이 된다. 검색으로 고른 주소가 아니어도 그대로 넘어간다.',
        },
        {
          targetId: 'checklist-new-submit',
          label: '주소 필수 여부',
          relation: 'INCONSISTENT_WITH',
          note: '화면에서 주소는 선택 항목처럼 보이지만(required 표시 없음, 저장 버튼도 이름만 본다) 서버의 RoomCreateRequestDTO.address는 @NotBlank다. 주소를 비운 채 저장하면 400 "주소는 필수입니다."가 돌아온다.',
        },
        {
          targetId: null,
          label: '지도(/map)의 좌표 표시',
          relation: 'USES',
          note: '여기 넣은 주소가 서버에서 좌표로 바뀌어야 지도에 방이 찍힌다. 좌표 변환은 저장 시점에 일어난다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/01_basic-info.tsx', symbol: 'BasicInfo' },
        { layer: 'FRONT', path: 'src/features/checklist/components/ui/AddressSearchInput.tsx', symbol: 'AddressSearchInput' },
        { layer: 'FRONT', path: 'src/services/address-service.ts', symbol: 'searchAddress' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/address/controller/AddressController.java', symbol: 'search' },
      ],
      defects: [],
    },

    {
      id: 'checklist-new-building',
      code: 'N.03',
      title: '건물 정보',
      status: 'LIVE',
      headline: '전부 코드 안 상수. 서버를 부르지 않는다',
      overview: {
        what: '건물 유형·엘리베이터·층수·방향을 고른다. 선택지는 서버 카탈로그가 아니라 프런트 상수 배열이다.',
        where: '본문 두 번째 섹션.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'BUILDING_TYPES·DIRECTIONS 상수를 그대로 카드로 편다',
          source: 'components/02_building-info.tsx',
        },
        {
          actor: 'USER',
          step: '같은 카드를 다시 누르면 선택이 해제된다(값이 null로 돌아간다)',
          source: 'components/checklist-sections.tsx#BuildingSections',
        },
        {
          actor: 'FRONT',
          step: '"반지하"를 고르면 층수 입력이 잠긴다. 저장 시 floor 대신 specialFloor: SEMI_BASEMENT로 나간다',
          source: 'src/services/room-mappers.ts#buildRoomPayload',
        },
        {
          actor: 'FRONT',
          step: '한글 라벨은 저장 직전에 BUILDING_TYPE_MAP·DIRECTION_MAP으로 enum 문자열이 된다. 매핑에 없는 값이면 null로 나간다',
          source: 'src/services/room-mappers.ts#L11',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'checklist-new-options',
          label: '옵션',
          relation: 'SHARES_CODE',
          note: '같은 BuildingSections 컴포넌트가 두 섹션을 함께 그린다. 다만 옵션 쪽 선택지는 서버 카탈로그에서 온다.',
        },
        {
          targetId: 'checklist-new-submit',
          label: '저장 · 방 등록',
          relation: 'USED_BY',
          note: 'buildingType·hasElevator·floor·specialFloor·direction으로 payload에 실린다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/checklist-sections.tsx', symbol: 'BuildingSections' },
        { layer: 'FRONT', path: 'src/features/checklist/components/02_building-info.tsx', symbol: 'BUILDING_TYPES' },
      ],
      defects: [],
    },

    {
      id: 'checklist-new-options',
      code: 'N.04',
      title: '옵션 (다중 선택)',
      status: 'LIVE',
      headline: '서버 카탈로그의 OPTION 항목. 없으면 섹션째로 사라진다',
      overview: {
        what: '에어컨·세탁기 같은 옵션을 여러 개 고른다. 선택지는 체크리스트 카탈로그에서 category가 OPTION인 항목들이다.',
        where: '건물 정보 바로 아래. optionItems가 0개면 이 섹션은 렌더되지 않는다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'checklistItems에서 category === "OPTION"만 걸러 카드로 편다',
          source: 'ChecklistNewPage.tsx#L44',
        },
        {
          actor: 'USER',
          step: '옵션 카드를 눌러 켜고 끈다',
          source: 'components/checklist-sections.tsx#BuildingSections',
        },
        {
          actor: 'FRONT',
          step: '선택은 id가 아니라 항목 이름 문자열로 building.options 배열에 쌓인다',
          source: 'components/checklist-sections.tsx#toggleOption',
        },
        {
          actor: 'FRONT',
          step: '저장 시 이름으로 항목을 되찾아 optionValue가 "있음"인 선택지 id로 바꾼다. 그 선택지가 없으면 그 옵션은 조용히 빠진다',
          source: 'src/services/room-mappers.ts#mapAnswersToCheckAnswers',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'checklist-new-dynamic',
          label: '체크 항목 6구간',
          relation: 'USES',
          note: '같은 useChecklistItems 쿼리 결과를 카테고리만 달리 쓴다. API 규칙은 그 카드에 있다.',
        },
        {
          targetId: 'checklist-new-submit',
          label: '저장 · 방 등록',
          relation: 'USED_BY',
          note: '고른 옵션이 checkAnswers에 "있음" 답변으로 합류한다. 체크 항목 답변과 같은 배열에 들어간다.',
        },
        {
          targetId: null,
          label: '방 목록의 문제 뱃지(BC-LIST-01)',
          relation: 'SAME_DEFECT',
          note: '이름 문자열로 항목을 잇는 방식이 같다. 시드에서 항목 이름이 바뀌면 이쪽은 저장이 조용히 빠지고 저쪽은 뱃지가 항상 false가 된다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/checklist-sections.tsx', symbol: 'BuildingSections' },
        { layer: 'FRONT', path: 'src/services/room-mappers.ts', symbol: 'mapAnswersToCheckAnswers' },
      ],
      defects: [],
    },

    {
      id: 'checklist-new-dynamic',
      code: 'N.05',
      title: '체크 항목 6구간 (동적)',
      status: 'BOUND',
      headline: '카탈로그가 곧 화면이다. 로그인 여부로 출처가 갈린다',
      overview: {
        what: '내부 상태·문제 요소·안전/보안·생활 편의·주변 환경·나만의 항목 6개 구간을 카탈로그 데이터로 그린다. 항목·선택지·순서가 전부 데이터에서 나온다.',
        where: '옵션 아래부터 메모 위까지. 이 페이지에서 가장 긴 영역이며 6개 섹션이 한 상자에 들어 있다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: '로그인이면 GET /api/checklist/items를 부른다. 비로그인이면 호출 없이 GUEST_CHECKLIST_ITEMS에서 itemType === "DEFAULT"만 쓴다',
          source: 'hooks/use-checklist-items.ts#L33',
        },
        {
          actor: 'FRONT',
          step: '받은 목록에서 폼 카테고리 6종(또는 itemType CUSTOM)이면서 isEnabled인 것만 남긴다. /custom에서 끈 항목은 여기서 사라진다',
          source: 'hooks/use-checklist-items.ts#L37',
        },
        {
          actor: 'FRONT',
          step: 'FORM_CATEGORY_ORDER 순서로 섹션을 만들고, 항목이 없는 카테고리는 통째로 건너뛴다',
          source: 'components/checklist-sections.tsx#DynamicChecklistSections',
        },
        {
          actor: 'FRONT',
          step: '선택지는 서버 값을 그대로 쓰지 않는다 — REVERSE_BE_OPTIONS에 이름이 있는 18개 항목은 순서를 뒤집고, BOOLEAN이면서 SAFETY·CONVENIENCE면 ["있음","없음"]으로 강제한다. 판정 기준이 항목 이름 문자열이다',
          source: 'components/checklist-sections.tsx#L310',
        },
        {
          actor: 'USER',
          step: '선택지를 누른다. 답은 answers[itemId]에 문자열로 저장된다',
          source: 'hooks/use-checklist-state.ts#L33',
        },
        {
          actor: 'FRONT',
          step: '가이드가 있는 항목은 물음표 버튼이 붙는다. 가이드도 항목 이름으로 찾는다',
          source: 'checklist-guides.ts#getGuideByItemName',
        },
      ],
      api: [
        {
          operationId: 'OP-CHECKLIST-ITEMS-CUSTOMIZED',
          summary: '내 설정이 반영된 체크리스트 항목과 선택지를 받는다',
          method: 'GET',
          path: '/api/checklist/items',
          security: 'JWT — SecurityUtil.getCurrentUserId()로 본인 것만. 경로에 userId가 없어 타인 접근 경로가 구조적으로 없다',
          request: '없음. userId는 JWT principal에서 꺼낸다',
          responses: [
            { code: '200', when: 'ChecklistItemResponse[] — 항목 + 선택지' },
            { code: '401', when: '토큰 없음 · Security 필터가 차단. 이때 화면은 항목 0개가 되어 6개 섹션이 통째로 사라진다' },
          ],
          safety: {
            sideEffect: 'READ',
            writes: [],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
        {
          operationId: 'checklistNew.guestCatalog',
          summary: '비로그인일 때 쓰는 정적 카탈로그',
          method: 'CLIENT',
          path: 'GUEST_CHECKLIST_ITEMS (src/features/checklist/data/guest-items.ts)',
          security: 'PUBLIC — 네트워크를 타지 않는다',
          request: 'filter: itemType === "DEFAULT"',
          responses: [
            { code: 'items', when: '항상. BE seed(V17·V19·V20·V22)를 손으로 옮겨 적은 사본이다' },
          ],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'checklist-new-submit',
          label: '저장 · 방 등록',
          relation: 'USED_BY',
          note: 'answers가 checkAnswers로 변환될 때 이 카탈로그로 itemId·optionId를 찾는다. 카탈로그에 없는 답은 경고 로그만 남기고 버려진다.',
        },
        {
          targetId: null,
          label: '체크리스트 맞춤 설정(/custom)',
          relation: 'USES',
          note: '거기서 끈 항목과 고른 유형이 이 화면에 보이는 항목 집합을 그대로 결정한다. 같은 GET /api/checklist/items를 쓴다.',
        },
        {
          targetId: null,
          label: '정적 카탈로그와 서버 시드',
          relation: 'INCONSISTENT_WITH',
          note: 'GUEST_CHECKLIST_ITEMS는 마이그레이션 시드를 손으로 옮긴 사본이다. 시드가 바뀌어도 이 파일은 따라 바뀌지 않는다 — 비로그인 화면만 조용히 낡는다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/checklist-sections.tsx', symbol: 'DynamicChecklistSections' },
        { layer: 'FRONT', path: 'src/features/checklist/hooks/use-checklist-items.ts', symbol: 'useChecklistItems' },
        { layer: 'FRONT', path: 'src/features/checklist/data/guest-items.ts', symbol: 'GUEST_CHECKLIST_ITEMS' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/domain/checklist/service/ChecklistService.java', symbol: 'getCustomizedItems' },
      ],
      defects: ['BC-CHK-03'],
    },

    {
      id: 'checklist-new-memo',
      code: 'N.06',
      title: '메모',
      status: 'LIVE',
      headline: '200자 자유 입력. 이 섹션이 CustomSections의 전부다',
      overview: {
        what: '방에 대한 메모를 200자까지 적는다. 저장 payload의 memo가 된다.',
        where: '본문 마지막 섹션.',
      },
      behaviour: [
        { actor: 'USER', step: '메모를 입력한다. maxLength가 200이라 그 이상은 입력되지 않는다', source: 'components/checklist-sections.tsx#CustomSections' },
        {
          actor: 'FRONT',
          step: 'custom.memo에 담기고 저장 시 memo로 나간다. 빈 문자열이면 필드 자체를 빼고 보낸다',
          source: 'src/services/room-mappers.ts#buildRoomPayload',
        },
        {
          actor: 'FRONT',
          step: 'CustomSections는 이름과 달리 "나만의 항목"을 그리지 않는다. customItems 값과 customRef prop은 받기만 하고 쓰이지 않는다 — 나만의 항목은 N.05의 CUSTOM 카테고리가 그린다',
          source: 'components/checklist-sections.tsx#CustomSections',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'checklist-new-dynamic',
          label: '체크 항목 6구간',
          relation: 'INCONSISTENT_WITH',
          note: '섹션 탭의 "나만의 체크 항목"은 CustomSections가 아니라 저 카드의 CUSTOM 카테고리 섹션을 가리킨다. 이름과 실제 소유자가 어긋난다.',
        },
        {
          targetId: 'checklist-new-submit',
          label: '저장 · 방 등록',
          relation: 'USED_BY',
          note: 'memo 한 필드로 payload에 실린다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/checklist-sections.tsx', symbol: 'CustomSections' },
        { layer: 'FRONT', path: 'src/features/checklist/components/05_custom-memo.tsx', symbol: 'CustomMemoData' },
      ],
      defects: [],
    },

    {
      id: 'checklist-new-submit',
      code: 'N.07',
      title: '저장 · 방 등록',
      status: 'BOUND',
      headline: '이 화면에서 쓰기가 일어나는 유일한 곳. 로그인 여부로 목적지가 갈린다',
      overview: {
        what: '지금까지 로컬에 쌓인 값을 한 번에 반영한다. 로그인이면 방과 체크 답변을 한 요청으로 서버에 만들고, 비로그인이면 localStorage에 넣는다.',
        where: '화면 하단 고정 바. 오류 문구도 여기에 뜬다.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '"저장하기"를 누른다. 매물정보(방 이름)가 비어 있으면 버튼 자체가 비활성이다',
          source: 'ChecklistNewPage.tsx#L153',
        },
        {
          actor: 'FRONT',
          step: '로그인 상태면 apiRooms.length가 ROOM_LIMIT(6) 이상인지 먼저 본다. 이 값은 GET /api/v1/rooms 결과의 길이다 — 이 화면이 그 API를 부르는 유일한 이유다',
          source: 'ChecklistNewPage.tsx#L54',
        },
        {
          actor: 'FRONT',
          step: 'mapAnswersToCheckAnswers가 answers와 옵션 선택을 checkAnswers 배열로 바꾸고, buildRoomPayload가 나머지 필드를 enum·숫자로 맞춘다. 콘솔 로그가 남는다',
          source: 'src/services/room-mappers.ts#L241',
        },
        {
          actor: 'BACK',
          step: '서버도 6개 상한을 다시 센다(countByUserIdAndIsDeletedFalse >= 6 → ROOM_400_LIMIT). 세는 것과 넣는 것 사이에 잠금이 없다',
          source: 'backend/.../api/room/service/RoomService.java#L34',
        },
        {
          actor: 'BACK',
          step: '주소를 지오코딩해 좌표를 얻고, Room.create로 방을 만든 뒤 체크 답변을 같은 트랜잭션에서 저장한다',
          source: 'backend/.../api/room/service/RoomService.java#L38',
        },
        {
          actor: 'FRONT',
          step: '성공하면 rooms 쿼리를 invalidate하고 /rooms로 이동한다',
          source: 'src/features/rooms/hooks/use-rooms-query.ts#L42',
        },
        {
          actor: 'FRONT',
          step: '실패하면 서버의 message를 그대로 띄우고 이동하지 않는다. message가 없으면 고정 문구가 나간다',
          source: 'ChecklistNewPage.tsx#L64',
        },
        {
          actor: 'FRONT',
          step: '비로그인이면 게스트 방이 2개 이상인지 보고, 동적 answers를 레거시 interior/safety 구조로 변환한 뒤 addGuestRoom으로 localStorage에 넣는다. 서버 호출은 없다',
          source: 'ChecklistNewPage.tsx#L77',
        },
      ],
      api: [
        {
          operationId: 'OP-ROOM-CREATE-WITH-CHECKLIST',
          summary: '방과 체크리스트 답변을 한 요청으로 등록한다',
          method: 'POST',
          path: '/api/v1/rooms/check-results',
          security: 'JWT — userId는 SecurityUtil.getCurrentUserId()에서만 온다. 본문으로 받지 않는다',
          request: 'body: address + name · rentType · deposit · rent · managementFee · hasLoan · loanAmount · canRegisterAddress · moveInDate · buildingType · floor · specialFloor · direction · memo · checkAnswers[]',
          responses: [
            { code: '200', when: '등록 성공. ApiResponse<RoomCreateResponseDTO>' },
            { code: '400', when: '방 6개 초과(ROOM_400_LIMIT) · name/address 공백(@NotBlank) · 전세인데 보증금 없음 · 월세인데 월세 없음 · 융자 있음인데 금액 없음' },
            { code: '401', when: '토큰 없음' },
            { code: '500', when: '지오코딩 provider가 4xx·5xx·timeout을 냈을 때. 원인이 응답에 남지 않는다 (BC-REG-04)' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['rooms', 'room_check_results', 'room_check_selected_options'],
            rerunSafe: false,
            abortOnFail: 'FULL_ROLLBACK',
          },
        },
        {
          operationId: 'OP-ROOM-LIST',
          summary: '내 방 개수를 세어 6개 상한을 판정한다',
          method: 'GET',
          path: '/api/v1/rooms',
          security: 'JWT',
          request: '파라미터 없이 부른다(rentType·sort 미지정). 이 화면은 목록 내용을 쓰지 않고 length만 본다',
          responses: [
            { code: '200', when: 'Room[] — 이 화면은 개수만 읽는다' },
            { code: '401', when: '토큰 없음. enabled: isLoggedIn이라 비로그인이면 호출 자체가 없다' },
          ],
          safety: {
            sideEffect: 'READ',
            writes: [],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
        {
          operationId: 'checklistNew.saveGuestRoom',
          summary: '비로그인일 때 방을 브라우저에 저장한다',
          method: 'CLIENT',
          path: 'useGuestRoomStore.addGuestRoom → localStorage["guest-room-storage"]',
          security: 'PUBLIC — 서버를 부르지 않는다',
          request: 'basic · building · 변환된 interior/safety · custom',
          responses: [
            { code: 'true', when: '저장 성공. /rooms로 이동한다' },
            { code: 'false', when: '게스트 방이 이미 2개(GUEST_ROOM_LIMIT). 한도 문구가 뜬다' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['localStorage:guest-room-storage'],
            rerunSafe: false,
            abortOnFail: 'NONE',
          },
        },
      ],
      related: [
        {
          targetId: 'checklist-new-dynamic',
          label: '체크 항목 6구간',
          relation: 'USES',
          note: 'answers를 checkAnswers로 바꿀 때 그 카탈로그의 itemId·optionId가 필요하다. 카탈로그가 비면 답변도 함께 사라진다.',
        },
        {
          targetId: 'checklist-new-basic',
          label: '기본 정보 · 주소',
          relation: 'USES',
          note: '주소 문자열이 서버 지오코딩의 입력이다. 지오코딩 실패는 이 요청 전체를 500으로 만든다.',
        },
        {
          targetId: null,
          label: '글로벌 헤더의 "체크리스트 시작하기"',
          relation: 'SHARES_CODE',
          note: '헤더도 같은 useRoomsList(같은 query key)로 6개 상한을 보고 버튼을 잠근다. 네트워크 요청은 캐시 공유로 한 번만 나간다.',
        },
        {
          targetId: null,
          label: '체크리스트 수정(/checklist/:id)의 수정 완료',
          relation: 'SHARES_CODE',
          note: '같은 buildRoomPayload·mapAnswersToCheckAnswers를 쓴다. 다만 저쪽은 상한 검사도 지오코딩 필수 조건도 다르다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/ChecklistNewPage.tsx', symbol: 'handleSubmit' },
        { layer: 'FRONT', path: 'src/services/room-service.ts', symbol: 'createRoomWithChecklist' },
        { layer: 'FRONT', path: 'src/store/use-guest-room-store.ts', symbol: 'addGuestRoom' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/controller/RoomController.java', symbol: 'createRoom' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/service/RoomService.java', symbol: 'createRoomWithCheckAnswers' },
      ],
      defects: ['BC-REG-01', 'BC-REG-02', 'BC-REG-03', 'BC-REG-04', 'BC-REG-05', 'BC-ARCH-02'],
    },
  ],
};
