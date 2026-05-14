/**
 * SCR-CUSTOM Item Matrix — SSoT
 *
 * 본 모듈은 `매물 체크리스트 서비스_기능명세서_v2.1.2(배포용).xlsx`
 * 시트 `사용자 유형 및 체크리스트 항목`을 미러링한다.
 *
 * 문서 SSoT: `_woo/projects/08_SWYP/04_docs/pages/custom/item-matrix.md` v0.5
 * BE 정합: `GET /api/checklist/items/all` 응답 44개와 1:1 매핑
 *          (2026-05-12 dump 검증)
 *
 * BE 코드/스키마/시드 무수정. FE matrix가 항목 분류·유형 매핑의 SSoT.
 */

// ============================================================================
// 1. Enums & Types
// ============================================================================

/** 항목 상태 4단계 (v2.1.2 R3) */
export type ItemStatus =
  | 'FIXED'      // 고정 — 모든 사용자 공통, 해제 불가 (A-, B-, M- prefix)
  | 'DEFAULT'    // 기본 — 초기 선택, 해제 가능
  | 'USER_TYPE'  // 사용자 유형 — 유형 선택 시 추가 enabled
  | 'CUSTOM';    // 커스텀 — 시스템 정의지만 사용자가 자유 토글

/** 백엔드 userType enum (BE checklist_items.user_type) */
export type BackendUserType =
  | 'BUG_AVOIDER'
  | 'NOISE_SENSITIVE'
  | 'CLEAN_FREAK'
  | 'PERFORMANCE_TYPE'
  | 'FIRST_TIMER';

/**
 * 프론트엔드 카드 ID (6종).
 * `ESSENTIALS_ONLY`는 BE enum에 없음 — FE-only 처리(§11.B).
 */
export type FrontendTypeId = BackendUserType | 'ESSENTIALS_ONLY';

/** 백엔드 category enum (BE checklist_items.category) */
export type BackendCategory =
  | 'OPTION'
  | 'INTERNAL_STATE'
  | 'PROBLEM'
  | 'SAFETY'
  | 'CONVENIENCE'
  | 'ENVIRONMENT';

/** 사용자 유형 정의 (6종 카드) */
export interface UserTypeDef {
  /** 카드 ID — FE primary key */
  id: FrontendTypeId;
  /** 카드 번호 (1~6) */
  cardNumber: 1 | 2 | 3 | 4 | 5 | 6;
  /** 운영 라벨 (PM 정의 SSoT) */
  label: string;
  /** 카드 부제 */
  description: string;
  /** 아이콘 이름 (Icons.tsx의 ItemIcons 키 또는 iconify name) */
  icon: string;
  /** BE enum 지원 여부 (false면 C-2/C-3 호출 안 함) */
  backendSupported: boolean;
}

/** 체크리스트 항목 정의 */
export interface ItemDef {
  /** v2.1.2 기능명세서 ID (e.g. "O-1", "I-01") — primary key */
  specId: string;
  /** 백엔드 checklist_items.id (BE seed 1~44) */
  backendId: number;
  /** UI 표시 이름 (v2.1.2 항목명, 일부 BE 오타 정정) */
  itemName: string;
  /** BE category */
  category: BackendCategory;
  /** v2.1.2 상태 */
  status: ItemStatus;
  /**
   * 매핑된 사용자 유형 (다중 가능 — v2.1.2 R4 공유 매핑).
   * BE는 단일 userType 외래키만 저장하므로, 본 필드가 공유 매핑의 FE SSoT.
   */
  userTypes: BackendUserType[];
  /** 척도 옵션 (UI 표시 순서, BE displayOrder 정합) */
  options: readonly string[];
  /** 척도 타입 — 점수 산식 용 */
  scaleType: ScaleType;
}

