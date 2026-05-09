import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getRooms, deleteRoom } from '@/services/room-service';

export const ROOMS_KEYS = {
  all: ['rooms'] as const,
  list: (rentType?: string, sort?: string) => ['rooms', 'list', rentType, sort] as const,
};

export const useRoomsList = (transactionType?: string, sortOption?: string) => {
  const { isLoggedIn } = useAuthStore();
  return useQuery({
    queryKey: ROOMS_KEYS.list(transactionType, sortOption),
    queryFn: () => getRooms(transactionType, sortOption),
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
