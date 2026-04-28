import type { RoomType } from './room';

export type LoanStatus = '없음' | '있음';
export type ElevatorStatus = '없음' | '있음';
export type ParkingStatus = '없음' | '있음';
export type Direction = '남' | '동' | '서' | '북';
export type ScoreLevel = '좋음' | '보통' | '나쁨';
export type ProblemFlag = '없음' | '있음';

export interface Checklist {
  id?: string;
  name: string;
  address?: string;
  type: RoomType;
  deposit?: string;
  rent?: string;
  managementFee?: string;
  hasLoan: LoanStatus;
  moveInDate?: string;
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
