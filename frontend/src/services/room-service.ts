import { api } from '@/lib/api';
import type { Room, RoomDetail, RoomListItem } from '@/types';

const RENT_TYPE_TO_KO: Record<string, Room['type']> = {
  MONTHLY: '월세',
  JEONSE: '전세',
  SHORT_TERM: '단기임대',
};

function mapApiRoomToRoom(item: RoomListItem): Room {
  return {
    id: String(item.id),
    name: item.name,
    address: item.address,
    type: RENT_TYPE_TO_KO[item.rentType] ?? '월세',
    deposit: item.deposit,
    rent: item.rent,
    buildingType: item.buildingType,
    price: '',
    tags: [],
    score: 0,
    issues: { mold: false, leak: false, bug: false },
    createdAt: item.createdAt,
  };
}

const RENT_TYPE_TO_API: Record<string, string> = {
  전세: 'JEONSE',
  월세: 'MONTHLY',
  단기임대: 'SHORT_TERM',
};

const SORT_TO_API: Record<string, string> = {
  '보증금 낮은순': 'DEPOSIT_ASC',
  '월세 낮은순': 'RENT_ASC',
  '관리비 낮은순': 'MANAGEMENT_FEE_ASC',
};

export const getRooms = async (rentType?: string, sort?: string): Promise<Room[]> => {
  const params: Record<string, string> = {};
  if (rentType && rentType !== '전체') params.rentType = RENT_TYPE_TO_API[rentType] ?? rentType;
  if (sort) params.sort = SORT_TO_API[sort] ?? sort;
  const response = await api.get<{ success: boolean; data: RoomListItem[] }>('/api/v1/rooms', { params });
  return response.data.data.map(mapApiRoomToRoom);
};

export const getReportRooms = async (): Promise<RoomDetail[]> => {
  const response = await api.get<{ success: boolean; data: RoomDetail[] }>('/api/v1/rooms');
  return response.data.data;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await api.delete(`/api/v1/rooms/${roomId}`);
};