/** 척도 타입 (점수 산식 — v0.5 §6) */
export type ScaleType =
  | 'BOOL'           // 있음/없음
  | 'TRI_QUALITY'    // 나쁨/보통/좋음
  | 'TRI_SEVERITY'   // 없음/약간/심함 (역방향 점수)
  | 'TRI_DISTANCE'   // 멀다/보통/가깝다
  | 'TRI_DENSITY'    // 없음/보통/많음
  | 'TRI_BRIGHTNESS' // 어두움/보통/밝음
  | 'TRI_SAFETY'     // 불안/보통/안전
  | 'TRI_ACCESS'     // 큰길 근처/보통/깊은 골목 (역방향)
  | 'TRI_SLOPE'      // 완만/보통/가파름 (역방향)
  | 'TRI_QUANTITY'   // 부족/보통/충분
  | 'TRI_MAYBE'      // 없음/모름/있음 (모름=null)
  | 'BIN_LANDLORD'   // 상주/비상주 (L-06 특수)
  | 'BIN_DELIVERY';  // 없음/공용 보관 (L-07 특수)

// ============================================================================
// 2. User Type Definitions (PM 정의 2026-05-12 + components.md §10 v0.7)
// ============================================================================

export const USER_TYPE_DEFS: readonly UserTypeDef[] = [
  {
    id: 'BUG_AVOIDER',
    cardNumber: 1,
    label: '벌레회피형',
    description: '위생·벌레 유입 점검',
    icon: 'solar:bug-bold',
    backendSupported: true,
  },
  {
    id: 'NOISE_SENSITIVE',
    cardNumber: 2,
    label: '소음민감형',
    description: '주거 환경 소음 점검',
    icon: 'mdi:mute',
    backendSupported: true,
  },
  {
    id: 'CLEAN_FREAK',
    cardNumber: 3,
    label: '쾌적환경형',
    description: '공기·환기·냄새 점검',
    icon: 'stash:sun-solid',
    backendSupported: true,
  },
  {
    id: 'PERFORMANCE_TYPE',
    cardNumber: 4,
    label: '생활성능형',
    description: '사용 편의·기능 점검',
    icon: 'mage:electricity-fill',
    backendSupported: true,
  },
  {
    id: 'FIRST_TIMER',
    cardNumber: 5,
    label: '첫 자취형',
    description: '처음이라 다 확인!',
    icon: 'gravity-ui:house-fill',
    backendSupported: true,
  },
  {
    id: 'ESSENTIALS_ONLY',
    cardNumber: 6,
    label: '핵심만 빠르게',
    description: '핵심 필수만 빠르게',
    // TODO(Q11): 디자이너 컨펌 대기 — 후보: solar:bolt-bold / mdi:speedometer / material-symbols:rocket-launch / mdi:check-bold
    icon: 'solar:bolt-bold',
    backendSupported: false, // BE enum 부재 — C-2/C-3 호출 안 함, §11.B 우회
  },
] as const;

// ============================================================================
// 3. Item Definitions (44개 — v2.1.2 SSoT + BE seed 정합)
// ============================================================================

