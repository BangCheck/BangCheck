import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getRooms, deleteRoom, createRoomWithChecklist, getRoomDetail, updateRoomWithChecklist } from '@/services/room-service';
import type { BasicInfoData, BuildingInfoData, InteriorCheckData, CustomMemoData, ChecklistAnswers } from '@/types';
import type { ChecklistItemApi } from '@/services/room-mappers';
import { QUERY_KEYS } from '@/lib/query-keys';

export const useRoomsList = (transactionType?: string, sortOption?: string) => {
  const { isLoggedIn } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.rooms.list(transactionType, sortOption),
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rooms.all });
    },
  });
};

interface CreateRoomArgs {
  basic: BasicInfoData;
  building: BuildingInfoData;
  interior: InteriorCheckData;
  custom: CustomMemoData;
  answers: ChecklistAnswers;
  items: ChecklistItemApi[];
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ basic, building, interior, custom, answers, items }: CreateRoomArgs) =>
      createRoomWithChecklist(basic, building, interior, custom, answers, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rooms.all });
    },
  });
};

export const useRoomDetail = (roomId: string | undefined) => {
  const { isLoggedIn } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.rooms.detail(roomId),
    queryFn: () => getRoomDetail(roomId!),
    enabled: isLoggedIn && !!roomId,
    staleTime: 1000 * 60,
  });
};

interface UpdateRoomArgs extends CreateRoomArgs {
  roomId: string;
}

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, basic, building, interior, custom, answers, items }: UpdateRoomArgs) =>
      updateRoomWithChecklist(roomId, basic, building, interior, custom, answers, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rooms.all });
    },
  });
};
