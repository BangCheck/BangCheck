import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getRooms, deleteRoom } from '@/services/room-service';

export const ROOMS_KEYS = {
  all: ['rooms'] as const,
  list: (transactionType: string, sortOption: string) =>
    ['rooms', transactionType, sortOption] as const,
};

export const useRoomsList = (transactionType: string, sortOption: string) => {
  const { isLoggedIn } = useAuthStore();
  return useInfiniteQuery({
    queryKey: ROOMS_KEYS.list(transactionType, sortOption),
    queryFn: ({ pageParam = 0 }) =>
      getRooms(pageParam, 6, transactionType, sortOption),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 6 ? allPages.length : undefined,
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