export const ITEM_DEFS: readonly ItemDef[] = [
  // ---- 옵션 (8) ----
  { specId: 'O-1', backendId: 1, itemName: '에어컨', category: 'OPTION', status: 'DEFAULT', userTypes: [], options: ['있음', '없음'], scaleType: 'BOOL' },
  { specId: 'O-2', backendId: 2, itemName: '세탁기', category: 'OPTION', status: 'DEFAULT', userTypes: [], options: ['있음', '없음'], scaleType: 'BOOL' },
  { specId: 'O-3', backendId: 3, itemName: '냉장고', category: 'OPTION', status: 'DEFAULT', userTypes: [], options: ['있음', '없음'], scaleType: 'BOOL' },
  { specId: 'O-4', backendId: 4, itemName: '인터넷/와이파이', category: 'OPTION', status: 'DEFAULT', userTypes: [], options: ['있음', '없음'], scaleType: 'BOOL' },
  { specId: 'O-5', backendId: 5, itemName: '가스레인지/인덕션', category: 'OPTION', status: 'CUSTOM', userTypes: [], options: ['있음', '없음'], scaleType: 'BOOL' },
  { specId: 'O-6', backendId: 6, itemName: '책상/의자', category: 'OPTION', status: 'CUSTOM', userTypes: [], options: ['있음', '없음'], scaleType: 'BOOL' },
  { specId: 'O-7', backendId: 7, itemName: '옷장/수납', category: 'OPTION', status: 'CUSTOM', userTypes: [], options: ['있음', '없음'], scaleType: 'BOOL' },
  { specId: 'O-8', backendId: 8, itemName: '난방', category: 'OPTION', status: 'CUSTOM', userTypes: [], options: ['있음', '없음'], scaleType: 'BOOL' },

  // ---- 내부 상태 (6) ----
  { specId: 'I-01', backendId: 9, itemName: '채광', category: 'INTERNAL_STATE', status: 'DEFAULT', userTypes: ['CLEAN_FREAK'], options: ['나쁨', '보통', '좋음'], scaleType: 'TRI_QUALITY' },
  { specId: 'I-02', backendId: 10, itemName: '환기', category: 'INTERNAL_STATE', status: 'DEFAULT', userTypes: ['CLEAN_FREAK'], options: ['나쁨', '보통', '좋음'], scaleType: 'TRI_QUALITY' },
  { specId: 'I-03', backendId: 11, itemName: '수압 및 배수', category: 'INTERNAL_STATE', status: 'DEFAULT', userTypes: ['PERFORMANCE_TYPE'], options: ['나쁨', '보통', '좋음'], scaleType: 'TRI_QUALITY' },
  { specId: 'I-04', backendId: 12, itemName: '방음', category: 'INTERNAL_STATE', status: 'USER_TYPE', userTypes: ['NOISE_SENSITIVE'], options: ['나쁨', '보통', '좋음'], scaleType: 'TRI_QUALITY' },
  // BE 응답엔 "창문 / 망충망" 오타 존재 — UI 표시는 "창문/방충망" (v2.1.2 정정)
  { specId: 'I-05', backendId: 13, itemName: '창문/방충망', category: 'INTERNAL_STATE', status: 'USER_TYPE', userTypes: ['BUG_AVOIDER'], options: ['나쁨', '보통', '좋음'], scaleType: 'TRI_QUALITY' },
  { specId: 'I-06', backendId: 14, itemName: '현관/문틈', category: 'INTERNAL_STATE', status: 'USER_TYPE', userTypes: ['BUG_AVOIDER'], options: ['나쁨', '보통', '좋음'], scaleType: 'TRI_QUALITY' },

  // ---- 문제 요소 (6) ----
  { specId: 'P-01', backendId: 15, itemName: '곰팡이', category: 'PROBLEM', status: 'DEFAULT', userTypes: ['CLEAN_FREAK'], options: ['없음', '약간', '심함'], scaleType: 'TRI_SEVERITY' },
  { specId: 'P-02', backendId: 16, itemName: '누수 흔적', category: 'PROBLEM', status: 'CUSTOM', userTypes: [], options: ['없음', '약간', '심함'], scaleType: 'TRI_SEVERITY' },
  { specId: 'P-03', backendId: 17, itemName: '벌레 흔적', category: 'PROBLEM', status: 'DEFAULT', userTypes: ['BUG_AVOIDER'], options: ['없음', '약간', '심함'], scaleType: 'TRI_SEVERITY' },
  // P-04 공유 매핑: BE userType=NOISE_SENSITIVE 단일, FE OR 보정으로 PERFORMANCE_TYPE 추가
  { specId: 'P-04', backendId: 18, itemName: '내/외부 소음', category: 'PROBLEM', status: 'USER_TYPE', userTypes: ['NOISE_SENSITIVE', 'PERFORMANCE_TYPE'], options: ['없음', '약간', '심함'], scaleType: 'TRI_SEVERITY' },
  { specId: 'P-05', backendId: 19, itemName: '하수구/곰팡이 냄새', category: 'PROBLEM', status: 'USER_TYPE', userTypes: ['BUG_AVOIDER'], options: ['없음', '약간', '심함'], scaleType: 'TRI_SEVERITY' },
  { specId: 'P-06', backendId: 20, itemName: '습기/결로', category: 'PROBLEM', status: 'USER_TYPE', userTypes: ['CLEAN_FREAK'], options: ['없음', '약간', '심함'], scaleType: 'TRI_SEVERITY' },

  // ---- 안전/보안 (8) — 유형 매핑 없음 (v2.1.2 R41 비고) ----
  { specId: 'S-01', backendId: 21, itemName: '공동 현관', category: 'SAFETY', status: 'DEFAULT', userTypes: [], options: ['없음', '있음'], scaleType: 'BOOL' },
  { specId: 'S-02', backendId: 22, itemName: '창문 잠금장치', category: 'SAFETY', status: 'DEFAULT', userTypes: [], options: ['없음', '있음'], scaleType: 'BOOL' },
  { specId: 'S-03', backendId: 23, itemName: 'CCTV 설치 여부', category: 'SAFETY', status: 'CUSTOM', userTypes: [], options: ['없음', '있음'], scaleType: 'BOOL' },
  { specId: 'S-04', backendId: 24, itemName: '야간 조명', category: 'SAFETY', status: 'CUSTOM', userTypes: [], options: ['어두움', '보통', '밝음'], scaleType: 'TRI_BRIGHTNESS' },
  { specId: 'S-05', backendId: 25, itemName: '경찰서 근처', category: 'SAFETY', status: 'CUSTOM', userTypes: [], options: ['멀다', '보통', '가깝다'], scaleType: 'TRI_DISTANCE' },
  { specId: 'S-06', backendId: 26, itemName: '밤길 안전도', category: 'SAFETY', status: 'CUSTOM', userTypes: [], options: ['불안', '보통', '안전'], scaleType: 'TRI_SAFETY' },
  { specId: 'S-07', backendId: 27, itemName: '접근성', category: 'SAFETY', status: 'CUSTOM', userTypes: [], options: ['큰길 근처', '보통', '깊은 골목'], scaleType: 'TRI_ACCESS' },
  { specId: 'S-08', backendId: 28, itemName: '소화기/화재 경보', category: 'SAFETY', status: 'CUSTOM', userTypes: [], options: ['없음', '있음'], scaleType: 'BOOL' },

  // ---- 생활 편의 (8) ----
  { specId: 'L-01', backendId: 29, itemName: '카페/공부 공간', category: 'CONVENIENCE', status: 'DEFAULT', userTypes: [], options: ['없음', '있음'], scaleType: 'BOOL' },
  { specId: 'L-02', backendId: 30, itemName: '코인세탁소', category: 'CONVENIENCE', status: 'DEFAULT', userTypes: ['PERFORMANCE_TYPE'], options: ['없음', '있음'], scaleType: 'BOOL' },
  { specId: 'L-03', backendId: 31, itemName: '자전거/차량 주차', category: 'CONVENIENCE', status: 'CUSTOM', userTypes: [], options: ['없음', '있음'], scaleType: 'BOOL' },
  { specId: 'L-04', backendId: 32, itemName: '병원/약국', category: 'CONVENIENCE', status: 'CUSTOM', userTypes: [], options: ['없음', '있음'], scaleType: 'BOOL' },
  { specId: 'L-05', backendId: 33, itemName: '콘센트 수', category: 'CONVENIENCE', status: 'USER_TYPE', userTypes: ['PERFORMANCE_TYPE'], options: ['부족', '보통', '충분'], scaleType: 'TRI_QUANTITY' },
  { specId: 'L-06', backendId: 34, itemName: '집주인 거주 여부', category: 'CONVENIENCE', status: 'CUSTOM', userTypes: [], options: ['상주', '비상주'], scaleType: 'BIN_LANDLORD' },
  { specId: 'L-07', backendId: 35, itemName: '택배 보관 환경', category: 'CONVENIENCE', status: 'CUSTOM', userTypes: [], options: ['없음', '공용 보관'], scaleType: 'BIN_DELIVERY' },
  { specId: 'L-08', backendId: 36, itemName: '세탁 건조 공간', category: 'CONVENIENCE', status: 'USER_TYPE', userTypes: ['PERFORMANCE_TYPE'], options: ['없음', '있음'], scaleType: 'BOOL' },

  // ---- 주변환경 (8) ----
  { specId: 'E-01', backendId: 37, itemName: '편의점/마트', category: 'ENVIRONMENT', status: 'DEFAULT', userTypes: [], options: ['멀다', '보통', '가깝다'], scaleType: 'TRI_DISTANCE' },
  { specId: 'E-02', backendId: 38, itemName: '대중교통 접근성', category: 'ENVIRONMENT', status: 'DEFAULT', userTypes: ['NOISE_SENSITIVE'], options: ['멀다', '보통', '가깝다'], scaleType: 'TRI_DISTANCE' },
  { specId: 'E-03', backendId: 39, itemName: '야간 상권 인접도', category: 'ENVIRONMENT', status: 'USER_TYPE', userTypes: ['NOISE_SENSITIVE'], options: ['멀다', '보통', '가깝다'], scaleType: 'TRI_DISTANCE' },
  // E-04·E-05 공유 매핑: BE userType=BUG_AVOIDER 단일, FE OR 보정으로 CLEAN_FREAK 추가
  { specId: 'E-04', backendId: 40, itemName: '녹지/산 인접도', category: 'ENVIRONMENT', status: 'USER_TYPE', userTypes: ['BUG_AVOIDER', 'CLEAN_FREAK'], options: ['멀다', '보통', '가깝다'], scaleType: 'TRI_DISTANCE' },
  { specId: 'E-05', backendId: 41, itemName: '음식점 밀집도', category: 'ENVIRONMENT', status: 'USER_TYPE', userTypes: ['BUG_AVOIDER', 'CLEAN_FREAK'], options: ['없음', '보통', '많음'], scaleType: 'TRI_DENSITY' },
  { specId: 'E-06', backendId: 42, itemName: '유동인구', category: 'ENVIRONMENT', status: 'USER_TYPE', userTypes: ['NOISE_SENSITIVE'], options: ['없음', '보통', '많음'], scaleType: 'TRI_DENSITY' },
  { specId: 'E-07', backendId: 43, itemName: '공사장 여부', category: 'ENVIRONMENT', status: 'USER_TYPE', userTypes: ['NOISE_SENSITIVE'], options: ['없음', '모름', '있음'], scaleType: 'TRI_MAYBE' },
  { specId: 'E-08', backendId: 44, itemName: '언덕 경사', category: 'ENVIRONMENT', status: 'CUSTOM', userTypes: [], options: ['완만', '보통', '가파름'], scaleType: 'TRI_SLOPE' },
] as const;

