// SSoT — 내부상태/문제확인 항목별 hint + 가이드 패널 텍스트
// Figma 소스: 587:42437 (ChecklistNew 페이지), v0.2 인벤토리 참조
// 위치: _woo/projects/08_SWYP/04_docs/pages/checklist-new/components.md

import type { InteriorCheckData } from '@/types';

type InteriorKey = keyof InteriorCheckData;

export interface ChecklistGuide {
  /** 카드 헤더의 한 줄 hint (label 아래) */
  hint: string;
  /** 가이드 패널 제목 (예: "채광 확인 가이드") */
  guideTitle: string;
  /** 가이드 체크 항목 */
  guideItems: string[];
  /** 가이드 변형: simple(텍스트만) / with-photos(예시 사진 동반) */
  variant: 'simple' | 'with-photos';
  /** 전체 너비 메인 가이드 사진 (annotated composite) */
  mainPhoto?: string;
  /** 예시 사진 2장 소스 (left-crop / right-crop으로 나눠서 표시) */
  examplesPhoto?: string;
  /** examplesPhoto에 이미 2장이 합쳐있을 때 — 분할 없이 단일 타일로 노출 */
  singleExample?: boolean;
}

/** BE itemName(한글) → 가이드 매핑 (DynamicChecklistSections에서 사용) */
export function getGuideByItemName(name: string): ChecklistGuide | undefined {
  const trimmed = name.trim();
  // 정규화: 공백/구두점 변형 흡수
  const normalize = (s: string) => s.replace(/\s+/g, '').replace(/[/·,]/g, '').replace(/(및|와|또는|혹은)/g, '');
  const normalized = normalize(trimmed);
  for (const guide of Object.values(CHECKLIST_GUIDES)) {
    if (!guide) continue;
    const guideName = normalize(guide.guideTitle).replace('확인가이드', '');
    if (normalized === guideName || normalized.startsWith(guideName) || guideName.startsWith(normalized)) {
      return guide;
    }
  }
  return undefined;
}

