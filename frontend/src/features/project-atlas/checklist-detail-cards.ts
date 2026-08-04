import type { AtlasPageCards } from '@/types/atlas-card';

/**
 * 체크리스트 수정(/checklist/:id)의 카드.
 *
 * 이 화면은 /checklist/new와 폼 컴포넌트를 통째로 공유한다 —
 * ChecklistPageHeader · ChecklistTabNav · BasicInfo · BuildingSections ·
 * DynamicChecklistSections · CustomSections · ChecklistSubmitFooter가 모두 같은 파일이다.
 * 그래서 마커 값을 컴포넌트에 고정하지 않고 페이지가 prop으로 넘긴다(SectionWrapper와 같은 방식).
 * 두 페이지의 카드 id가 다른 이유가 이것이다 — 같은 DOM이 아니라 같은 코드를 쓸 뿐이고,
 * 부르는 API도 다루는 결함도 다르기 때문에 카드를 합칠 수 없다.
 *
 * 다른 점 셋이 이 페이지를 등록 화면과 갈라놓는다.
 *   1. 진입 시 기존 값을 채운다 — 로그인은 GET /api/v1/rooms/{id}, 비로그인은 localStorage.
 *   2. 저장이 PUT이고, 서버는 기존 답변을 전부 지우고 다시 넣는다.
 *   3. 삭제가 있다. 헤더 버튼 → 확인 모달 → DELETE.
 *
 * 미리보기는 실재하지 않는 id로 열리므로 기본 상태에서만 '찾을 수 없음' 분기를 건너뛴다.
 * 그 우회는 DEV 미리보기에서만 작동한다(ChecklistDetailPage.tsx#L125 주석 참조).
 *
 * 모든 항목은 2026-08-04 기준 프론트·백엔드 소스를 읽고 적었다.
 */
