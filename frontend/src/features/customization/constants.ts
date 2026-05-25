import type { ChecklistCategory } from '@/types/checklist';

export const USER_TYPES = [
  {
    id: 'BUG_AVOIDER',
    label: '벌레/위생 관련 집중',
    description: '위생 및 벌레 유입 가능성을 고려',
    icon: 'bug',
  },
  {
    id: 'NOISE_SENSITIVE',
    label: '소음/방음 집중',
    description: '주거 환경의 소음 수준을 중요시',
    icon: 'mute',
  },
  {
    id: 'CLEAN_FREAK',
    label: '햇빛/환기/곰팡이',
    description: '공기 질·환기·냄새 등 실내 쾌적성',
    icon: 'sun',
  },
  {
    id: 'PERFORMANCE_TYPE',
    label: '보안/조명 집중 점검',
    description: '거주 편의성·기능 요소 중심',
    icon: 'lightning',
  },
  {
    id: 'FIRST_TIMER',
    label: '처음이라 다 확인!',
    description: '경험이 없어 모든 항목을 폭넓게',
    icon: 'house',
  },
  {
    id: 'ESSENTIALS_ONLY',
    label: '필수만 빠르게',
    description: '최소한의 필수 항목만 빠르게',
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

// 기본 항목 라벨 셋 (15개) — 모든 사용자에게 초기 ON, /custom에 항상 표시, 해제 가능
// 유형 클릭 시 항상 활성으로 복원 (프리셋 시맨틱)
export const BASE_ITEM_LABELS: string[] = [
  '에어컨', '세탁기', '냉장고', '인터넷/와이파이',
  '채광', '환기', '수압 및 배수',
  '곰팡이', '벌레 흔적',
  '공동 현관', '창문 잠금장치',
  '카페/공부 공간', '코인세탁소',
  '편의점/마트', '대중교통 접근성',
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
