import type { Room, RoomListItem, BasicInfoData, BuildingInfoData, InteriorCheckData, CustomMemoData, RoomFormState, ChecklistAnswers, ChecklistCategory } from '@/types';

// ── FE → API enum maps ────────────────────────────────────────

export const RENT_TYPE_TO_API: Record<string, string> = {
  전세: 'JEONSE',
  월세: 'MONTHLY',
  단기임대: 'SHORT_TERM',
};

export const BUILDING_TYPE_MAP: Record<string, string> = {
  원룸: 'ONE_ROOM', '1.5룸': 'ONE_POINT_FIVE_ROOM', 빌라: 'VILLA',
  오피스텔: 'OFFICETEL', 고시원: 'GOSIWON', 하숙: 'BOARDING_HOUSE',
};

export const DIRECTION_MAP: Record<string, string> = {
  남향: 'SOUTH', 동향: 'EAST', 서향: 'WEST', 북향: 'NORTH',
};

// ── API → FE enum maps ────────────────────────────────────────

const RENT_TYPE_TO_KO: Record<string, Room['type']> = {
  MONTHLY: '월세', JEONSE: '전세', SHORT_TERM: '단기임대',
};

const API_TO_BUILDING_TYPE: Record<string, string> = {
  ONE_ROOM: '원룸', ONE_POINT_FIVE_ROOM: '1.5룸', VILLA: '빌라',
  OFFICETEL: '오피스텔', GOSIWON: '고시원', BOARDING_HOUSE: '하숙',
};

const API_TO_RENT_TYPE: Record<string, string> = {
  JEONSE: '전세', MONTHLY: '월세', SHORT_TERM: '단기임대',
};

const API_TO_DIRECTION: Record<string, string> = {
  SOUTH: '남향', EAST: '동향', WEST: '서향', NORTH: '북향',
};

const SORT_TO_API: Record<string, string> = {
  '보증금 낮은순': 'DEPOSIT_ASC',
  '월세 낮은순': 'RENT_ASC',
  '관리비 낮은순': 'MANAGEMENT_FEE_ASC',
};

// ── Checklist answer building ─────────────────────────────────

export interface ChecklistItemApi {
  id: number;
  itemName: string;
  category?: ChecklistCategory;
  inputType?: string;
  options: { id: number; optionValue: string }[];
}

type CheckAnswer = { itemId: number; selectedOptionIds: number[]; valueText?: string };

const RATING_ITEM_TO_FIELD: Record<string, keyof InteriorCheckData> = {
  채광: 'lighting', 환기: 'ventilation', '수압 및 배수': 'waterPressure', 방음: 'soundProof',
};

const PROBLEM_ITEM_TO_FIELD: Record<string, keyof InteriorCheckData> = {
  곰팡이: 'mold', '누수 흔적': 'leak', '벌레 흔적': 'pest', '하수구/곰팡이 냄새': 'drainSmell',
};

export function buildLookup(items: ChecklistItemApi[]) {
  return new Map(
    items.map((item) => [
      item.itemName,
      { id: item.id, optByValue: new Map(item.options.map((o) => [o.optionValue, o.id])) },
    ]),
  );
}

export function mapToCheckAnswers(
  interior: InteriorCheckData,
  building: BuildingInfoData,
  lookup: ReturnType<typeof buildLookup>,
): CheckAnswer[] {
  const answers: CheckAnswer[] = [];

  const addSingle = (itemName: string, optionValue: string | null) => {
    if (!optionValue) return;
    const entry = lookup.get(itemName);
    if (!entry) return;
    const optId = entry.optByValue.get(optionValue);
    if (optId !== undefined) answers.push({ itemId: entry.id, selectedOptionIds: [optId] });
  };

  addSingle('채광', interior.lighting);
  addSingle('환기', interior.ventilation);
  addSingle('수압 및 배수', interior.waterPressure);
  addSingle('방음', interior.soundProof);

  const severity = (v: string | null) => (v === '없음' ? '없음' : v === '있음' ? '약간' : null);
  addSingle('곰팡이', severity(interior.mold));
  addSingle('누수 흔적', severity(interior.leak));
  addSingle('벌레 흔적', severity(interior.pest));
  addSingle('하수구/곰팡이 냄새', severity(interior.drainSmell));

  for (const optName of building.options) {
    const entry = lookup.get(optName);
    if (!entry) continue;
    const optId = entry.optByValue.get('있음');
    if (optId !== undefined) answers.push({ itemId: entry.id, selectedOptionIds: [optId] });
  }

  return answers;
}

