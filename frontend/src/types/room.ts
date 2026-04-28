export type RoomType = '전세' | '월세' | '단기임대';

export interface RoomIssues {
  mold: boolean;
  leak: boolean;
  bug: boolean;
  etcCount: number;
}

export interface Room {
  id: string;
  name: string;
  address: string;
  type: RoomType;
  price: string;
  tags: string[];
  issues: RoomIssues;
  memo?: string;
  createdAt: string;
}
