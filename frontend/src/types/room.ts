// 하위호환 타입 (RoomCard, use-guest-room-store 등 기존 코드용)
export type RoomType = '전세' | '월세' | '단기임대';

// BE /api/v1/rooms 목록 응답 DTO
export interface RoomListItem {
  id: number;
  name: string;
  address: string;
  rentType: 'MONTHLY' | 'JEONSE' | 'SHORT_TERM';
  deposit: number;
  rent: number;
  buildingType: string;
  createdAt: string;
}

export interface RoomIssues {
  mold: boolean;
  leak: boolean;
  bug: boolean;
  condensation?: boolean;
  drainSmell?: boolean;
}

export interface Room {
  id: string;
  name: string;
  address: string;
  type: RoomType;
  deposit: number;
  rent: number;
  managementFee?: number;
  price: string;
  tags: string[];
  score: number;
  issues: RoomIssues;
  memo?: string;
  createdAt: string;
  buildingType?: string;
  floor?: string;
  direction?: string;
  // 비로그인 sessionStorage 전용: 5섹션 원본 폼 데이터 (수정 페이지 복원용)
  raw?: GuestRoomRaw;
}

export interface GuestRoomRaw {
  basic: import('@/features/checklist/components/01_basic-info').BasicInfoData;
  building: import('@/features/checklist/components/02_building-info').BuildingInfoData;
  interior: import('@/features/checklist/components/03_interior-check').InteriorCheckData;
  safety: import('@/features/checklist/components/04_safety-living').SafetyLivingData;
  custom: import('@/features/checklist/components/05_custom-memo').CustomMemoData;
}

export interface PaginatedResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T[];
}

// ── report 전용 타입 (BE room-detail.json 스펙) ──────────────────

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

export interface RoomDetail {
  id: string;
  name: string;
  address: string;
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
  buildingType?: BuildingType;
  hasElevator?: boolean;
  hasParking?: boolean;
  floor?: number;
  specialFloor?: SpecialFloor;
  direction?: DirectionType;
  options: string[];
  evaluations?: RoomEvaluations;
  customItems?: CustomItem[];
  memo?: string;
  score: number;
  createdAt: string;
}
