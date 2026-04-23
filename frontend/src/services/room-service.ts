import { api } from '@/lib/api';

export interface Room {
  id: string;
  name: string;
  address: string;
  type: '전세' | '월세';
  price: string; // 예: "4,000/65/8만원"
  tags: string[]; // 예: ["원룸", "중층", "남향"]
  issues: {
    mold: boolean;
    leak: boolean;
    bug: boolean;
    etcCount: number;
  };
  memo?: string;
  createdAt: string;
}

export const getRooms = async (): Promise<Room[]> => {
  const response = await api.get('/api/v1/rooms');
  return response.data.data; // 백엔드 ApiResponse 구조에 맞춤
};