export const CHECKLIST_GUIDES: Partial<Record<InteriorKey, ChecklistGuide>> = {
  // §4 내부상태 — 3-radio (좋음/보통/나쁨), variant: simple
  lighting: {
    hint: '낮 시간 방문 시 자연광 들어오는 정도 확인',
    guideTitle: '채광 확인 가이드',
    variant: 'simple',
    guideItems: [
      '가능하면 오전/오후 두 번 방문하여 햇빛 변화 확인',
      '창문 크기와 위치, 가리는 건물/장애물 확인',
      '모든 조명을 끄고 자연광만으로 밝기 체감',
      '흐린 날 추가 방문하면 최소 채광 확인 가능',
      '인근 건물 신축 계획 확인 (향후 채광 변화 예측)',
    ],
  },
  ventilation: {
    hint: '창문 개수, 위치, 맞통풍 가능 여부 확인',
    guideTitle: '환기 확인 가이드',
    variant: 'simple',
    guideItems: [
      '창문이 두 면 이상에 있는지 확인 (맞통풍 가능 여부)',
      '환기창/팬 작동 테스트 (욕실, 주방)',
      '창문 열고 공기 흐름 직접 체감',
      '창문 외부 환경 확인 (도로/벽/건물 등)',
      '결로/곰팡이 흔적이 있다면 환기 부족 의심',
    ],
  },
  waterPressure: {
    hint: '주방 싱크대, 욕실 샤워, 변기 모두 직접 작동',
    guideTitle: '수압/배수 확인 가이드',
    variant: 'simple',
    guideItems: [
      '모든 수전을 동시에 켜서 수압 변화 확인',
      '뜨거운 물이 나오기까지 걸리는 시간 측정',
      '변기 물 내림 후 다시 차오르는 속도 확인',
      '욕실 배수구에 물 부어 빠지는 속도 확인',
      '싱크대 배수 시 역류 또는 냄새 여부 확인',
      '세탁기 급수/배수 확인 (해당 시)',
    ],
  },
  soundProof: {
    hint: '벽을 두드려보거나 외부 소음 들리는 정도 확인',
    guideTitle: '방음 확인 가이드',
    variant: 'simple',
    guideItems: [
      '벽을 가볍게 두드려 두께 체감 (텅 빈 소리는 얇은 벽)',
      '방문 닫고 외부 복도 소리 들리는지 확인',
      '옆집/위층 발소리, 대화 소리 확인 (가능하면 거주 시간대 방문)',
      '창문 닫고 외부 소음 차단 정도 확인',
      '화장실 환풍구로 다른 호실 소리 들리는지 확인',
    ],
  },
  entrance: {
    hint: '현관문 개폐 + 문틈 사이 빛/바람 새는지 확인',
    guideTitle: '현관/문틈 확인 가이드',
    variant: 'simple',
    guideItems: [
      '문 닫은 상태에서 외부 빛이 새어 들어오는지 확인 (어둡게 한 후 체크)',
      '문 사이로 손가락이나 종이가 들어가는지 확인 (단열/방음 영향)',
      '도어락 작동 부드러움 확인',
      '외풍 차단 패드/도어 스토퍼 부착 가능 여부 확인',
    ],
  },

  // §5 문제확인 — 2-radio (있음/없음), variant: with-photos
  mold: {
    hint: '벽지 모서리, 욕실 천장, 창문 주변, 싱크대 하부 확인',
    guideTitle: '곰팡이 확인 가이드',
    variant: 'with-photos',
    mainPhoto: '/images/guides/guide-mold-main.jpg',
    examplesPhoto: '/images/guides/guide-mold-examples.jpg',
    singleExample: true,
    guideItems: [
      '가구/가전 뒤편(특히 침대 머리맡 벽) 확인 요청',
      '욕실 실리콘/타일 사이 검은 점 형태 확인',
      '벽지/장판 들뜸이 있는 구역 의심',
      '창문 주변 결로 흔적 (얼룩/물자국) 확인',
      '곰팡이 냄새가 나는 공간 (옷장/신발장 내부) 확인',
      '새로 도배한 흔적이 있다면 그 이유 문의',
    ],
  },
  leak: {
    hint: '천장 얼룩, 창문 물기, 화장실 배관 연결부 확인',
    guideTitle: '누수 확인 가이드',
    variant: 'with-photos',
    mainPhoto: '/images/guides/guide-leak-main.jpg',
    examplesPhoto: '/images/guides/guide-leak-examples.jpg',
    singleExample: true,
    guideItems: [
      '천장 얼룩/변색 부위 확인 (특히 욕실/주방 위층 배관 통과 지점)',
      '벽 하단 페인트 벗겨짐, 벽지 들뜸 확인',
      '욕실 배관 연결부 물기/녹 흔적 확인',
      '베란다/세탁기 주변 바닥 곰팡이 또는 물자국 확인',
      '비 오는 날이나 직후 방문 권장 (실제 누수 확인 가능)',
      '옥상 바로 아래층/반지하는 더 꼼꼼한 확인 필요',
    ],
  },
  pest: {
    hint: '트랩 확인, 싱크대 하부/창틀/몰딩 주변/배수구 확인',
    guideTitle: '벌레 흔적 확인 가이드',
    variant: 'with-photos',
    examplesPhoto: '/images/guides/guide-pest-examples.jpg',
    singleExample: true,
    guideItems: [
      '검은 점 형태의 배설물이 있는지 확인 (싱크대 하부, 서랍 모서리)',
      '조명 커버 안에 벌레 시체가 있는지 확인',
      '트랩 및 모서리에 쥐똥/치약 형태의 흔적이 있는지 확인',
      '싱크대 하부 수전 주변 끈끈한 자국/알 확인',
      '베란다 배수구, 화장실 배수구 트랩 상태 확인',
      '창틀 실리콘 갈라짐 (외부 유입 경로) 확인',
    ],
  },
  noise: {
    hint: '방문 시 일정 시간 머무르며 외부 소음 청취',
    guideTitle: '소음 확인 가이드',
    variant: 'with-photos',
    guideItems: [
      '가능한 한 거주 시간대(저녁, 주말)에 방문하여 실제 소음 체감',
      '창문 열고/닫고 각각 외부 소음 차이 확인',
      '도로 인접 시 차량 소음, 학교/상가 인접 시 시간대별 변화 확인',
      '위층/옆집 발소리/대화 소리 확인',
      '화장실 배관 소음, 환풍구로 들리는 소음 확인',
      '인근 공사장/유흥가 유무 확인',
    ],
  },
  drainSmell: {
    hint: '욕실, 싱크대, 베란다 등 배수구 주변에서 직접 냄새 확인',
    guideTitle: '냄새 확인 가이드',
    variant: 'with-photos',
    guideItems: [
      '환기구를 막은 상태에서 냄새 체크 (환기로 가려진 냄새 확인)',
      '배수구 트랩 물 부어 봉수 확인 (마른 트랩이면 하수 냄새 올라옴)',
      '옷장/신발장 내부 곰팡이 냄새 확인',
      '비 온 직후 방문 시 습기 관련 냄새 더 명확히 확인 가능',
      '이전 거주자가 사용한 방향제/탈취제로 가려진 냄새 의심',
    ],
  },
  humidity: {
    hint: '창문 주변, 벽 하단, 욕실 외벽 결로 흔적 확인',
    guideTitle: '습기/결로 확인 가이드',
    variant: 'with-photos',
    mainPhoto: '/images/guides/guide-humidity-main.jpg',
    examplesPhoto: '/images/guides/guide-humidity-examples.jpg',
    singleExample: true,
    guideItems: [
      '창문 주변 물자국/얼룩 (결로 발생 흔적) 확인',
      '벽 하단 곰팡이/페인트 벗겨짐 확인',
      '옷장 안쪽 곰팡이/습기 냄새 확인',
      '겨울철 방문 시 결로 직접 확인 가능',
      '환기 부족, 단열 부실, 외벽 면한 방인 경우 위험도 증가',
      '반지하/북향 방은 더 꼼꼼한 확인 필요',
    ],
  },
};