// ============================================================================
// 4. Lookups (성능 위해 한 번만 빌드)
// ============================================================================

const ITEMS_BY_BACKEND_ID = new Map<number, ItemDef>(
  ITEM_DEFS.map((item) => [item.backendId, item]),
);
const ITEMS_BY_SPEC_ID = new Map<string, ItemDef>(
  ITEM_DEFS.map((item) => [item.specId, item]),
);
const ITEMS_BY_NAME = new Map<string, ItemDef>(
  ITEM_DEFS.map((item) => [item.itemName, item]),
);
const USER_TYPE_BY_ID = new Map<FrontendTypeId, UserTypeDef>(
  USER_TYPE_DEFS.map((t) => [t.id, t]),
);

// ============================================================================
// 5. Helpers
// ============================================================================

export function getItemByBackendId(id: number): ItemDef | undefined {
  return ITEMS_BY_BACKEND_ID.get(id);
}

export function getItemBySpecId(specId: string): ItemDef | undefined {
  return ITEMS_BY_SPEC_ID.get(specId);
}

export function getItemByName(itemName: string): ItemDef | undefined {
  return ITEMS_BY_NAME.get(itemName);
}

export function getUserType(id: FrontendTypeId): UserTypeDef | undefined {
  return USER_TYPE_BY_ID.get(id);
}

