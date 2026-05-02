import type { RoomType } from './room';

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

export type ItemType = 'DEFAULT' | 'CUSTOM';

export type UserType = 
  | 'BUG_AVOIDER' 
  | 'NOISE_SENSITIVE' 
  | 'CLEAN_FREAK' 
  | 'PERFORMANCE_TYPE';

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