// ── API response shapes ───────────────────────────────────────

interface CheckResultApi {
  itemId: number | null;
  itemName: string;
  valueText: string | null;
  selectedOptions: { optionId?: number; optionValue?: string }[];
}

export interface RoomDetailApi {
  id: number;
  name: string;
  address: string;
  rentType: string;
  deposit: number | null;
  rent: number | null;
  managementFee: number | null;
  isManagementFeeUnknown: boolean;
  hasLoan: boolean;
  loanAmount: number | null;
  canRegisterAddress: boolean;
  moveInDate: string | null;
  isMoveInDateNegotiable: boolean | null;
  buildingType: string;
  floor: number | null;
  hasElevator: boolean;
  specialFloor: string | null;
  direction: string;
  memo: string | null;
  checkResults: CheckResultApi[];
}

// ── Mapper functions ──────────────────────────────────────────

function formatFloor(floor?: number | null, specialFloor?: string | null): string | undefined {
  if (specialFloor === 'SEMI_BASEMENT') return '반지하';
  if (specialFloor === 'ROOFTOP') return '옥탑';
  if (floor != null) return `${floor}층`;
  return undefined;
}

export function mapApiRoomToRoom(item: RoomListItem): Room {
  return {
    id: String(item.id),
    name: item.name,
    address: item.address,
    type: RENT_TYPE_TO_KO[item.rentType] ?? '월세',
    deposit: item.deposit,
    rent: item.rent,
    buildingType: API_TO_BUILDING_TYPE[item.buildingType] ?? item.buildingType,
    floor: formatFloor(item.floor, item.specialFloor),
    managementFee: item.managementFee ?? undefined,
    direction: item.direction ? API_TO_DIRECTION[item.direction] ?? undefined : undefined,
    price: '',
    tags: [],
    score: 0,
    issues: { mold: false, leak: false, bug: false },
    createdAt: item.createdAt,
  };
}

const INIT_INTERIOR: InteriorCheckData = {
  lighting: null, ventilation: null, floorNoise: null,
  waterPressure: null, soundProof: null, heating: null,
  entrance: null,
  mold: null, pest: null, leak: null, wallpaper: null, drainSmell: null,
  noise: null, humidity: null,
};

export function mapApiToForms(detail: RoomDetailApi, items?: ChecklistItemApi[]): RoomFormState {
  const optionNames: string[] = [];
  const interior: InteriorCheckData = { ...INIT_INTERIOR };
  const answers: ChecklistAnswers = {};

  // 동적 OPTION 카테고리 라벨 set (items 미제공 시 빈 set → OPTION 매칭 없음, 모두 answers로 적재됨)
  const optionNameSet = new Set(
    (items ?? []).filter((i) => i.category === 'OPTION').map((i) => i.itemName),
  );

  for (const result of detail.checkResults) {
    const optVal = result.selectedOptions[0]?.optionValue ?? result.valueText ?? null;
    if (optionNameSet.has(result.itemName) && optVal === '있음') {
      optionNames.push(result.itemName);
    } else if (RATING_ITEM_TO_FIELD[result.itemName]) {
      // 기존 InteriorCheckData 호환 유지
      const field = RATING_ITEM_TO_FIELD[result.itemName];
      (interior as unknown as Record<string, unknown>)[field] = optVal;
      if (result.itemId) answers[result.itemId] = optVal;
    } else if (PROBLEM_ITEM_TO_FIELD[result.itemName]) {
      const field = PROBLEM_ITEM_TO_FIELD[result.itemName];
      const yesNo = optVal === '없음' ? '없음' : optVal ? '있음' : null;
      (interior as unknown as Record<string, unknown>)[field] = yesNo;
      if (result.itemId) answers[result.itemId] = optVal;
    } else if (result.itemId && optVal) {
      // SAFETY / CONVENIENCE / ENVIRONMENT 및 기타 동적 항목
      answers[result.itemId] = optVal;
    }
  }

  return {
    basic: {
      name: detail.name,
      address: detail.address,
      transactionType: API_TO_RENT_TYPE[detail.rentType] ?? null,
      deposit: detail.deposit?.toString() ?? '',
      monthlyRent: detail.rent?.toString() ?? '',
      managementFee: detail.managementFee?.toString() ?? '',
      includeMgmtInRent: false,
      isMgmtUnknown: detail.isManagementFeeUnknown,
      loanStatus: detail.hasLoan ? '있음' : '없음',
      loanAmount: detail.loanAmount?.toString() ?? '',
      moveInReport: detail.canRegisterAddress ? '가능' : '불가능',
      moveInDate: detail.moveInDate ?? '',
      moveInNegotiable: detail.isMoveInDateNegotiable ?? false,
    },
    building: {
      buildingType: API_TO_BUILDING_TYPE[detail.buildingType] ?? null,
      elevator: detail.hasElevator ? '있음' : '없음',
      floorLevel: detail.specialFloor === 'SEMI_BASEMENT' ? '반지하' : null,
      floorDirect: detail.floor?.toString() ?? '',
      direction: API_TO_DIRECTION[detail.direction] ?? null,
      options: optionNames,
    },
    interior,
    answers,
    custom: { customItems: [], memo: detail.memo ?? '' },
  };
}

