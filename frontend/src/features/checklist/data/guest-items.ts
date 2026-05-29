// 비로그인 사용자용 정적 체크리스트 카탈로그
// BE seed (V17 + V19 + V20 + V22) 미러
// - DEFAULT 15개: 모든 사용자에게 항상 노출
// - USER_TYPE 29개: 성향별/첫 자취형 노출. 비로그인은 첫 자취형 동등 = DEFAULT + 전체 USER_TYPE
// - userType 컬럼은 V22에서 NULL 처리(연결 테이블로 이동). 비로그인은 단일 성향 필터링 미사용.

import type { ChecklistItemResponse } from '@/types';

const mk = (
  id: number,
  itemName: string,
  category: ChecklistItemResponse['category'],
  itemType: ChecklistItemResponse['itemType'],
  inputType: ChecklistItemResponse['inputType'],
  displayOrder: number,
  options: string[],
  description = '',
): ChecklistItemResponse => ({
  id,
  itemName,
  category,
  itemType,
  userType: null as unknown as ChecklistItemResponse['userType'],
  inputType,
  description,
  displayOrder,
  isEnabled: true,
  options: options.map((optionValue, idx) => ({
    id: id * 10 + idx + 1,
    optionValue,
    displayOrder: idx + 1,
  })),
});

const YES_NO = ['있음', '없음'];
const BOOL = ['있음', '없음']; // 왼쪽=positive 규칙: 있음(green) 우선
const RATING = ['좋음', '보통', '나쁨'];
const PROBLEM_LEVEL = ['없음', '약간', '심함'];

