import type { ChecklistCategory } from '@/types/checklist';

export const USER_TYPES = [
  {
    id: 'BUG_AVOIDER',
    label: '벌레회피형',
    description: '벌레/위생 관련 집중',
    icon: 'bug',
  },
  {
    id: 'NOISE_SENSITIVE',
    label: '소음민감형',
    description: '소음/방음 집중',
    icon: 'mute',
  },
  {
    id: 'CLEAN_FREAK',
    label: '쾌적환경형',
    description: '햇빛/환기/곰팡이',
    icon: 'sun',
  },
  {
    id: 'PERFORMANCE_TYPE',
    label: '생활성능형',
    description: '보안/조명 집중 점검',
    icon: 'moon',
  },
  {
    id: 'FIRST_TIMER',
    label: '첫자취형',
    description: '처음이라 다 확인!',
    icon: 'house',
  },
  {
    id: 'ESSENTIALS_ONLY',
    label: '핵심만 빠르게',
    description: '필수만 빠르게',
    icon: 'lightning',
  },
] as const;


export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  isDefault?: boolean;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // 기본 옵션 (BE OPTION 카테고리)
  { id: 'aircon', label: '에어컨', category: '기본 옵션' },
  { id: 'washer', label: '세탁기', category: '기본 옵션' },
  { id: 'fridge', label: '냉장고', category: '기본 옵션' },
  { id: 'wifi', label: '인터넷/와이파이', category: '기본 옵션' },
  { id: 'gas-stove', label: '가스레인지/인덕션', category: '기본 옵션' },
  { id: 'desk-chair', label: '책상/의자', category: '기본 옵션' },
  { id: 'closet', label: '옷장/수납', category: '기본 옵션' },
  { id: 'heating', label: '난방', category: '기본 옵션' },

  // 내부 상태
  { id: 'sunlight', label: '채광', category: '내부 상태' },
  { id: 'ventilation', label: '환기', category: '내부 상태' },
  { id: 'water-pressure', label: '수압 및 배수', category: '내부 상태' },
  { id: 'soundproof', label: '방음', category: '내부 상태' },
  { id: 'window-screen', label: '창문/방충망', category: '내부 상태' },
  { id: 'door-gap', label: '현관/문틈', category: '내부 상태' },

  // 문제 요소
  { id: 'mold', label: '곰팡이', category: '문제 요소', isDefault: true },
  { id: 'leak-trace', label: '누수 흔적', category: '문제 요소', isDefault: true },
  { id: 'bug-trace', label: '벌레 흔적', category: '문제 요소', isDefault: true },
  { id: 'noise-all', label: '내/외부 소음', category: '문제 요소' },
  { id: 'smell', label: '하수구/곰팡이 냄새', category: '문제 요소' },
  { id: 'moisture', label: '습기/결로', category: '문제 요소' },

  // 안전/보안
  { id: 'entrance-security', label: '공동 현관', category: '안전/보안', isDefault: true },
  { id: 'window-lock', label: '창문 잠금장치', category: '안전/보안', isDefault: true },
  { id: 'cctv', label: 'CCTV 설치 여부', category: '안전/보안' },
  { id: 'night-light', label: '야간 조명', category: '안전/보안' },
  { id: 'police', label: '경찰서 근처', category: '안전/보안' },
  { id: 'night-safety', label: '밤길 안전도', category: '안전/보안' },
  { id: 'accessibility', label: '접근성', category: '안전/보안' },
  { id: 'fire-safety', label: '소화기/화재 경보', category: '안전/보안' },

  // 생활 편의
  { id: 'study-space', label: '카페/공부 공간', category: '생활 편의', isDefault: true },
  { id: 'laundry', label: '코인세탁소', category: '생활 편의' },
  { id: 'parking', label: '자전거/차량 주차', category: '생활 편의' },
  { id: 'pharmacy', label: '병원/약국', category: '생활 편의' },
  { id: 'outlets', label: '콘센트 수', category: '생활 편의' },
  { id: 'landlord', label: '집주인 거주 여부', category: '생활 편의' },
  { id: 'delivery', label: '택배 보관 환경', category: '생활 편의' },
  { id: 'dry-space', label: '세탁 건조 공간', category: '생활 편의' },

  // 주변 환경
  { id: 'convenience', label: '편의점/마트', category: '주변 환경', isDefault: true },
  { id: 'transport', label: '대중교통 접근성', category: '주변 환경' },
  { id: 'night-business', label: '야간 상권 인접도', category: '주변 환경' },
  { id: 'greenery', label: '녹지/산 인접도', category: '주변 환경' },
  { id: 'food-density', label: '음식점 밀집도', category: '주변 환경' },
  { id: 'crowd', label: '유동인구', category: '주변 환경' },
  { id: 'construction', label: '공사장 여부', category: '주변 환경' },
  { id: 'slope', label: '언덕 경사', category: '주변 환경' },
];

export const CATEGORIES = ['기본 옵션', '내부 상태', '문제 요소', '안전/보안', '생활 편의', '주변 환경'];