/** v2.1.2 "기본" 상태 항목 (15개) */
export function getDefaultItems(): ItemDef[] {
  return ITEM_DEFS.filter((i) => i.status === 'DEFAULT');
}

/** 특정 카드 선택 시 enabled되는 항목 (기본 + 해당 유형 매핑 항목) */
export function getItemsForType(typeId: FrontendTypeId): ItemDef[] {
  if (typeId === 'FIRST_TIMER') {
    // 전체 44 enabled
    return [...ITEM_DEFS];
  }
  if (typeId === 'ESSENTIALS_ONLY') {
    // 기본만
    return getDefaultItems();
  }
  // 일반 카드 1~4: 기본 + 매핑된 사용자 유형 항목 (중복 통합 — Set으로 처리)
  const result = new Set<ItemDef>(getDefaultItems());
  ITEM_DEFS.forEach((item) => {
    if (item.userTypes.includes(typeId as BackendUserType)) result.add(item);
  });
  return Array.from(result);
}

/**
 * 다중 유형 선택 시 enabled 항목 = 기본 ∪ ⋃ Type[i].specific
 * 카드 5·6은 다른 카드와 상호 배타 (호출부에서 강제) — 본 함수는 단순 union.
 */
export function getEnabledItems(
  selectedTypes: Iterable<FrontendTypeId>,
): ItemDef[] {
  const typeSet = new Set(selectedTypes);
  if (typeSet.has('FIRST_TIMER')) return [...ITEM_DEFS];
  if (typeSet.has('ESSENTIALS_ONLY') && typeSet.size === 1) {
    return getDefaultItems();
  }

  const result = new Set<ItemDef>(getDefaultItems());
  ITEM_DEFS.forEach((item) => {
    if (item.userTypes.some((t) => typeSet.has(t))) result.add(item);
  });
  return Array.from(result);
}