export const GUEST_CHECKLIST_ITEMS: ChecklistItemResponse[] = [
  // ── OPTION (1-8) ── 전 항목 DEFAULT (V20에서 좀비 CUSTOM 정정)
  mk(1, '에어컨', 'OPTION', 'DEFAULT', 'MULTIPLE_CHOICE', 1, YES_NO),
  mk(2, '세탁기', 'OPTION', 'DEFAULT', 'MULTIPLE_CHOICE', 2, YES_NO),
  mk(3, '냉장고', 'OPTION', 'DEFAULT', 'MULTIPLE_CHOICE', 3, YES_NO),
  mk(4, '인터넷/와이파이', 'OPTION', 'DEFAULT', 'MULTIPLE_CHOICE', 4, YES_NO),
  mk(5, '가스레인지/인덕션', 'OPTION', 'USER_TYPE', 'MULTIPLE_CHOICE', 5, YES_NO),
  mk(6, '책상/의자', 'OPTION', 'USER_TYPE', 'MULTIPLE_CHOICE', 6, YES_NO),
  mk(7, '옷장/수납', 'OPTION', 'USER_TYPE', 'MULTIPLE_CHOICE', 7, YES_NO),
  mk(8, '난방', 'OPTION', 'USER_TYPE', 'MULTIPLE_CHOICE', 8, YES_NO),

  // ── INTERNAL_STATE (9-14) ──
  mk(9, '채광', 'INTERNAL_STATE', 'DEFAULT', 'SINGLE_CHOICE', 1, RATING,
    '낮 시간 방문 시 자연광 들어오는 정도 확인'),
  mk(10, '환기', 'INTERNAL_STATE', 'DEFAULT', 'SINGLE_CHOICE', 2, RATING,
    '창문 개수, 위치, 맞통풍 가능 여부 확인'),
  mk(11, '수압 및 배수', 'INTERNAL_STATE', 'DEFAULT', 'SINGLE_CHOICE', 3, RATING,
    '주방 싱크대, 욕실 샤워, 변기 모두 직접 작동'),
  mk(12, '방음', 'INTERNAL_STATE', 'USER_TYPE', 'SINGLE_CHOICE', 4, RATING,
    '벽을 두드려보거나 외부 소음 들리는 정도 확인'),
  mk(13, '창문 / 망충망', 'INTERNAL_STATE', 'USER_TYPE', 'SINGLE_CHOICE', 5, RATING,
    '창문 개폐 작동 + 방충망 파손 여부 확인'),
  mk(14, '현관 / 문틈', 'INTERNAL_STATE', 'USER_TYPE', 'SINGLE_CHOICE', 6, RATING,
    '현관문 개폐 + 문틈 사이 빛/바람 새는지 확인'),

  // ── PROBLEM (15-20) ──
  mk(15, '곰팡이', 'PROBLEM', 'DEFAULT', 'SINGLE_CHOICE', 1, PROBLEM_LEVEL,
    '벽지 모서리, 욕실 천장, 창문 주변, 싱크대 하부 확인'),
  mk(16, '누수 흔적', 'PROBLEM', 'USER_TYPE', 'SINGLE_CHOICE', 2, PROBLEM_LEVEL,
    '천장 얼룩, 창문 물기, 화장실 배관 연결부 확인'),
  mk(17, '벌레 흔적', 'PROBLEM', 'DEFAULT', 'SINGLE_CHOICE', 3, PROBLEM_LEVEL,
    '트랩 확인, 싱크대 하부/창틀/몰딩 주변/배수구 확인'),
  mk(18, '내/외부 소음', 'PROBLEM', 'USER_TYPE', 'SINGLE_CHOICE', 4, PROBLEM_LEVEL,
    '방문 시 일정 시간 머무르며 외부 소음 청취'),
  mk(19, '하수구/곰팡이 냄새', 'PROBLEM', 'USER_TYPE', 'SINGLE_CHOICE', 5, PROBLEM_LEVEL,
    '욕실, 싱크대, 베란다 등 배수구 주변에서 직접 냄새 확인'),
  mk(20, '습기 / 결로', 'PROBLEM', 'USER_TYPE', 'SINGLE_CHOICE', 6, PROBLEM_LEVEL,
    '창문 주변, 벽 하단, 욕실 외벽 결로 흔적 확인'),

  // ── SAFETY (21-28) ──
  mk(21, '공동 현관', 'SAFETY', 'DEFAULT', 'BOOLEAN', 1, BOOL,
    '건물 출입구의 공동 현관 비밀번호 또는 카드키 시스템 확인'),
  mk(22, '창문 잠금장치', 'SAFETY', 'DEFAULT', 'BOOLEAN', 2, BOOL,
    '모든 창문의 잠금장치 정상 작동 여부 확인'),
  mk(23, 'CCTV 설치 여부', 'SAFETY', 'USER_TYPE', 'BOOLEAN', 3, BOOL,
    '건물 내외부 CCTV 설치 위치 및 작동 여부 확인'),
  mk(24, '야간 조명', 'SAFETY', 'USER_TYPE', 'SINGLE_CHOICE', 4, ['밝음', '보통', '어두움'],
    '저녁/밤 시간대 방문 시 골목 및 건물 주변 조명 밝기 확인'),
  mk(25, '경찰서 근처', 'SAFETY', 'USER_TYPE', 'SINGLE_CHOICE', 5, ['가깝다', '보통', '멀다'],
    '지도 앱으로 가장 가까운 경찰서/지구대 거리 확인'),
  mk(26, '밤길 안전도', 'SAFETY', 'USER_TYPE', 'SINGLE_CHOICE', 6, ['안전', '보통', '불안'],
    '저녁 시간 직접 거주지까지 걸어보며 안전성 확인'),
  mk(27, '접근성', 'SAFETY', 'USER_TYPE', 'SINGLE_CHOICE', 7, ['큰길 근처', '보통', '깊은 골목'],
    '큰길에서 집까지 진입 경로 확인'),
  mk(28, '소화기/화재 경보', 'SAFETY', 'USER_TYPE', 'BOOLEAN', 8, BOOL,
    '복도 소화기 비치 위치 및 화재 감지기 설치 여부 확인'),

  // ── CONVENIENCE (29-36) ──
  mk(29, '카페 / 공부 공간', 'CONVENIENCE', 'DEFAULT', 'BOOLEAN', 1, BOOL,
    '도보 10분 내 카페/스터디카페/공공도서관 위치 확인'),
  mk(30, '코인세탁소', 'CONVENIENCE', 'DEFAULT', 'BOOLEAN', 2, BOOL,
    '도보 10분 내 코인세탁소 위치 확인 (세탁기 옵션 없을 시 필수)'),
  mk(31, '자전거 / 차량 주차', 'CONVENIENCE', 'USER_TYPE', 'BOOLEAN', 3, BOOL,
    '건물 주차장 또는 주변 거치 공간 확인'),
  mk(32, '병원 / 약국', 'CONVENIENCE', 'USER_TYPE', 'BOOLEAN', 4, BOOL,
    '도보 또는 대중교통 5~10분 내 병원/약국 위치 확인'),
  mk(33, '콘센트 수', 'CONVENIENCE', 'USER_TYPE', 'SINGLE_CHOICE', 5, ['충분', '보통', '부족'],
    '각 방의 콘센트 위치 및 개수 직접 확인'),
  mk(34, '집주인 거주 여부', 'CONVENIENCE', 'USER_TYPE', 'SINGLE_CHOICE', 6, ['비상주', '상주'],
    '집주인이 같은 건물 또는 인근 거주 여부 확인'),
  mk(35, '택배 보관 환경', 'CONVENIENCE', 'USER_TYPE', 'SINGLE_CHOICE', 7, ['공용 보관', '없음'],
    '공동 택배함 또는 무인 택배 보관 시스템 유무 확인'),
  mk(36, '세탁 건조 공간', 'CONVENIENCE', 'USER_TYPE', 'BOOLEAN', 8, BOOL,
    '실내 건조 공간 또는 베란다 유무 확인'),

  // ── ENVIRONMENT (37-44) ──
  mk(37, '편의점 / 마트', 'ENVIRONMENT', 'DEFAULT', 'SINGLE_CHOICE', 1, ['가깝다', '보통', '멀다'],
    '도보 5~10분 내 편의점/마트 위치 확인'),
  mk(38, '대중교통 접근성', 'ENVIRONMENT', 'DEFAULT', 'SINGLE_CHOICE', 2, ['가깝다', '보통', '멀다'],
    '도보 10분 내 지하철역/버스정류장 위치 확인'),
  mk(39, '야간 상권 인접도', 'ENVIRONMENT', 'USER_TYPE', 'SINGLE_CHOICE', 3, ['가깝다', '보통', '멀다'],
    '인근 술집/유흥가 밀집도 확인 (소음/안전 영향)'),
  mk(40, '녹지/산 인접도', 'ENVIRONMENT', 'USER_TYPE', 'SINGLE_CHOICE', 4, ['가깝다', '보통', '멀다'],
    '도보 거리 내 공원/산책로 위치 확인'),
  mk(41, '음식점 밀집도', 'ENVIRONMENT', 'USER_TYPE', 'SINGLE_CHOICE', 5, ['많음', '보통', '없음'],
    '도보 거리 내 식당/배달 가능 매장 수 확인'),
  mk(42, '유동인구', 'ENVIRONMENT', 'USER_TYPE', 'SINGLE_CHOICE', 6, ['많음', '보통', '없음'],
    '평일/주말, 낮/밤 시간대별 거리 활기 정도 확인'),
  mk(43, '공사장 여부', 'ENVIRONMENT', 'USER_TYPE', 'SINGLE_CHOICE', 7, ['없음', '모름', '있음'],
    '인근 공사장 유무 확인 (소음/먼지/진동 영향)'),
  mk(44, '언덕 경사', 'ENVIRONMENT', 'USER_TYPE', 'SINGLE_CHOICE', 8, ['완만', '보통', '가파름'],
    '집까지 가는 길의 경사도 확인 (도보 시 체감)'),
];
