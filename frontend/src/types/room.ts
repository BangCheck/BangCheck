export type RoomType = '전세' | '월세' | '단기임대';

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
}

export interface PaginatedResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T[];
}
