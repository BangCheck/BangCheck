import type {
  ChecklistAnswers,
  ChecklistInput,
  ChecklistItemResponse,
  Direction,
  InteriorCheckData,
  Rating,
  SafetyLivingData,
  ScoreLevel,
  YesNo,
} from '@/types/checklist';
import { initInterior, initSafety } from './checklist-constants';

const RENT_TYPE_MAP: Record<string, string> = {
  '전세': 'JEONSE',
  '월세': 'MONTHLY',
  '단기임대': 'MONTHLY',
};

const DIRECTION_MAP: Record<string, string> = {
  '남': 'SOUTH',
  '동': 'EAST',
  '서': 'WEST',
  '북': 'NORTH',
};

const SCORE_MAP: Record<string, number> = {
  '좋음': 3,
  '보통': 2,
  '나쁨': 1,
};

const parseSafeInt = (val: string | undefined, defaultValue: number | null = 0): number | null => {
  if (!val) return defaultValue;
  const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const sanitizeDate = (dateStr: string | undefined): string | null => {
  if (!dateStr) return null;
  const digits = dateStr.replace(/[^0-9]/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return dateStr.includes('-') ? dateStr : null;
};

export const mapInputToRequest = (input: ChecklistInput) => ({
  name: input.name || '이름 없음',
  address: input.address || '',
  rentType: RENT_TYPE_MAP[input.type] ?? 'MONTHLY',
  deposit: parseSafeInt(input.deposit, 0),
  monthlyRent: parseSafeInt(input.rent, 0),
  maintenanceStatus: input.managementFee ? 'INCLUDED' : 'NONE',
  maintenanceFee: parseSafeInt(input.managementFee, 0),
  hasLoan: input.hasLoan === '있음',
  loanAmount: 0,
  canRegisterAddress: true,
  availableFrom: sanitizeDate(input.moveInDate),
  buildingType: 'ONE_ROOM',
  floor: parseSafeInt(input.floor, null),
  hasElevator: input.hasElevator === '있음',
  direction: DIRECTION_MAP[input.direction] ?? 'SOUTH',
  memo: input.memo || '',
  lighting: SCORE_MAP[input.scores['채광']] ?? 2,
  noiseLevel: SCORE_MAP[input.scores['방음']] ?? 2,
  waterPressure: SCORE_MAP[input.scores['수압']] ?? 2,
  soundproof: SCORE_MAP[input.scores['결로/곰팡이']] ?? 2,
  hasMold: input.problems['곰팡이'] === '있음',
  hasLeak: input.problems['누수'] === '있음',
  hasBug: input.problems['벌레'] === '있음',
});

const DIRECTION_REVERSE_MAP: Record<string, string> = {
  'SOUTH': '남', 'EAST': '동', 'WEST': '서', 'NORTH': '북',
};

const SCORE_REVERSE_MAP: Record<number, string> = {
  3: '좋음', 2: '보통', 1: '나쁨',
};

// ── Dynamic answers → 레거시 interior/safety 형태 derive ──
// 비로그인 흐름: ChecklistNewPage가 patchAnswer만 사용해 answers(itemId→value)에 저장.
// addGuestRoom은 raw.interior.mold/leak/pest/drainSmell을 읽어 RoomCard chip 표시.
// 따라서 save 직전에 itemName 기준으로 answers를 interior/safety 객체로 변환한다.

// PROBLEM 카테고리(SINGLE_CHOICE: 없음/약간/심함) → YesNo
const problemValueToYesNo = (v: string | null | undefined): YesNo => {
  if (v === '없음') return '없음';
  if (v === '약간' || v === '심함') return '있음';
  return null;
};

const ratingValueToRating = (v: string | null | undefined): Rating => {
  if (v === '좋음' || v === '보통' || v === '나쁨') return v;
  return null;
};

const PROBLEM_NAME_TO_INTERIOR_KEY: Record<string, keyof InteriorCheckData> = {
  '곰팡이': 'mold',
  '누수 흔적': 'leak',
  '벌레 흔적': 'pest',
  '내/외부 소음': 'noise',
  '하수구/곰팡이 냄새': 'drainSmell',
  '습기 / 결로': 'humidity',
};

const INTERNAL_STATE_NAME_TO_INTERIOR_KEY: Record<string, keyof InteriorCheckData> = {
  '채광': 'lighting',
  '환기': 'ventilation',
  '수압 및 배수': 'waterPressure',
  '방음': 'soundProof',
  '현관 / 문틈': 'entrance',
};

export function deriveInteriorFromAnswers(
  items: ChecklistItemResponse[],
  answers: ChecklistAnswers,
  base: InteriorCheckData = initInterior,
): InteriorCheckData {
  const next: InteriorCheckData = { ...base };
  for (const item of items) {
    const value = answers[item.id] ?? null;
    if (item.category === 'PROBLEM') {
      const key = PROBLEM_NAME_TO_INTERIOR_KEY[item.itemName];
      if (key) (next[key] as YesNo) = problemValueToYesNo(value);
    } else if (item.category === 'INTERNAL_STATE') {
      const key = INTERNAL_STATE_NAME_TO_INTERIOR_KEY[item.itemName];
      if (key) (next[key] as Rating) = ratingValueToRating(value);
    }
  }
  return next;
}

export function deriveSafetyFromAnswers(
  _items: ChecklistItemResponse[],
  _answers: ChecklistAnswers,
  base: SafetyLivingData = initSafety,
): SafetyLivingData {
  // SAFETY/CONVENIENCE/ENVIRONMENT 카테고리는 score 계산에만 영향.
  // chip 표시 경로는 interior로 충분하므로 현재는 base 유지 (후속 작업에서 매핑 확장).
  return { ...base };
}

export const mapResponseToForm = (data: any): Partial<ChecklistInput> => ({
  name: data.name || '',
  address: data.address || '',
  type: data.rentType === 'JEONSE' ? '전세' : '월세',
  deposit: String(data.deposit ?? ''),
  rent: String(data.monthlyRent ?? ''),
  managementFee: String(data.maintenanceFee ?? ''),
  hasLoan: data.hasLoan ? '있음' : '없음',
  loanAmount: String(data.loanAmount ?? ''),
  moveInReport: data.canRegisterAddress ? '가능' : '불가능',
  moveInDate: data.availableFrom || '',
  buildingType: data.buildingType || '',
  hasElevator: data.hasElevator ? '있음' : '없음',
  hasParking: data.hasParking ? '있음' : '없음',
  floor: String(data.floor ?? ''),
  direction: (DIRECTION_REVERSE_MAP[data.direction] ?? '남') as Direction,
  memo: data.memo || '',
  scores: {
    '채광': (SCORE_REVERSE_MAP[data.lighting] ?? '보통') as ScoreLevel,
    '방음': (SCORE_REVERSE_MAP[data.noiseLevel] ?? '보통') as ScoreLevel,
    '수압': (SCORE_REVERSE_MAP[data.waterPressure] ?? '보통') as ScoreLevel,
    '결로/곰팡이': (SCORE_REVERSE_MAP[data.soundproof] ?? '보통') as ScoreLevel,
  },
  problems: {
    '곰팡이': data.hasMold ? '있음' : '없음',
    '누수': data.hasLeak ? '있음' : '없음',
    '벌레': data.hasBug ? '있음' : '없음',
  },
  options: data.options || [],
});
