// BE API 응답 기준 타입 (room-detail.json 스펙)

// 하위호환 — checklist.ts 등에서 사용
export type RoomType = '전세' | '월세' | '단기임대';

export type TransactionType = 'JEONSE' | 'MONTHLY' | 'SHORT_TERM';
export type BuildingType = 'VILLA' | 'OFFICETEL' | 'ONE_ROOM' | 'TWO_ROOM';
export type SpecialFloor = 'SEMI_BASEMENT' | 'ROOFTOP';
export type DirectionType = 'SOUTH' | 'EAST' | 'WEST' | 'NORTH' | 'UNKNOWN';
export type ConditionLevel = 'GOOD' | 'NORMAL' | 'BAD';
export type ProblemLevel = 'NONE' | 'SLIGHT' | 'SEVERE';
export type ExistStatus = 'EXIST' | 'NONE';
export type BrightnessLevel = 'BRIGHT' | 'NORMAL' | 'DARK';
export type NoiseLevelType = 'QUIET' | 'NORMAL' | 'NOISY';

export interface RoomEvaluations {
  sunlight?: ConditionLevel;
  ventilation?: ConditionLevel;
  waterPressure?: ConditionLevel;
  soundproof?: ConditionLevel;
  mold?: ProblemLevel;
  leak?: ProblemLevel;
  bug?: ProblemLevel;
  cctv?: ExistStatus;
  nightSafety?: BrightnessLevel;
  noiseLevel?: NoiseLevelType;
}

export interface CustomItem {
  name: string;
  value: string;
}

export interface Room {
  id: string;
  name: string;
  address: string;

  // 기본 정보
  transactionType: TransactionType;
  deposit: number;
  rent: number;
  managementFee?: number;
  isManagementFeeUnknown?: boolean;
  hasLoan: boolean;
  loanAmount?: number;
  canRegisterAddress?: boolean;
  moveInDate?: string;
  isMoveInDateNegotiable?: boolean;

  // 건물 정보
  buildingType?: BuildingType;
  hasElevator?: boolean;
  hasParking?: boolean;
  floor?: number;
  specialFloor?: SpecialFloor;
  direction?: DirectionType;

  // 옵션
  options: string[];

  // 상세 평가
  evaluations?: RoomEvaluations;

  // 나만의 항목
  customItems?: CustomItem[];

  memo?: string;
  score: number;
  createdAt: string;

  // 하위호환 (홈 카드 등 기존 사용처)
  price: string;
  tags: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T[];
}
