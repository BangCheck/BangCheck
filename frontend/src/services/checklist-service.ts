import { api } from '@/lib/api';
import type { ApiResponse, Checklist, ChecklistInput } from '@/types';
import { mapInputToRequest } from '@/features/checklist/mappers';

export const listChecklists = async (): Promise<Checklist[]> => {
  const response = await api.get<ApiResponse<Checklist[]>>('/api/v1/rooms');
  return response.data.data;
};

export const getChecklist = async (id: string): Promise<Checklist> => {
  const response = await api.get<ApiResponse<Checklist>>(`/api/v1/rooms/${id}`);
  return response.data.data;
};

export const createChecklist = async (input: ChecklistInput): Promise<Checklist> => {
  const response = await api.post<ApiResponse<Checklist>>('/api/v1/rooms', mapInputToRequest(input));
  return response.data.data;
};

export const updateChecklist = async (id: string, input: ChecklistInput): Promise<Checklist> => {
  const response = await api.put<ApiResponse<Checklist>>(`/api/v1/rooms/${id}`, mapInputToRequest(input));
  return response.data.data;
};

export const deleteChecklist = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/rooms/${id}`);
};