// ChecklistAnswers + ChecklistItemApi → checkAnswers (저장용)
export function mapAnswersToCheckAnswers(
  answers: ChecklistAnswers,
  building: BuildingInfoData,
  items: ChecklistItemApi[],
): CheckAnswer[] {
  const result: CheckAnswer[] = [];

  console.log('[mapAnswersToCheckAnswers] answers:', answers);
  console.log('[mapAnswersToCheckAnswers] checklistItems:', items.map((i) => ({ id: i.id, name: i.itemName })));

  for (const [itemIdStr, optionValue] of Object.entries(answers)) {
    if (!optionValue) continue;
    const itemId = Number(itemIdStr);
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      console.warn(`[mapAnswersToCheckAnswers] itemId ${itemId} not found in checklistItems → skipped`);
      continue;
    }
    if (item.options.length === 0) {
      result.push({ itemId, selectedOptionIds: [], valueText: optionValue });
      continue;
    }
    const option = item.options.find((o) => o.optionValue === optionValue);
    if (!option) {
      console.warn(`[mapAnswersToCheckAnswers] optionValue "${optionValue}" not found in item "${item.itemName}" options:`, item.options);
      continue;
    }
    console.log(`[mapAnswersToCheckAnswers] ✓ ${item.itemName} → ${optionValue} (optionId: ${option.id})`);
    result.push({ itemId, selectedOptionIds: [option.id] });
  }

  for (const optName of building.options) {
    const item = items.find((i) => i.itemName === optName);
    if (!item) continue;
    const option = item.options.find((o) => o.optionValue === '있음');
    if (option) result.push({ itemId: item.id, selectedOptionIds: [option.id] });
  }

  console.log('[mapAnswersToCheckAnswers] result checkAnswers:', result);
  return result;
}

export function buildRoomPayload(
  basic: BasicInfoData,
  building: BuildingInfoData,
  checkAnswers: CheckAnswer[],
  custom: CustomMemoData,
) {
  return {
    name: basic.name,
    rentType: RENT_TYPE_TO_API[basic.transactionType ?? ''] ?? null,
    isManagementFeeUnknown: basic.isMgmtUnknown,
    hasLoan: basic.loanStatus === '있음' ? true : basic.loanStatus === '없음' ? false : null,
    canRegisterAddress: basic.moveInReport === '가능' ? true : basic.moveInReport === '불가능' ? false : null,
    buildingType: BUILDING_TYPE_MAP[building.buildingType ?? ''] ?? null,
    hasElevator: building.elevator === '있음' ? true : building.elevator === '없음' ? false : null,
    direction: DIRECTION_MAP[building.direction ?? ''] ?? null,
    deposit: basic.deposit ? Number(basic.deposit) : undefined,
    rent: basic.monthlyRent ? Number(basic.monthlyRent) : undefined,
    managementFee: !basic.isMgmtUnknown && basic.managementFee ? Number(basic.managementFee) : undefined,
    loanAmount: basic.loanAmount ? Number(basic.loanAmount) : undefined,
    moveInDate: basic.moveInDate || undefined,
    isMoveInDateNegotiable: basic.moveInNegotiable || null,
    floor: building.floorLevel !== '반지하' && building.floorDirect ? Number(building.floorDirect) : undefined,
    specialFloor: building.floorLevel === '반지하' ? 'SEMI_BASEMENT' : undefined,
    memo: custom.memo || undefined,
    checkAnswers,
  };
}

export { SORT_TO_API };
