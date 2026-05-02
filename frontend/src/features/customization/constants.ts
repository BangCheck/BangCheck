export const USER_TYPES = [
  {
    id: 'BUG_AVOIDER',
    label: '벌레 싫어형',
    description: '해충/위생 집중 관리',
    icon: 'bug',
  },
  {
    id: 'NOISE_SENSITIVE',
    label: '소음 민감형',
    description: '조용하고 아늑한 공간',
    icon: 'mute',
  },
  {
    id: 'CLEAN_FREAK',
    label: '깔끔 꼼꼼형',
    description: '햇빛과 환기 위주',
    icon: 'sun',
  },
  {
    id: 'PERFORMANCE_TYPE',
    label: '생활 성능형',
    description: '수압과 편의시설 중심',
    icon: 'moon',
  },
] as const;


export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  isDefault?: boolean;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // 내부 상태
  { id: 'sunlight', label: '채광', category: '내부 상태' },
  { id: 'ventilation', label: '환기', category: '내부 상태' },
  { id: 'water-pressure', label: '수압 및 배수', category: '내부 상태' },
  { id: 'soundproof', label: '방음', category: '내부 상태' },
  { id: 'window-screen', label: '창문 / 방충망', category: '내부 상태' },
  { id: 'door-gap', label: '현관 / 문틈', category: '내부 상태' },

  // 문제 요소
  { id: 'mold', label: '곰팡이', category: '문제 요소', isDefault: true },
  { id: 'leak-trace', label: '누수 흔적', category: '문제 요소', isDefault: true },
  { id: 'bug-trace', label: '벌레 흔적', category: '문제 요소', isDefault: true },
  { id: 'noise-all', label: '내/외부 소음', category: '문제 요소' },
  { id: 'smell', label: '하수구/곰팡이 냄새', category: '문제 요소' },
  { id: 'moisture', label: '습기 / 결로', category: '문제 요소' },

  // 안전/보안
  { id: 'entrance-security', label: '공동 현관', category: '안전/보안', isDefault: true },
  { id: 'window-lock', label: '창문 잠금장치', category: '안전/보안', isDefault: true },
  { id: 'cctv', label: 'CCTV 설치 여부', category: '안전/보안' },
  { id: 'night-light', label: '야간 조명', category: '안전/보안' },
  { id: 'police', label: '경찰서 근처', category: '안전/보안' },
  { id: 'night-safety', label: '밤길 안전도', category: '안전/보안' },
  { id: 'accessibility', label: '접근성(큰길/골목)', category: '안전/보안' },
  { id: 'fire-safety', label: '소화기/화재 경보', category: '안전/보안' },

  // 생활 편의
  { id: 'study-space', label: '카페 / 공부 공간', category: '생활 편의', isDefault: true },
  { id: 'laundry', label: '코인세탁소', category: '생활 편의' },
  { id: 'parking', label: '자전거 / 차량 주차', category: '생활 편의' },
  { id: 'pharmacy', label: '병원 / 약국', category: '생활 편의' },
  { id: 'outlets', label: '콘센트 수', category: '생활 편의' },
  { id: 'landlord', label: '집주인 거주 여부', category: '생활 편의' },
  { id: 'delivery', label: '택배 보관 환경', category: '생활 편의' },
  { id: 'dry-space', label: '세탁 건조 공간', category: '생활 편의' },

  // 주변 환경
  { id: 'convenience', label: '편의점 / 마트', category: '주변 환경', isDefault: true },
  { id: 'transport', label: '대중교통 접근성', category: '주변 환경' },
  { id: 'night-business', label: '야간 상권 인접도', category: '주변 환경' },
  { id: 'greenery', label: '녹지/산 인접도', category: '주변 환경' },
  { id: 'food-density', label: '음식점 밀집도', category: '주변 환경' },
  { id: 'crowd', label: '유동인구', category: '주변 환경' },
  { id: 'construction', label: '공사장 여부', category: '주변 환경' },
  { id: 'slope', label: '언덕 경사', category: '주변 환경' },
];

export const CATEGORIES = ['내부 상태', '문제 요소', '안전/보안', '생활 편의', '주변 환경'];

// 사용자 유형별 추천 항목 매핑 (기능명세서 기반)
export const TYPE_ITEM_MAP: Record<string, string[]> = {
  'BUG_AVOIDER': ['window-screen', 'door-gap', 'bug-trace', 'smell', 'greenery', 'food-density'],
  'NOISE_SENSITIVE': ['soundproof', 'noise-all', 'transport', 'night-business', 'crowd', 'construction'],
  'CLEAN_FREAK': ['sunlight', 'ventilation', 'mold', 'moisture', 'greenery', 'food-density'],
  'PERFORMANCE_TYPE': ['water-pressure', 'noise-all', 'laundry', 'outlets', 'dry-space'],
};
