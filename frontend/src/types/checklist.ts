import type { RoomType } from './room';

// ── Form data shapes (shared between checklist components and service layer) ──

export type Rating = '좋음' | '보통' | '나쁨' | null;
export type YesNo = '있음' | '없음' | null;

export interface BasicInfoData {
  name: string;
  address: string;
  transactionType: string | null;
  deposit: string;
  monthlyRent: string;
  managementFee: string;
  includeMgmtInRent: boolean;
  isMgmtUnknown: boolean;
  loanStatus: '있음' | '없음' | null;
  loanAmount: string;
  moveInReport: '가능' | '불가능' | null;
  moveInDate: string;
  moveInNegotiable: boolean;
}

export interface BuildingInfoData {
  buildingType: string | null;
  elevator: '있음' | '없음' | null;
  floorLevel: string | null;
  floorDirect: string;
  direction: string | null;
  options: string[];
}

export interface InteriorCheckData {
  lighting: Rating;
  ventilation: Rating;
  floorNoise: Rating;
  waterPressure: Rating;
  soundProof: Rating;
  heating: Rating;
  mold: YesNo;
  pest: YesNo;
  leak: YesNo;
  wallpaper: YesNo;
  drainSmell: YesNo;
}

export interface SafetyLivingData {
  doorLock: Rating;
  windowLock: Rating;
  cctv: Rating;
  fireSafety: Rating;
  hallLight: Rating;
  securityState: Rating;
  windowScreen: Rating;
  laundry: Rating;
  trash: Rating;
  bikeParking: YesNo;
  internet: YesNo;
  surroundNoise: Rating;
  amenity: Rating;
  transit: Rating;
  nightSafety: Rating;
}

export interface CustomMemoData {
  customItems: { label: string; value: string }[];
  memo: string;
}

// Dynamic checklist answers keyed by itemId → selected optionValue
export type ChecklistAnswers = Record<number, string | null>;

export interface RoomFormState {
  basic: BasicInfoData;
  building: BuildingInfoData;
  interior: InteriorCheckData;
  custom: CustomMemoData;
  answers?: ChecklistAnswers;
}

// ── Legacy domain types ──

export type LoanStatus = '없음' | '있음';
export type ElevatorStatus = '없음' | '있음';
export type ParkingStatus = '없음' | '있음';
export type Direction = '남' | '동' | '서' | '북';
export type ScoreLevel = '좋음' | '보통' | '나쁨';
export type ProblemFlag = '없음' | '있음';
export type MoveInReportStatus = '가능' | '불가능';

export type ChecklistCategory = 
  | 'BASIC_INFO' 
  | 'BUILDING_INFO' 
  | 'OPTION' 
  | 'INTERNAL_STATE' 
  | 'PROBLEM' 
  | 'SAFETY' 
  | 'CONVENIENCE' 
  | 'ENVIRONMENT'
  | 'CUSTOM';

export type ItemType = 'DEFAULT' | 'CUSTOM' | 'USER_TYPE';

export type UserType =
  | 'BUG_AVOIDER'
  | 'NOISE_SENSITIVE'
  | 'CLEAN_FREAK'
  | 'PERFORMANCE_TYPE'
  | 'FIRST_TIMER'
  | 'ESSENTIALS_ONLY';

export type InputType = 
  | 'TEXT' 
  | 'NUMBER' 
  | 'SINGLE_CHOICE' 
  | 'MULTIPLE_CHOICE' 
  | 'DATE' 
  | 'BOOLEAN';

export interface ChecklistOptionResponse {
  id: number;
  optionValue: string;
  displayOrder: number;
}

export interface ChecklistItemResponse {
  id: number;
  itemName: string;
  category: ChecklistCategory;
  itemType: ItemType;
  userType: UserType;
  inputType: InputType;
  description: string;
  displayOrder: number;
  isEnabled: boolean;
  options: ChecklistOptionResponse[];
}

export interface Checklist {
  id?: string;
  name: string;
  address?: string;
  type: RoomType;
  deposit?: string;
  rent?: string;
  managementFee?: string;
  isManagementFeeUnknown?: boolean;
  hasLoan: LoanStatus;
  loanAmount?: string;
  moveInReport: MoveInReportStatus;
  moveInDate?: string;
  isMoveInDateNegotiable?: boolean;
  buildingType?: string;
  hasElevator: ElevatorStatus;
  hasParking: ParkingStatus;
  floor?: string;
  direction: Direction;
  options: string[];
  scores: Record<string, ScoreLevel>;
  problems: Record<string, ProblemFlag>;
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ChecklistInput = Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>;
