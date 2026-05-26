import { useQuery } from '@tanstack/react-query';
import { getWalkingDirections } from '@/services/directions-service';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { WalkingDirectionsParams } from '@/types/directions';

export const useWalkingDirections = (params: WalkingDirectionsParams | null) => {
  return useQuery({
    queryKey: params
      ? QUERY_KEYS.directions.walking(params.startLat, params.startLng, params.goalLat, params.goalLng)
      : ['directions', 'walking', 'disabled'],
    queryFn: () => getWalkingDirections(params!),
    enabled: params !== null,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export function formatWalkingDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) return `${distanceMeters}m`;
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

export function formatWalkingDuration(durationMs: number): string {
  const minutes = Math.round(durationMs / 1000 / 60);
  if (minutes < 60) return `도보 ${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return remainMinutes > 0 ? `도보 ${hours}시간 ${remainMinutes}분` : `도보 ${hours}시간`;
}
