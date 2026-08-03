import type { AtlasPageCards } from '@/types/atlas-card';

/**
 * 체크리스트 커스터마이징(/custom)의 카드.
 *
 * 이 페이지의 구조적 특징 하나가 카드 전체를 지배한다 —
 * STEP 1·2·3의 모든 토글은 서버를 부르지 않고 로컬 store에 diff만 쌓는다.
 * 실제 API 5종은 하단 "맞춤 설정 완료" 하나에서 일괄 실행된다.
 * 그래서 API 규칙은 C.04에 몰려 있고 나머지 카드는 비어 있다 — 그게 사실이다.
 *
 * 모든 항목은 2026-08-03 기준 프론트·백엔드 소스를 읽고 적었다.
 */
export const CUSTOM_PAGE_CARDS: AtlasPageCards = {
  pageId: 'custom',
  title: '체크리스트 맞춤 설정',
  route: '/custom',
  previewSrc: '/custom?atlasPreview=1',
  states: [
    {
      id: 'default',
      label: '비로그인',
      note: '배너가 뜨고 STEP 1~3이 흐려진 채 잠긴다(opacity-45 + pointer-events-none + inert). 하단 저장 바는 아예 렌더되지 않는다.',
      caveat: null,
    },
    {
      id: 'member',
      label: '로그인',
      note: '배너가 사라지고 STEP 1~3을 조작할 수 있게 된다. 하단 저장 바가 나타난다 — 평소 이 화면에서만 보이는 요소다.',
      caveat: '미리보기는 isLoggedIn만 덮어쓴다. 토큰이 없으므로 3개 조회 API는 401이 나고, 그때 페이지는 자기 에러 상태를 그린다. 항목 데이터가 채워진 모습은 백엔드가 떠 있어야 볼 수 있다.',
    },
  ],
  cards: [
    {
      id: 'custom-guest-gate',
      code: 'C.00',
      title: '비로그인 게이트 · 데이터 적재',
      status: 'BOUND',
      headline: '로그인해야 열린다. 3개 GET으로 화면을 채운다',
      overview: {
        what: '로그인 상태에서만 조작할 수 있다. 비로그인이면 배너를 띄우고 본문을 흐린 채 잠근다. 로그인 상태면 3개 조회 API로 항목·전체항목·선택유형을 받아 화면을 채운다.',
        where: '페이지 상단. 데스크톱에서는 본문 위 절대배치 오버레이, 모바일에서는 인라인 배너.',
      },
      behaviour: [
        {
          actor: 'FRONT',
          step: 'useAuthStore의 isLoggedIn을 읽는다',
          source: 'SettingsPage.tsx#L16',
        },
        {
          actor: 'FRONT',
          step: '비로그인이면 본문에 opacity-45 + pointer-events-none + inert를 걸어 조작을 막는다. 보이지만 만질 수 없다',
          source: 'SettingsPage.tsx#L198',
        },
        {
          actor: 'FRONT',
          step: '3개 useQuery가 enabled: isLoggedIn이라 비로그인이면 아예 호출되지 않는다',
          source: 'hooks/use-customization.ts#L28',
        },
        {
          actor: 'BACK',
          step: 'SecurityConfig에 /api/checklist/** permitAll이 없어 anyRequest().authenticated()에 걸린다. 미인증이면 필터가 401로 끊는다',
          source: 'global/config/SecurityConfig.java#L68',
        },
        {
          actor: 'USER',
          step: '배너에서 비로그인 진행(/checklist/new) 또는 로그인(/login?redirect=/custom)을 고른다',
          source: 'SettingsPage.tsx#L179',
        },
      ],
      api: [
        {
          operationId: 'checklist.getCustomizedItems',
          summary: '선택한 유형 기준으로 추천 항목을 받는다',
          method: 'GET',
          path: '/api/checklist/items',
          security: 'JWT — SecurityUtil.getCurrentUserId()로 본인 것만. 경로에 userId를 받지 않아 타인 접근 경로가 구조적으로 없다',
          request: '없음. userId는 JWT principal에서 꺼낸다',
          responses: [
            { code: '200', when: 'ChecklistItemResponse[] — 항목 + 옵션' },
            { code: '401', when: '토큰 없음 · Security 필터가 차단' },
          ],
          safety: {
            sideEffect: 'READ',
            writes: [],
            rerunSafe: true,
            abortOnFail: 'NONE',
          },
        },
        {
          operationId: 'checklist.getAllItemsForSettings',
          summary: '설정 화면용 전체 항목을 받는다',
          method: 'GET',
          path: '/api/checklist/items/all',
          security: 'JWT',
          request: '없음',
          responses: [{ code: '200', when: 'ChecklistItemResponse[] — DEFAULT·USER_TYPE·본인 CUSTOM' }],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
        {
          operationId: 'checklist.getSelectedUserTypes',
          summary: '내가 고른 유형 목록을 받는다',
          method: 'GET',
          path: '/api/checklist/types',
          security: 'JWT',
          request: '없음',
          responses: [{ code: '200', when: 'UserType[]' }],
          safety: { sideEffect: 'READ', writes: [], rerunSafe: true, abortOnFail: 'NONE' },
        },
      ],
      related: [
        {
          targetId: 'custom-save',
          label: '저장 · 일괄 반영',
          relation: 'USED_BY',
          note: '저장 성공 후 이 3개 쿼리를 invalidate해서 다시 받는다(use-customization.ts#L240).',
        },
        {
          targetId: null,
          label: '랜딩 · 기능 소개의 게스트 분기',
          relation: 'SHARES_CODE',
          note: '두 곳 모두 useAuthStore의 isLoggedIn만으로 갈린다. 서버 검증이 아니라 클라이언트 상태다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/customization/SettingsPage.tsx', symbol: 'SettingsPage' },
        { layer: 'FRONT', path: 'src/features/customization/components/BannerLoggedOut.tsx', symbol: 'BannerLoggedOut' },
        { layer: 'FRONT', path: 'src/services/custom-checklist-service.ts', symbol: 'getCustomizedItems' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/domain/checklist/controller/ChecklistController.java', symbol: 'getCustomizedItems' },
      ],
      defects: ['BC-CHK-03'],
    },

    {
      id: 'custom-step1',
      code: 'C.01',
      title: 'STEP 1 · 사용자 유형',
      status: 'LIVE',
      headline: '유형을 고른다. 서버는 부르지 않는다',
      overview: {
        what: '6개 유형 카드에서 나에게 맞는 것을 고른다. 고르면 STEP 2의 추천 항목이 자동으로 켜진다.',
        where: '본문 첫 번째 STEP 블록.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '유형 카드를 누른다 (저장 진행 중이면 무시된다)',
          source: 'SettingsPage.tsx#L226',
        },
        {
          actor: 'FRONT',
          step: 'toggleUserType이 zustand store의 selectedTypeIds를 바꾸고 추천 라벨을 activeItemNames에 병합한다. 여기서 API 호출은 없다',
          source: 'hooks/use-customization.ts#L135',
        },
        {
          actor: 'FRONT',
          step: '변경분은 저장 버튼을 누를 때까지 로컬에만 쌓인다. isDirty가 켜지고 상단에 미저장 경고가 뜬다',
          source: 'SettingsPage.tsx#L157',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'custom-step2',
          label: 'STEP 2 맞춤 체크리스트',
          relation: 'USED_BY',
          note: '여기서 고른 유형이 STEP 2의 추천 항목 집합을 결정한다.',
        },
        {
          targetId: 'custom-save',
          label: '저장 · 일괄 반영',
          relation: 'USED_BY',
          note: '유형 변경은 저장 시 diff로 계산되어 select/deselect API로 나간다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/customization/components/UserTypeCard.tsx', symbol: 'UserTypeCard' },
        { layer: 'FRONT', path: 'src/store/use-customization-store.ts', symbol: 'useCustomizationStore' },
      ],
      defects: [],
    },

    {
      id: 'custom-step2',
      code: 'C.02',
      title: 'STEP 2 · 맞춤 체크리스트',
      status: 'LIVE',
      headline: '추천 항목을 켜고 끈다. 역시 로컬만',
      overview: {
        what: 'STEP 1에서 고른 유형의 추천 항목을 토글 카드로 보여주고 켜고 끌 수 있다.',
        where: '본문 두 번째 STEP 블록.',
      },
      behaviour: [
        { actor: 'USER', step: '항목 토글을 누른다', source: 'SettingsPage.tsx#L275' },
        {
          actor: 'FRONT',
          step: '서버 id가 있으면 toggleItem, 없으면 toggleItemLocally. 둘 다 결국 store의 toggleItemName만 부른다',
          source: 'hooks/use-customization.ts#L158',
        },
        {
          actor: 'FRONT',
          step: '선택 상태는 localStorage 키 customization-storage에 persist된다',
          source: 'src/store/use-customization-store.ts#L34',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'custom-step1',
          label: 'STEP 1 사용자 유형',
          relation: 'USES',
          note: '추천 항목 집합이 STEP 1의 선택에서 나온다.',
        },
        {
          targetId: 'custom-save',
          label: '저장 · 일괄 반영',
          relation: 'USED_BY',
          note: '꺼둔 항목이 disabledItemIds로 모여 saveSettings 한 번에 나간다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/customization/components/ChecklistItemToggle.tsx', symbol: 'ChecklistItemToggle' },
      ],
      defects: [],
    },

    {
      id: 'custom-step3',
      code: 'C.03',
      title: 'STEP 3 · 추가 항목 · 나만의 항목',
      status: 'LIVE',
      headline: '전체에서 더 고르고, 내 항목을 만든다 (최대 3개)',
      overview: {
        what: '전체 체크리스트를 펼쳐 카테고리별로 더 고르고, 직접 만든 항목을 추가·삭제할 수 있다.',
        where: '본문 세 번째 STEP 블록. 가장 길다.',
      },
      behaviour: [
        {
          actor: 'USER',
          step: '나만의 항목 이름을 입력하고 추가한다',
          source: 'SettingsPage.tsx#L83',
        },
        {
          actor: 'FRONT',
          step: '임시 음수 id를 붙여 pendingCustomAdds에 쌓는다. 이 시점에 서버 호출은 없다',
          source: 'hooks/use-customization.ts#L181',
        },
        {
          actor: 'USER',
          step: '항목의 ✕를 눌러 삭제한다',
          source: 'SettingsPage.tsx#L494',
        },
        {
          actor: 'FRONT',
          step: '아직 저장 전(id<0)이면 대기 목록에서 빼고, 이미 저장된 것이면 pendingCustomDeleteIds에 넣는다',
          source: 'hooks/use-customization.ts#L191',
        },
      ],
      api: [],
      related: [
        {
          targetId: 'custom-save',
          label: '저장 · 일괄 반영',
          relation: 'USED_BY',
          note: '추가·삭제 대기 목록이 저장 시 순차로 API 호출된다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/customization/SettingsPage.tsx', symbol: 'handleAddCustomItem' },
      ],
      defects: ['BC-CHK-04', 'BC-CHK-05'],
    },

    {
      id: 'custom-save',
      code: 'C.04',
      title: '저장 · 일괄 반영',
      status: 'BOUND',
      headline: '이 페이지에서 서버를 부르는 유일한 곳. 5개 API가 순차로 나간다',
      overview: {
        what: 'STEP 1~3에서 쌓인 로컬 변경분을 계산해 서버에 반영한다. 유형 해제 → 유형 선택 → 커스텀 삭제 → 커스텀 추가 → 설정 저장 순으로 각각 별개 요청이 나간다.',
        where: '화면 하단 고정 바. 로그인 상태에서만 나타난다.',
      },
      behaviour: [
        { actor: 'USER', step: '"맞춤 설정 완료"를 누른다', source: 'SettingsPage.tsx#L523' },
        {
          actor: 'FRONT',
          step: 'saveCurrentSettings가 diff를 계산해 5종 API를 for-await로 순차 호출한다',
          source: 'hooks/use-customization.ts#L203',
        },
        {
          actor: 'BACK',
          step: '각 요청은 서로 다른 트랜잭션이다. 중간에 하나가 실패하면 앞의 것은 이미 반영된 채로 남는다',
          source: 'domain/checklist/service/ChecklistService.java#L27',
        },
        {
          actor: 'FRONT',
          step: '전부 성공하면 4개 쿼리를 invalidate하고 /rooms로 이동한다',
          source: 'hooks/use-customization.ts#L240',
        },
        {
          actor: 'FRONT',
          step: '실패하면 고정 문구만 띄우고 이동을 막는다. 어느 단계에서 실패했는지는 화면에 나오지 않는다',
          source: 'SettingsPage.tsx#L530',
        },
      ],
      api: [
        {
          operationId: 'checklist.selectUserType',
          summary: '유형을 선택 목록에 넣는다',
          method: 'POST',
          path: '/api/checklist/types/{userType}',
          security: 'JWT',
          request: 'path: userType (BUG_AVOIDER · NOISE_SENSITIVE · CLEAN_FREAK · PERFORMANCE_TYPE · FIRST_TIMER · ESSENTIALS_ONLY)',
          responses: [
            { code: '200', when: '반영 후 갱신된 항목 목록' },
            { code: '400', when: '알 수 없는 userType 문자열' },
            { code: '409', when: '동시 요청 경합 — uk_user_type 유니크 위반' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['user_type_selections'],
            rerunSafe: true,
            abortOnFail: 'FULL_ROLLBACK',
          },
        },
        {
          operationId: 'checklist.deselectUserType',
          summary: '유형을 선택 목록에서 뺀다',
          method: 'DELETE',
          path: '/api/checklist/types/{userType}',
          security: 'JWT',
          request: 'path: userType',
          responses: [
            { code: '200', when: '삭제 대상이 없어도 성공한다' },
            { code: '400', when: '알 수 없는 userType 문자열' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['user_type_selections'],
            rerunSafe: true,
            abortOnFail: 'FULL_ROLLBACK',
          },
        },
        {
          operationId: 'checklist.deleteCustomItem',
          summary: '내가 만든 항목을 지운다 (soft delete)',
          method: 'DELETE',
          path: '/api/checklist/items/custom/{customItemId}',
          security: 'JWT — ownerUserId와 대조하는 소유권 검증이 있다. 이 페이지에서 유일하게 명시적 소유권 확인을 하는 곳',
          request: 'path: customItemId',
          responses: [
            { code: '200', when: '삭제 성공' },
            { code: '400', when: '남의 항목 — 의미상 403이 맞지만 400으로 매핑돼 있다' },
            { code: '500', when: '없는 id — 404여야 하는데 500으로 샌다' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['checklist_items'],
            rerunSafe: true,
            abortOnFail: 'FULL_ROLLBACK',
          },
        },
        {
          operationId: 'checklist.addCustomItem',
          summary: '나만의 항목을 만든다',
          method: 'POST',
          path: '/api/checklist/items/custom',
          security: 'JWT',
          request: 'body: { itemName: string } — 검증 애노테이션 없음',
          responses: [
            { code: '201', when: '생성 성공 (본문·Location 없음)' },
            { code: '400', when: '사용자당 3개 초과' },
            { code: '409', when: 'itemName이 null·공백·100자 초과 — DB 제약까지 흘러간 결과' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['checklist_items'],
            rerunSafe: false,
            abortOnFail: 'FULL_ROLLBACK',
          },
        },
        {
          operationId: 'checklist.saveSettings',
          summary: '꺼둔 항목 목록을 통째로 덮어쓴다',
          method: 'POST',
          path: '/api/checklist/items/settings',
          security: 'JWT',
          request: 'body: { disabledItemIds: number[] } — @Valid 없음, null 허용',
          responses: [
            { code: '200', when: '저장 성공' },
            { code: '500', when: 'disabledItemIds가 null — NPE가 그대로 샌다' },
          ],
          safety: {
            sideEffect: 'WRITE',
            writes: ['user_checklist_settings'],
            rerunSafe: true,
            abortOnFail: 'FULL_ROLLBACK',
          },
        },
      ],
      related: [
        {
          targetId: 'custom-guest-gate',
          label: '진입 · 데이터 적재',
          relation: 'USES',
          note: '저장 후 그 3개 조회 쿼리를 invalidate해 다시 받는다.',
        },
        {
          targetId: 'custom-step3',
          label: 'STEP 3 나만의 항목',
          relation: 'USES',
          note: '추가·삭제 대기 목록을 여기서 소비한다.',
        },
        {
          targetId: null,
          label: '방 등록 · 체크리스트 답변',
          relation: 'USES',
          note: '여기서 정한 항목 집합이 /checklist/new의 입력 폼과 방 등록 시 저장되는 답변 범위를 결정한다.',
        },
      ],
      sources: [
        { layer: 'FRONT', path: 'src/features/customization/hooks/use-customization.ts', symbol: 'saveCurrentSettings' },
        { layer: 'FRONT', path: 'src/services/custom-checklist-service.ts', symbol: 'saveSettings' },
        { layer: 'BACK', path: 'backend/src/main/java/com/room/backend/domain/checklist/service/ChecklistService.java', symbol: 'saveSettings' },
      ],
      defects: ['BC-CHK-01', 'BC-CHK-02', 'BC-CHK-06'],
    },
  ],
};