// 공통 항목 라벨 셋 (24개) — 명세서 v2.1.2 "사용자 유형 = -" 항목
// 모든 사용자 유형에 공통 노출. BE V22 분류(DEFAULT 15) 보정용 FE override.
// 유형 클릭 시 항상 활성으로 복원 (프리셋 시맨틱)
export const BASE_ITEM_LABELS: string[] = [
  // OPTION 8 (전체)
  '에어컨', '세탁기', '냉장고', '인터넷/와이파이',
  '가스레인지/인덕션', '책상/의자', '옷장/수납', '난방',
  // PROBLEM 1
  '누수 흔적',
  // SAFETY 8 (전체)
  '공동 현관', '창문 잠금장치',
  'CCTV 설치 여부', '야간 조명', '경찰서 근처', '밤길 안전도', '접근성', '소화기/화재 경보',
  // CONVENIENCE 5
  '카페/공부 공간', '자전거/차량 주차', '병원/약국', '집주인 거주 여부', '택배 보관 환경',
  // ENVIRONMENT 2
  '편의점/마트', '언덕 경사',
];

// 사용자 유형별 추천 항목 매핑 (기능명세서 기반)
export const TYPE_ITEM_MAP: Record<string, string[]> = {
  'BUG_AVOIDER': ['window-screen', 'door-gap', 'bug-trace', 'smell', 'greenery', 'food-density'],
  'NOISE_SENSITIVE': ['soundproof', 'noise-all', 'transport', 'night-business', 'crowd', 'construction'],
  'CLEAN_FREAK': ['sunlight', 'ventilation', 'mold', 'moisture', 'greenery', 'food-density'],
  'PERFORMANCE_TYPE': ['water-pressure', 'noise-all', 'laundry', 'outlets', 'dry-space'],
  'FIRST_TIMER': [], // BE가 전체 항목 반환
  'ESSENTIALS_ONLY': [], // BE가 기본 항목만 반환
};

export const CATEGORY_LABEL: Record<ChecklistCategory, string> = {
  BASIC_INFO: '기본 정보',
  BUILDING_INFO: '건물 정보',
  OPTION: '기본 옵션',
  INTERNAL_STATE: '내부 상태',
  PROBLEM: '문제 요소',
  SAFETY: '안전/보안',
  CONVENIENCE: '생활 편의',
  ENVIRONMENT: '주변 환경',
  CUSTOM: '나만의 항목',
};

export const CATEGORY_ORDER: ChecklistCategory[] = [
  'OPTION', 'INTERNAL_STATE', 'PROBLEM', 'SAFETY', 'CONVENIENCE', 'ENVIRONMENT',
];

/**
 * STEP3 '추가 항목'에서 보여줄 카테고리. 안전/보안이 빠져 있다. (BC-CHK-09 / #244)
 *
 * 2026-07-29 PM 확정이다. 안전/보안 8개는 전부 기본 항목이라 사용자가 끄고 켤
 * 선택지가 아니었고, 카테고리로 두면 "고를 수 있는 것"처럼 보인다.
 *
 * CATEGORY_ORDER 와 갈라 둔 이유
 *   CATEGORY_ORDER 는 여섯 카테고리의 **표시 순서**를 말한다. 여기서 SAFETY 를
 *   빼면 그 뜻이 "STEP3 에서 보이는 것"으로 조용히 바뀌고, 다른 화면이 그 상수를
 *   쓰기 시작하는 날 안전/보안이 이유 없이 사라진다.
 */
export const STEP3_CATEGORY_ORDER: ChecklistCategory[] =
  CATEGORY_ORDER.filter((c) => c !== 'SAFETY');

/**
 * STEP2 맞춤 목록 — 그 유형의 추천 항목만. (BC-CHK-08 / #243)
 *
 * 왜 화면 밖에 있나
 *   SettingsPage 안에 있을 때는 이 규칙을 검사할 방법이 없었다. 그 화면은
 *   비로그인에서 `inert` + `pointer-events-none` 이고 로그인 경로는 백엔드를
 *   요구해서, 규칙이 맞는지 확인하려면 사람이 눈으로 보는 수밖에 없었다.
 *   규칙을 데이터 옆으로 꺼내면 브라우저 없이 검사된다.
 */
export function recommendedItemsFor(typeId: string): ChecklistItem[] {
  // 첫자취형은 전체, 기본형은 기본 항목 — 두 유형은 TYPE_ITEM_MAP 이 비어 있고
  // BE 가 목록을 정한다. 그 계약을 여기서도 그대로 따른다.
  if (typeId === 'FIRST_TIMER') return CHECKLIST_ITEMS;
  if (typeId === 'ESSENTIALS_ONLY') {
    return CHECKLIST_ITEMS.filter((c) => BASE_ITEM_LABELS.includes(c.label));
  }
  const mappedIds = TYPE_ITEM_MAP[typeId] ?? [];
  return CHECKLIST_ITEMS.filter((item) => mappedIds.includes(item.id));
}

/**
 * STEP3 카테고리 — 안전/보안을 뺀 다섯, 각 카테고리는 **전체 항목**. (BC-CHK-09 / #244)
 *
 * 기본 항목을 걷어내지 않는다. 걷어내면 전 항목이 기본인 카테고리가 0 이 되어
 * 화면에서 통째로 사라진다 — 기본 옵션 8개와 안전/보안 8개가 그렇게 없어졌었다.
 */
export function step3Categories(): Array<{ category: ChecklistCategory; label: string; items: ChecklistItem[] }> {
  return STEP3_CATEGORY_ORDER.map((category) => {
    const label = CATEGORY_LABEL[category];
    return { category, label, items: CHECKLIST_ITEMS.filter((i) => i.category === label) };
  });
}
