export const USER_TYPES = [
  {
    id: 'pest-sensitive',
    label: '벌레 민감형',
    description: '벌레/위생 관련 집중',
    icon: '🪲',
  },
  {
    id: 'safety-concerned',
    label: '밤길 걱정형',
    description: '보안/조명 집중 점검',
    icon: '👮',
  },
  {
    id: 'sunlight-focused',
    label: '채광 중요형',
    description: '햇빛/환기/곰팡이',
    icon: '☀️',
  },
  {
    id: 'quiet-prefer',
    label: '조용한 곳 선호',
    description: '소음/방음 집중',
    icon: '🔇',
  },
  {
    id: 'first-timer',
    label: '첫 자취',
    description: '처음이라 다 확인!',
    icon: '🏠',
  },
  {
    id: 'core-only',
    label: '핵심만 빠르게',
    description: '필수만 빠르게',
    icon: '⚡',
  },
] as const;

export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  isDefault?: boolean;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // 생활 환경
  { id: 'sunlight', label: '채광', category: '생활 환경', isDefault: true },
  { id: 'ventilation', label: '환기', category: '생활 환경', isDefault: true },
  { id: 'noise-between', label: '층간 소음', category: '생활 환경' },
  { id: 'noise-outside', label: '외부 소음', category: '생활 환경' },
  
  // 방 상태
  { id: 'mold', label: '곰팡이', category: '방 상태', isDefault: true },
  { id: 'wallpaper', label: '벽지 상태', category: '방 상태' },
  { id: 'floor', label: '바닥 상태', category: '방 상태' },
  { id: 'leak', label: '누수 흔적', category: '방 상태', isDefault: true },
  
  // 공동/보안
  { id: 'cctv', label: 'CCTV/보안시설', category: '공동/보안', isDefault: true },
  { id: 'entrance', label: '공동 현관 보안', category: '공동/보안' },
  { id: 'delivery', label: '무인 택배함', category: '공동/보안' },
  { id: 'parking', label: '주차 공간', category: '공동/보안' },
  
  // 주방/욕실
  { id: 'water-pressure', label: '수압', category: '주방/욕실', isDefault: true },
  { id: 'toilet-flush', label: '변기 배수', category: '주방/욕실' },
  { id: 'sink-drain', label: '싱크대 배수', category: '주방/욕실' },
  
  // 주변 환경
  { id: 'convenience', label: '편의점/마트', category: '주변 환경' },
  { id: 'subway', label: '지하철역 거리', category: '주변 환경' },
  { id: 'bus', label: '버스 정류장 거리', category: '주변 환경' },
];

export const CATEGORIES = ['생활 환경', '방 상태', '공동/보안', '주방/욕실', '주변 환경'];

// 사용자 유형별 추천 항목 매핑
export const TYPE_ITEM_MAP: Record<string, string[]> = {
  'pest-sensitive': ['mold', 'leak', 'ventilation', 'sink-drain'],
  'safety-concerned': ['cctv', 'entrance', 'window'],
  'sunlight-focused': ['sunlight', 'ventilation', 'mold'],
  'quiet-prefer': ['noise-between', 'noise-outside'],
  'first-timer': ['sunlight', 'ventilation', 'mold', 'leak', 'cctv', 'water-pressure'],
  'core-only': ['sunlight', 'mold', 'water-pressure'],
};
