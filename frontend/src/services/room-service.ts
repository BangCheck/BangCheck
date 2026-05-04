import { api } from '@/lib/api';
import type { Room, RoomDetail, ApiResponse, RoomType } from '@/types';

const TRANSACTION_TYPE_MAP: Record<string, RoomType> = {
  '전세': '전세',
  '월세': '월세',
  '단기임대': '단기임대',
};

const SORT_MAP: Record<string, string> = {
  '보증금 낮은순': 'deposit,asc',
  '월세 낮은순': 'rent,asc',
  '관리비 낮은순': 'managementFee,asc',
};

export const getRooms = async (
  page: number = 0,
  size: number = 6,
  transactionTypeLabel?: string,
  sortLabel?: string
): Promise<Room[]> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (transactionTypeLabel && transactionTypeLabel !== '전체') {
    params.append('type', TRANSACTION_TYPE_MAP[transactionTypeLabel] ?? transactionTypeLabel);
  }
  const sort = sortLabel ? SORT_MAP[sortLabel] : undefined;
  if (sort) params.append('sort', sort);
  const response = await api.get<ApiResponse<Room[]>>(`/api/v1/rooms?${params}`);
  return response.data.data;
};

export const getReportRooms = async (): Promise<RoomDetail[]> => {
  const response = await api.get<ApiResponse<RoomDetail[]>>('/api/v1/rooms');
  return response.data.data;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await api.delete(`/api/v1/rooms/${roomId}`);
};