export const CHECKLIST_DETAIL_PAGE_CARDS: AtlasPageCards = {
  pageId: 'checklist-detail',
  title: '체크리스트 수정 · 삭제',
  route: '/checklist/:id',
  previewSrc: '/checklist/atlas-preview?atlasPreview=1',
  states: [
    {
      id: 'default',
      label: '수정 폼',
      note: '평소 이 화면의 본 모습. 헤더·탭·폼·하단 바가 모두 보인다.',
      caveat: '미리보기 주소의 id(atlas-preview)는 실재하지 않는다. 기본 상태에서만 "찾을 수 없음" 분기를 건너뛰고 빈 폼을 그린다. 값이 채워진 모습은 토큰과 백엔드가 있어야 볼 수 있다.',
    },
    {
      id: 'delete',
      label: '삭제 확인',
      note: '헤더의 삭제를 눌렀을 때 뜨는 확인 모달. 화면 전체를 덮는 오버레이라 아래 폼이 가려진다.',
      caveat: '미리보기에서는 모달이 열린 채 고정된다 — 취소를 눌러도 닫히지 않는다. 상태를 그리는 것이 목적이기 때문이다.',
    },
    {
      id: 'notfound',
      label: '찾을 수 없음',
      note: '없는 방·남의 방·삭제된 방으로 들어왔을 때. 폼 대신 안내 한 장만 남는다.',
      caveat: '이 상태에서는 폼 영역이 존재하지 않아 D.08 말고는 어떤 카드도 영역과 연결되지 않는다.',
    },
  ],
  cards: [
    {
      id: 'checklist-detail-header',
      code: 'D.00',
      title: '페이지 헤더 · 삭제 진입',
      status: 'LIVE',
      headline: '등록 화면과 같은 헤더에 삭제 버튼 하나가 더 있다',
      overview: {
        what: '제목("체크리스트 수정")과 뒤로 가기, 그리고 오른쪽 끝에 삭제 버튼이 있다. 삭제 버튼은 곧바로 지우지 않고 확인 모달을 연다.',
        where: '글로벌 헤더 바로 아래(sticky top-14 / md:top-16). 높이 56px.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '뒤로 가기를 누르면 /rooms로 간다. 수정 중인 값은 확인 없이 버려진다',
          source: 'ChecklistDetailPage.tsx#L158',
        },
        {
          actor: 'USER',
          step: '오른쪽 "삭제"를 누른다',
          source: 'ChecklistDetailPage.tsx#L164',
        },
        {
          actor: 'FRONT',
          step: 'setConfirmDelete(true)로 확인 모달만 연다. 이 시점에 API는 나가지 않는다',
          source: 'ChecklistDetailPage.tsx#L164',
        },
      ],
      api: [
        {
          operationId: 'checklistDetail.openDeleteConfirm',
          summary: '삭제 확인 모달을 연다',
          method: 'CLIENT',
          path: 'setConfirmDelete(true)',
          security: 'PUBLIC — 서버 호출 없음. 소유권 판정도 여기서는 하지 않는다',
          request: null,
          responses: [{ code: 'modal', when: '항상' }],
          safety: { sideEffect: 'NONE', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'checklist-detail-delete',
          label: '삭제 확인 · 방 삭제',
          relation: 'USED_BY',
          note: '이 버튼이 그 모달을 여는 유일한 입구다.',
        },
        {
          targetId: null,
          label: '방 등록(/checklist/new)의 헤더',
          relation: 'SHARES_CODE',
          note: '같은 ChecklistPageHeader에 actions만 다르게 넘긴 것이다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/ui/ChecklistPageHeader.tsx', symbol: 'ChecklistPageHeader' },
        { layer: 'FRONT', path: 'src/features/checklist/ChecklistDetailPage.tsx', symbol: 'ChecklistDetailPage' },
      ],
      defects: [],
    },

    {
      id: 'checklist-detail-tabnav',
      code: 'D.01',
      title: '섹션 탭',
      status: 'LIVE',
      headline: '등록 화면과 달리 탭을 거르지 않는다',
      overview: {
        what: '본문 섹션으로 건너뛰는 가로 탭이다. filter를 넘기지 않아 로그인 여부와 무관하게 SECTION_TABS 10개가 모두 그려진다.',
        where: '페이지 헤더 바로 아래.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'ChecklistTabNav를 filter 없이 부른다 — SECTION_TABS 10개가 그대로 나온다',
          source: 'ChecklistDetailPage.tsx#L171',
        },
        {
          actor: 'USER',
          step: '탭을 누르면 해당 섹션으로 스크롤한다(HEADER_OFFSET 120px 보정)',
          source: 'hooks/use-section-scroll.ts#L59',
        },
        {
          actor: 'FRONT',
          step: '"나만의 체크 항목" 탭은 CUSTOM 카테고리 섹션이 있어야 동작한다. 비로그인 카탈로그에는 그 카테고리가 없어 탭만 남고 눌러도 아무 일이 없다(sectionRefs가 null이면 조용히 반환한다)',
          source: 'hooks/use-section-scroll.ts#L60',
        },
      ],
      api: [],
      related: [
        {
          targetId: null,
          label: '방 등록(/checklist/new)의 섹션 탭',
          relation: 'INCONSISTENT_WITH',
          note: '저쪽은 filter={(id) => isLoggedIn || id !== "custom"}을 넘겨 비로그인에서 탭을 9개로 줄인다. 같은 컴포넌트, 같은 사용자 상태인데 탭 수가 다르다.',
        },
        {
          targetId: 'checklist-detail-dynamic',
          label: '체크 항목 6구간 · 답변 복원',
          relation: 'USES',
          note: '탭 6개가 그 카드의 섹션을 가리킨다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/ui/ChecklistTabNav.tsx', symbol: 'ChecklistTabNav' },
        { layer: 'FRONT', path: 'src/features/checklist/hooks/use-section-scroll.ts', symbol: 'useSectionScroll' },
      ],
      defects: [],
    },

    {
      id: 'checklist-detail-basic',
      code: 'D.02',
      title: '기본 정보 · 기존 값 적재',
      status: 'BOUND',
      headline: '이 화면의 데이터 적재가 시작되는 곳. 주소 검색도 여기에 있다',
      overview: {
        what: '등록 화면과 같은 기본 정보 폼이다. 다른 점은 처음부터 값이 채워져 있다는 것 — 로그인이면 GET /api/v1/rooms/{id}, 비로그인이면 브라우저 저장소에서 읽어 폼 전체를 초기화한다.',
        where: '본문 첫 번째 섹션. 적재 자체는 페이지 전체에 걸리는 일이지만 눈에 처음 보이는 결과가 여기다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: '로그인이면 useRoomDetail(id)로 방 하나를 받는다. 비로그인이면 enabled가 false라 호출 자체가 없다',
          source: 'ChecklistDetailPage.tsx#L49',
        },
        {
          actor: 'BACK',
          step: 'findByIdAndUserIdAndIsDeletedFalse로 본인·미삭제 방만 찾는다. 없으면 ROOM_404다 — 남의 방도 같은 404라서 존재 여부가 새지 않는다',
          source: 'backend/.../api/room/service/RoomService.java#L135',
        },
        {
          actor: 'FRONT',
          step: 'mapApiToForms가 응답을 basic·building·interior·answers·custom 5개 폼 상태로 나눈다',
          source: 'src/services/room-mappers.ts#L180',
        },
        {
          actor: 'FRONT',
          step: '조회 실패면 notFound를 켜고 폼 대신 안내 화면을 그린다',
          source: 'ChecklistDetailPage.tsx#L56',
        },
        {
          actor: 'FRONT',
          step: '비로그인이면 getGuestRoom(id)로 브라우저 저장소에서 읽는다. 주석은 sessionStorage라고 적혀 있으나 실제 저장소는 localStorage다(use-guest-room-store.ts#L140)',
          source: 'ChecklistDetailPage.tsx#L67',
        },
        {
          actor: 'USER',
          step: '주소를 다시 검색해 바꿀 수 있다. 등록 화면과 같은 300ms 디바운스 · 같은 공개 API다',
          source: 'components/ui/AddressSearchInput.tsx#L31',
        },
      ],
      api: [
        {
          operationId: 'OP-ROOM-DETAIL',
          summary: '방 하나를 체크 답변과 함께 받는다',
          method: 'GET',
          path: '/api/v1/rooms/{id}',
          security: 'JWT — 조회 조건에 userId가 함께 들어간다. 남의 방은 404가 되어 IDOR가 성립하지 않는다',
          request: 'path: id',
          responses: [
            { code: '200', when: 'RoomDetailResponseDTO — 방 필드 + checkResults[]' },
            { code: '404', when: '없는 방 · 남의 방 · soft delete된 방(ROOM_404). 화면은 "찾을 수 없어요"로 바뀐다' },
            { code: '401', when: '토큰 없음' },
          ],
          safety: {
            sideEffect: 'READ',
            writes: [],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
        {
          operationId: 'OP-ADDRESS-SEARCH',
          summary: '주소 검색어로 도로명·지번 후보를 받는다',
          method: 'GET',
          path: '/api/v1/address/search',
          security: 'PUBLIC — SecurityConfig#L61이 permitAll로 연다',
          request: 'query: keyword',
          responses: [
            { code: '200', when: 'AddressResult[] — roadAddr · jibunAddr · zipNo' },
            { code: '실패', when: '프런트가 결과를 비우고 드롭다운을 닫는다. 오류 표시는 없다' },
          ],
          safety: { sideEffect: 'EXTERNAL', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
        {
          operationId: 'checklistDetail.loadGuestRoom',
          summary: '비로그인일 때 브라우저에 저장된 방을 읽는다',
          method: 'CLIENT',
          path: 'useGuestRoomStore.getGuestRoom → localStorage["guest-room-storage"]',
          security: 'PUBLIC — 서버를 부르지 않는다. 다른 브라우저·시크릿 창에서는 같은 id라도 없다',
          request: 'path의 id',
          responses: [
            { code: 'room', when: '이 브라우저가 저장한 게스트 방일 때' },
            { code: 'notFound', when: 'raw가 없거나 id가 없을 때 — 안내 화면으로 넘어간다' },
          ],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'checklist-detail-notfound',
          label: '찾을 수 없음',
          relation: 'USED_BY',
          note: '이 적재가 실패하면 그 화면이 대신 그려진다. 로그인·비로그인 두 경로가 같은 화면으로 모인다.',
        },
        {
          targetId: 'checklist-detail-options',
          label: '옵션',
          relation: 'USES',
          note: 'mapApiToForms가 OPTION 답변을 옵션 선택으로 되돌리려면 항목 카탈로그가 필요하다. 그 카탈로그가 늦게 오면 복원이 어긋난다.',
        },
        {
          targetId: null,
          label: '방 등록(/checklist/new)의 기본 정보',
          relation: 'SHARES_CODE',
          note: '같은 BasicInfo·AddressSearchInput이다. 다만 등록 쪽 서버 DTO는 address가 @NotBlank이고 수정 쪽 RoomUpdateRequestDTO는 아니다 — 같은 폼인데 서버 규칙이 다르다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/ChecklistDetailPage.tsx', symbol: 'useRoomDetail' },
        { layer: 'FRONT', path: 'src/features/checklist/components/01_basic-info.tsx', symbol: 'BasicInfo' },
        { layer: 'FRONT', path: 'src/services/room-mappers.ts', symbol: 'mapApiToForms' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/controller/RoomController.java', symbol: 'getRoom' },
      ],
      defects: [],
    },

    {
      id: 'checklist-detail-building',
      code: 'D.03',
      title: '건물 정보',
      status: 'LIVE',
      headline: '상수 선택지에 서버 값을 되돌려 얹는다',
      overview: {
        what: '건물 유형·엘리베이터·층수·방향. 선택지는 프런트 상수이고, 초기값만 서버 응답을 한글 라벨로 되돌린 것이다.',
        where: '본문 두 번째 섹션.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'API_TO_BUILDING_TYPE·API_TO_DIRECTION으로 enum을 한글 라벨로 되돌린다. 매핑에 없는 값이면 선택이 없는 상태로 보인다',
          source: 'src/services/room-mappers.ts#L26',
        },
        {
          actor: 'FRONT',
          step: 'hasElevator는 boolean이라 값이 없어도 "없음"으로 복원된다 — 미입력과 없음이 구별되지 않는다',
          source: 'src/services/room-mappers.ts#L228',
        },
        {
          actor: 'FRONT',
          step: 'specialFloor가 SEMI_BASEMENT면 "반지하"로 되돌리고 층수 입력을 잠근다',
          source: 'src/services/room-mappers.ts#L229',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'checklist-detail-basic',
          label: '기본 정보 · 기존 값 적재',
          relation: 'USES',
          note: '같은 mapApiToForms 한 번의 결과를 나눠 받는다.',
        },
        {
          targetId: 'checklist-detail-submit',
          label: '수정 완료',
          relation: 'USED_BY',
          note: '되돌린 라벨을 다시 enum으로 바꿔 payload에 싣는다. 왕복 매핑이 두 번 일어난다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/checklist-sections.tsx', symbol: 'BuildingSections' },
        { layer: 'FRONT', path: 'src/services/room-mappers.ts', symbol: 'mapApiToForms' },
      ],
      defects: [],
    },

    {
      id: 'checklist-detail-options',
      code: 'D.04',
      title: '옵션 (다중 선택)',
      status: 'LIVE',
      headline: '복원이 두 쿼리의 도착 순서에 달려 있다',
      overview: {
        what: '카탈로그의 OPTION 항목을 다중 선택한다. 기존 선택은 방 상세 응답의 답변에서 되살린다.',
        where: '건물 정보 아래. 카탈로그에 OPTION 항목이 없으면 섹션째로 사라진다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'useRoomDetail에 checklistItems를 넘겨 mapApiToForms가 OPTION 항목 이름 집합을 만든다',
          source: 'ChecklistDetailPage.tsx#L49',
        },
        {
          actor: 'FRONT',
          step: '답변 중 그 집합에 있고 값이 "있음"인 것만 building.options로 되돌린다',
          source: 'src/services/room-mappers.ts#L192',
        },
        {
          actor: 'FRONT',
          step: 'items는 queryKey에 들어가지 않는다(rooms.detail(roomId)뿐). 항목 쿼리가 방 상세보다 늦게 끝나면 빈 집합으로 매핑된 결과가 캐시에 남고, 그때 OPTION 답변은 옵션 선택이 아니라 일반 answers로 적재된다 — 소스 주석이 같은 사실을 적어두었다',
          source: 'src/services/room-mappers.ts#L185',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'checklist-detail-dynamic',
          label: '체크 항목 6구간 · 답변 복원',
          relation: 'USES',
          note: '같은 useChecklistItems 결과를 카테고리만 달리 쓴다. API 규칙은 그 카드에 있다.',
        },
        {
          targetId: 'checklist-detail-submit',
          label: '수정 완료',
          relation: 'USED_BY',
          note: '옵션 이름을 다시 "있음" 선택지 id로 바꿔 checkAnswers에 합류시킨다. 복원이 어긋난 채 저장하면 그 어긋남이 서버에 고정된다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/checklist-sections.tsx', symbol: 'BuildingSections' },
        { layer: 'FRONT', path: 'src/services/room-mappers.ts', symbol: 'mapApiToForms' },
        { layer: 'FRONT', path: 'src/features/rooms/hooks/use-rooms-query.ts', symbol: 'useRoomDetail' },
      ],
      defects: [],
    },

    {
      id: 'checklist-detail-dynamic',
      code: 'D.05',
      title: '체크 항목 6구간 · 답변 복원',
      status: 'BOUND',
      headline: '카탈로그로 그리고, 저장된 답변을 그 위에 얹는다',
      overview: {
        what: '내부 상태·문제 요소·안전/보안·생활 편의·주변 환경·나만의 항목 6구간. 항목은 카탈로그에서, 선택 상태는 방 상세의 답변에서 온다.',
        where: '옵션 아래부터 메모 위까지. 이 페이지에서 가장 긴 영역이며 6개 섹션이 한 상자에 들어 있다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: '로그인이면 GET /api/checklist/items, 비로그인이면 GUEST_CHECKLIST_ITEMS의 DEFAULT 항목으로 화면을 짠다. 등록 화면과 같은 훅이다',
          source: 'hooks/use-checklist-items.ts#L33',
        },
        {
          actor: 'FRONT',
          step: '답변은 answers[itemId] = 선택지 문자열로 복원된다. 지금 카탈로그에 없는 itemId의 답은 화면에 나타나지 않는다',
          source: 'src/services/room-mappers.ts#L204',
        },
        {
          actor: 'FRONT',
          step: '선택지 순서 보정(REVERSE_BE_OPTIONS 18개)과 BOOLEAN 강제 치환이 여기서도 그대로 걸린다. 저장된 값이 보정된 목록에 없으면 아무것도 선택되지 않은 것처럼 보인다',
          source: 'components/checklist-sections.tsx#L310',
        },
        {
          actor: 'USER',
          step: '선택을 바꾼다. 값은 로컬 answers에만 쌓이고 하단 "수정 완료"에서 한 번에 나간다',
          source: 'hooks/use-checklist-state.ts#L33',
        },
      ],
      api: [
        {
          operationId: 'OP-CHECKLIST-ITEMS-CUSTOMIZED',
          summary: '내 설정이 반영된 체크리스트 항목과 선택지를 받는다',
          method: 'GET',
          path: '/api/checklist/items',
          security: 'JWT — SecurityUtil.getCurrentUserId()로 본인 것만',
          request: '없음. userId는 JWT principal에서 꺼낸다',
          responses: [
            { code: '200', when: 'ChecklistItemResponse[] — 항목 + 선택지' },
            { code: '401', when: '토큰 없음. 항목이 0개가 되어 6개 섹션이 통째로 사라지고, 저장된 답변도 화면에서 사라진다' },
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
          targetId: 'checklist-detail-submit',
          label: '수정 완료',
          relation: 'USED_BY',
          note: '카탈로그에서 optionId를 찾아 checkAnswers를 만든다. 화면에 못 그린 답변은 payload에도 없고, 서버는 기존 답변을 지우고 덮으므로 그대로 사라진다.',
        },
        {
          targetId: null,
          label: '체크리스트 맞춤 설정(/custom)',
          relation: 'USES',
          note: '거기서 항목을 끄면 이 화면에서 그 항목이 사라진다. 이미 저장된 답변이 있어도 마찬가지다.',
        },
        {
          targetId: null,
          label: '방 등록(/checklist/new)의 체크 항목',
          relation: 'SHARES_CODE',
          note: '같은 DynamicChecklistSections·useChecklistItems다. 등록은 빈 폼에서 시작하고 이쪽은 복원값 위에서 시작한다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/checklist-sections.tsx', symbol: 'DynamicChecklistSections' },
        { layer: 'FRONT', path: 'src/features/checklist/hooks/use-checklist-items.ts', symbol: 'useChecklistItems' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/domain/checklist/service/ChecklistService.java', symbol: 'getCustomizedItems' },
      ],
      defects: ['BC-CHK-03'],
    },

    {
      id: 'checklist-detail-memo',
      code: 'D.06',
      title: '메모',
      status: 'LIVE',
      headline: '200자 자유 입력. 서버 값을 그대로 되돌린다',
      overview: {
        what: '방 메모를 고친다. 초기값은 방 상세의 memo이고, 비면 빈 문자열이다.',
        where: '본문 마지막 섹션.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'mapApiToForms가 custom을 { customItems: [], memo }로 만든다 — customItems는 어떤 경로로도 채워지지 않는다',
          source: 'src/services/room-mappers.ts#L236',
        },
        { actor: 'USER', step: '메모를 고친다. maxLength 200이라 그 이상은 입력되지 않는다', source: 'components/checklist-sections.tsx#CustomSections' },
        {
          actor: 'FRONT',
          step: '빈 문자열이면 payload에서 memo 필드가 아예 빠진다 — 메모를 지우는 요청과 안 보낸 요청이 서버에서 같은 모양이 된다',
          source: 'src/services/room-mappers.ts#buildRoomPayload',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'checklist-detail-submit',
          label: '수정 완료',
          relation: 'USED_BY',
          note: 'memo 한 필드로 payload에 실린다.',
        },
        {
          targetId: null,
          label: '방 등록(/checklist/new)의 메모',
          relation: 'SHARES_CODE',
          note: '같은 CustomSections다. 이름과 달리 "나만의 항목"은 그리지 않는다 — 그쪽은 CUSTOM 카테고리 섹션이 맡는다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/components/checklist-sections.tsx', symbol: 'CustomSections' },
        { layer: 'FRONT', path: 'src/services/room-mappers.ts', symbol: 'buildRoomPayload' },
      ],
      defects: [],
    },

    {
      id: 'checklist-detail-submit',
      code: 'D.07',
      title: '수정 완료 · 덮어쓰기',
      status: 'BOUND',
      headline: '서버가 기존 답변을 전부 지우고 다시 넣는다',
      overview: {
        what: '폼 전체를 한 요청으로 보낸다. 방 필드는 갱신되고, 체크 답변은 갱신이 아니라 전체 교체다.',
        where: '화면 하단 고정 바. 오류 문구도 여기에 뜬다.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '"수정 완료"를 누른다. 방 이름이 비어 있으면 버튼이 비활성이다',
          source: 'ChecklistDetailPage.tsx#L226',
        },
        {
          actor: 'FRONT',
          step: '등록 화면과 같은 mapAnswersToCheckAnswers·buildRoomPayload로 payload를 만들어 PUT한다',
          source: 'src/services/room-service.ts#L53',
        },
        {
          actor: 'BACK',
          step: 'findByIdAndUserIdAndIsDeletedFalse로 소유권과 삭제 여부를 확인한다. 아니면 404다',
          source: 'backend/.../api/room/service/RoomService.java#L147',
        },
        {
          actor: 'BACK',
          step: '주소가 null이 아니면 매번 지오코딩을 다시 부른다. 프런트는 빈 문자열이라도 항상 address를 보내므로 사실상 매 저장마다 외부 호출이 일어난다',
          source: 'backend/.../api/room/service/RoomService.java#L153',
        },
        {
          actor: 'BACK',
          step: 'checkAnswers가 비어 있지 않을 때만 답변을 손댄다. 손댈 때는 방의 기존 결과와 선택지를 전부 삭제하고 새로 넣는다 — 그래서 답변을 모두 지운 채 저장하면 서버에는 옛 답변이 남는다',
          source: 'backend/.../api/room/service/RoomCheckResultService.java#L76',
        },
        {
          actor: 'FRONT',
          step: '성공하면 rooms 쿼리를 invalidate하고 /rooms로 이동한다. 실패하면 서버 message를 그대로 띄우고 머문다',
          source: 'ChecklistDetailPage.tsx#L92',
        },
        {
          actor: 'FRONT',
          step: '비로그인이면 updateGuestRoom으로 브라우저 저장소만 고친다. 실패하면 "방 정보를 찾을 수 없어요"가 뜬다',
          source: 'ChecklistDetailPage.tsx#L101',
        },
      ],
      api: [
        {
          operationId: 'OP-ROOM-UPDATE',
          summary: '방과 체크 답변을 수정한다',
          method: 'PUT',
          path: '/api/v1/rooms/{id}',
          security: 'JWT — userId를 조회 조건에 넣어 남의 방은 404가 된다',
          request: 'path: id · body: address + 방 필드 전체 + checkAnswers[]. RoomUpdateRequestDTO는 name만 @NotBlank이고 address에는 제약이 없다',
          responses: [
            { code: '200', when: '수정 성공. ApiResponse<RoomCreateResponseDTO>' },
            { code: '404', when: '없는 방 · 남의 방 · 삭제된 방(ROOM_404)' },
            { code: '400', when: '방 이름 공백 · 전세인데 보증금 없음 등 임대조건 검증 위반' },
            { code: '500', when: '지오코딩 provider 오류가 미래핑으로 새는 경우 (BC-REG-04)' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['rooms', 'room_check_results', 'room_check_selected_options'],
            rerunSafe: true,
            abortOnFail: 'FULL_ROLLBACK',
          },
        },
        {
          operationId: 'checklistDetail.saveGuestRoom',
          summary: '비로그인일 때 브라우저에 저장된 방을 고친다',
          method: 'CLIENT',
          path: 'useGuestRoomStore.updateGuestRoom → localStorage["guest-room-storage"]',
          security: 'PUBLIC — 서버를 부르지 않는다',
          request: 'id + basic · building · interior · safety · custom',
          responses: [
            { code: 'true', when: '해당 id의 방을 찾아 덮었을 때. /rooms로 이동한다' },
            { code: 'false', when: '그 id가 목록에 없을 때 — 문구만 띄우고 머문다' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['localStorage:guest-room-storage'],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
      ],
      related: [
        {
          targetId: 'checklist-detail-dynamic',
          label: '체크 항목 6구간 · 답변 복원',
          relation: 'USES',
          note: '화면에 그려진 답변만 payload에 실린다. 서버가 전체 교체를 하므로 화면에서 빠진 답변은 저장과 동시에 사라진다.',
        },
        {
          targetId: 'checklist-detail-delete',
          label: '삭제 확인 · 방 삭제',
          relation: 'SHARES_CODE',
          note: '둘 다 성공하면 /rooms로 가고 rooms 쿼리를 invalidate한다.',
        },
        {
          targetId: null,
          label: '고아 답변 저장 엔드포인트 (BC-SEC-01)',
          relation: 'INCONSISTENT_WITH',
          note: '같은 답변을 저장하는 POST /api/v1/rooms/{id}/check-results가 따로 있지만 이 화면은 쓰지 않는다. 그쪽은 소유권도 삭제 여부도 보지 않는다 — 프런트 소비자가 0건이라 지금은 드러나지 않는다.',
        },
        {
          targetId: null,
          label: '방 등록(/checklist/new)의 저장',
          relation: 'SHARES_CODE',
          note: '같은 buildRoomPayload·mapAnswersToCheckAnswers를 쓴다. 등록은 6개 상한을 보고 비멱등이며, 수정은 상한이 없고 같은 요청을 반복해도 결과가 같다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/ChecklistDetailPage.tsx', symbol: 'handleUpdate' },
        { layer: 'FRONT', path: 'src/services/room-service.ts', symbol: 'updateRoomWithChecklist' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/controller/RoomController.java', symbol: 'updateRoom' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/service/RoomCheckResultService.java', symbol: 'updateCheckResults' },
      ],
      defects: ['BC-REG-02', 'BC-REG-03', 'BC-REG-04', 'BC-ARCH-01'],
    },

    {
      id: 'checklist-detail-delete',
      code: 'D.08',
      title: '삭제 확인 · 방 삭제',
      status: 'BOUND',
      headline: '확인 한 번, 그리고 되돌릴 수 없다 (서버는 soft delete)',
      overview: {
        what: '헤더의 삭제를 누르면 뜨는 확인 모달이다. 삭제를 누르면 방과 체크 정보가 목록에서 사라지고 곧바로 /rooms로 나간다.',
        where: '화면 전체를 덮는 오버레이. 기본 상태에서는 존재하지 않아 영역이 잡히지 않는다 — 상태 탭 "삭제 확인"에서 볼 수 있다.',
      },
      behaviour: [
        { actor: 'USER', step: '모달에서 "삭제"를 누른다', source: 'ChecklistDetailPage.tsx#L255' },
        {
          actor: 'FRONT',
          step: '로그인이면 DELETE /api/v1/rooms/{id}를 부른다',
          source: 'ChecklistDetailPage.tsx#L113',
        },
        {
          actor: 'BACK',
          step: '본인·미삭제 방을 찾아 softDelete()를 건다. 행은 남고 isDeleted만 바뀐다 — 화면 문구("모든 체크 정보가 사라져요")와 실제 저장 상태가 다르다',
          source: 'backend/.../api/room/service/RoomService.java#L140',
        },
        {
          actor: 'FRONT',
          step: '성공하면 rooms 쿼리를 invalidate하고 /rooms로 이동한다',
          source: 'src/features/rooms/hooks/use-rooms-query.ts#L22',
        },
        {
          actor: 'FRONT',
          step: '실패하면 콘솔 오류를 남기고 하단 바에 문구를 띄운다. 모달은 열린 채로 남는다',
          source: 'ChecklistDetailPage.tsx#L116',
        },
        {
          actor: 'FRONT',
          step: '비로그인이면 deleteGuestRoom으로 브라우저 저장소에서만 지운다. 실패 경로가 없다',
          source: 'ChecklistDetailPage.tsx#L121',
        },
      ],
      api: [
        {
          operationId: 'OP-ROOM-DELETE',
          summary: '내 방 하나를 삭제한다',
          method: 'DELETE',
          path: '/api/v1/rooms/{id}',
          security: 'JWT — 조회 조건에 userId가 들어가 남의 방은 404다',
          request: 'path: id',
          responses: [
            { code: '200', when: '삭제 성공. ApiResponse<Void>' },
            { code: '404', when: '없는 방 · 남의 방 · 이미 삭제된 방(ROOM_404). 두 번째 삭제는 404가 된다' },
            { code: '401', when: '토큰 없음' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['rooms'],
            rerunSafe: true,
            abortOnFail: 'FULL_ROLLBACK',
          },
        },
        {
          operationId: 'checklistDetail.deleteGuestRoom',
          summary: '비로그인일 때 브라우저에 저장된 방을 지운다',
          method: 'CLIENT',
          path: 'useGuestRoomStore.deleteGuestRoom → localStorage["guest-room-storage"]',
          security: 'PUBLIC — 서버를 부르지 않는다',
          request: 'id',
          responses: [{ code: 'void', when: '항상. 없는 id여도 조용히 지나간다' }],
          safety: {
            sideEffect: 'WRITE',
            writes: ['localStorage:guest-room-storage'],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
      ],
      related: [
        {
          targetId: 'checklist-detail-header',
          label: '헤더 · 삭제 진입',
          relation: 'USES',
          note: '헤더의 삭제 버튼만이 이 모달을 연다.',
        },
        {
          targetId: null,
          label: '방 목록(/rooms)의 삭제',
          relation: 'SHARES_CODE',
          note: '같은 useDeleteRoom 훅을 쓴다. 같은 방을 지우는 입구가 두 곳이다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/ChecklistDetailPage.tsx', symbol: 'handleDelete' },
        { layer: 'FRONT', path: 'src/features/rooms/hooks/use-rooms-query.ts', symbol: 'useDeleteRoom' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/controller/RoomController.java', symbol: 'deleteRoom' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/api/room/service/RoomService.java', symbol: 'deleteRoom' },
      ],
      defects: [],
    },

    {
      id: 'checklist-detail-notfound',
      code: 'D.09',
      title: '찾을 수 없음',
      status: 'LIVE',
      headline: '적재 실패의 종착점. 로그인·비로그인 두 경로가 여기로 모인다',
      overview: {
        what: '요청한 방을 못 찾았을 때 폼 대신 그려지는 안내 화면이다. 제목·설명·"내 방 목록으로" 버튼이 전부다.',
        where: '페이지 전체를 대신한다. 헤더도 탭도 하단 바도 이 상태에서는 렌더되지 않는다.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: '로그인 경로: useRoomDetail이 에러를 내면 notFound를 켠다. 404·401·네트워크 오류가 모두 같은 화면이 된다',
          source: 'ChecklistDetailPage.tsx#L56',
        },
        {
          actor: 'FRONT',
          step: '비로그인 경로: id가 없거나 브라우저 저장소에 raw가 없으면 notFound를 켠다',
          source: 'ChecklistDetailPage.tsx#L70',
        },
        {
          actor: 'USER',
          step: '"내 방 목록으로"를 눌러 /rooms로 나간다. 다시 시도할 방법은 없다',
          source: 'ChecklistDetailPage.tsx#L145',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'checklist-detail-basic',
          label: '기본 정보 · 기존 값 적재',
          relation: 'USES',
          note: '그 적재가 실패한 결과가 이 화면이다. 실패 원인(없음·권한·통신)은 화면에 구분되어 남지 않는다.',
        },
        {
          targetId: null,
          label: '게스트 방의 브라우저 종속성',
          relation: 'SHARES_CODE',
          note: '게스트 방은 localStorage["guest-room-storage"]에만 있다. 다른 브라우저나 시크릿 창에서 같은 링크를 열면 늘 이 화면이 된다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/checklist/ChecklistDetailPage.tsx', symbol: 'notFound' },
        { layer: 'FRONT', path: 'src/store/use-guest-room-store.ts', symbol: 'getGuestRoom' },
      ],
      defects: [],
    },
  ],
};
