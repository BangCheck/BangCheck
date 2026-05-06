import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getRooms, deleteRoom } from '@/services/room-service';

export const ROOMS_KEYS = {
  all: ['rooms'] as const,
  list: () => ['rooms', 'list'] as const,
};

export const useRoomsList = (_transactionType?: string, _sortOption?: string) => {
  const { isLoggedIn } = useAuthStore();
  return useQuery({
    queryKey: ROOMS_KEYS.list(),
    queryFn: getRooms,
    enabled: isLoggedIn,
    staleTime: 1000 * 60,
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEYS.all });
    },
  });
};
