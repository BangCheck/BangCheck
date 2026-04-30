import { api } from '@/lib/api';
import type { Room, RoomDetail, ApiResponse } from '@/types';

export const getRooms = async (page: number = 0, size: number = 6): Promise<Room[]> => {
  const response = await api.get<ApiResponse<Room[]>>(`/api/v1/rooms?page=${page}&size=${size}`);
  return response.data.data;
};

export const getRoomDetails = async (): Promise<RoomDetail[]> => {
  const response = await api.get<ApiResponse<RoomDetail[]>>('/api/v1/rooms/detail');
  return response.data.data;
};
