import { api } from '@/lib/api';
import type { WalkingDirectionsParams, WalkingDirectionsResponse } from '@/types/directions';

export const getWalkingDirections = async (
  params: WalkingDirectionsParams
): Promise<WalkingDirectionsResponse> => {
  const response = await api.get<WalkingDirectionsResponse>('/api/v1/directions/walking', {
    params: {
      startLat: params.startLat,
      startLng: params.startLng,
      goalLat: params.goalLat,
      goalLng: params.goalLng,
    },
  });
  return response.data;
};
