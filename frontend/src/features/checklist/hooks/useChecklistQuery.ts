import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import * as checklistService from '@/services/checklist-service';
import { mapResponseToForm } from '@/features/checklist/mappers';
import type { ChecklistInput } from '@/types';

export const CHECKLIST_KEYS = {
  all: ['checklists'] as const,
  detail: (id: string) => ['checklists', id] as const,
};

export const useChecklist = (id: string) => {
  const { isLoggedIn } = useAuthStore();
  return useQuery({
    queryKey: CHECKLIST_KEYS.detail(id),
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
      queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.all });
    },
  });
};

export const useUpdateChecklist = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChecklistInput) => checklistService.updateChecklist(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.detail(id) });
    },
  });
};

export const useDeleteChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistService.deleteChecklist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHECKLIST_KEYS.all });
    },
  });
};
