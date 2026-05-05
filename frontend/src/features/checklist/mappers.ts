import type { ChecklistInput, Direction, ScoreLevel } from '@/types/checklist';

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