/** v2.1.2 카테고리 → UI 표시 이름 (한국어) */
export const CATEGORY_LABELS: Record<BackendCategory, string> = {
  OPTION: '옵션',
  INTERNAL_STATE: '내부 상태',
  PROBLEM: '문제 요소',
  SAFETY: '안전/보안',
  CONVENIENCE: '생활 편의',
  ENVIRONMENT: '주변 환경',
};

/** UI 표시 순서 (v2.1.2 시트 행 순서) */
export const CATEGORY_ORDER: readonly BackendCategory[] = [
  'OPTION',
  'INTERNAL_STATE',
  'PROBLEM',
  'SAFETY',
  'CONVENIENCE',
  'ENVIRONMENT',
] as const;

/** 카테고리별 항목 그룹화 */
export function groupByCategory(items: ItemDef[]): Map<BackendCategory, ItemDef[]> {
  const map = new Map<BackendCategory, ItemDef[]>();
  CATEGORY_ORDER.forEach((cat) => map.set(cat, []));
  items.forEach((item) => map.get(item.category)?.push(item));
  return map;
}

/**
 * 카드 5·6 상호 배타 적용 — 선택 set 정리.
 * 5 또는 6이 추가되면 다른 카드는 자동 해제.
 * 다른 카드가 이미 있는 상태에서 5/6 추가도 동일하게 5/6만 유지.
 */
export function applyExclusivity(
  current: Set<FrontendTypeId>,
  toggleId: FrontendTypeId,
): Set<FrontendTypeId> {
  const next = new Set(current);
  const isExclusive = toggleId === 'FIRST_TIMER' || toggleId === 'ESSENTIALS_ONLY';

  if (next.has(toggleId)) {
    next.delete(toggleId);
    return next;
  }

  if (isExclusive) {
    return new Set<FrontendTypeId>([toggleId]);
  }

  // 일반 카드 선택 시 5/6 모두 해제
  next.delete('FIRST_TIMER');
  next.delete('ESSENTIALS_ONLY');
  next.add(toggleId);
  return next;
}

/** ESSENTIALS_ONLY 우회 — 비활성화할 항목 ID 리스트 (§11.B) */
export function getDisabledIdsForEssentialsOnly(): number[] {
  return ITEM_DEFS.filter((i) => i.status !== 'DEFAULT').map((i) => i.backendId);
}

/** 데이터 정합 자체 검증 (개발 시 console에서 호출) */
export function validateMatrix(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const expectedCount = 44;
  if (ITEM_DEFS.length !== expectedCount) {
    errors.push(`ITEM_DEFS.length=${ITEM_DEFS.length}, expected ${expectedCount}`);
  }
  const seen = new Set<number>();
  ITEM_DEFS.forEach((i) => {
    if (seen.has(i.backendId)) errors.push(`duplicate backendId=${i.backendId}`);
    seen.add(i.backendId);
  });
  const expectedDefaults = 15;
  const defaultCount = getDefaultItems().length;
  if (defaultCount !== expectedDefaults) {
    errors.push(`default count=${defaultCount}, expected ${expectedDefaults}`);
  }
  return { ok: errors.length === 0, errors };
}
