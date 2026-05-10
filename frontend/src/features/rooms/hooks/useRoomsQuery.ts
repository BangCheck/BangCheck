import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getRooms, deleteRoom, createRoomWithChecklist, getRoomDetail, updateRoomWithChecklist } from '@/services/room-service';
import type { BasicInfoData } from '@/features/checklist/components/01_basic-info';
import type { BuildingInfoData } from '@/features/checklist/components/02_building-info';
import type { InteriorCheckData } from '@/features/checklist/components/03_interior-check';
import type { CustomMemoData } from '@/features/checklist/components/05_custom-memo';

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

interface CreateRoomArgs {
  basic: BasicInfoData;
  building: BuildingInfoData;
  interior: InteriorCheckData;
  custom: CustomMemoData;
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ basic, building, interior, custom }: CreateRoomArgs) =>
      createRoomWithChecklist(basic, building, interior, custom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEYS.all });
    },
  });
};

export const useRoomDetail = (roomId: string | undefined) => {
  const { isLoggedIn } = useAuthStore();
  return useQuery({
    queryKey: ['rooms', 'detail', roomId],
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
    mutationFn: ({ roomId, basic, building, interior, custom }: UpdateRoomArgs) =>
      updateRoomWithChecklist(roomId, basic, building, interior, custom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEYS.all });
    },
  });
};
