import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import * as checklistService from '@/services/checklist-service';
import { mapResponseToForm } from '@/features/checklist/mappers';
import type { ChecklistInput } from '@/types';
import { QUERY_KEYS } from '@/lib/query-keys';

export const useChecklist = (id: string) => {
  const { isLoggedIn } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.checklist.detail(id),
    queryFn: () => checklistService.getChecklist(id),
    enabled: isLoggedIn && !!id,
    select: (data) => mapResponseToForm(data),
  });
};

export const useCreateChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChecklistInput) => checklistService.createChecklist(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklist.all });
    },
  });
};

export const useUpdateChecklist = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChecklistInput) => checklistService.updateChecklist(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklist.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklist.detail(id) });
    },
  });
};

export const useDeleteChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistService.deleteChecklist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklist.all });
    },
  });
};
