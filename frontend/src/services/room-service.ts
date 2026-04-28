import { api } from '@/lib/api';
import type { Room, ApiResponse } from '@/types';

export const getRooms = async (): Promise<Room[]> => {
  const response = await api.get<ApiResponse<Room[]>>('/api/v1/rooms');
  return response.data.data;
};
