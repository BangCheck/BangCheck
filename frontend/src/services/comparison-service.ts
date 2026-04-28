import { api } from '@/lib/api';
import type { ApiResponse, Room } from '@/types';

export const getComparison = async (roomIds: string[]): Promise<Room[]> => {
  const response = await api.get<ApiResponse<Room[]>>('/api/v1/rooms/compare', {
    params: { ids: roomIds.join(',') },
  });
  return response.data.data;
};
