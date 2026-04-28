import { api } from '@/lib/api';
import type { ApiResponse, Checklist, ChecklistInput } from '@/types';

export const listChecklists = async (): Promise<Checklist[]> => {
  const response = await api.get<ApiResponse<Checklist[]>>('/api/v1/checklists');
  return response.data.data;
};

export const getChecklist = async (id: string): Promise<Checklist> => {
  const response = await api.get<ApiResponse<Checklist>>(`/api/v1/checklists/${id}`);
  return response.data.data;
};

export const createChecklist = async (input: ChecklistInput): Promise<Checklist> => {
  const response = await api.post<ApiResponse<Checklist>>('/api/v1/checklists', input);
  return response.data.data;
};

export const updateChecklist = async (id: string, input: ChecklistInput): Promise<Checklist> => {
  const response = await api.put<ApiResponse<Checklist>>(`/api/v1/checklists/${id}`, input);
  return response.data.data;
};

export const deleteChecklist = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/checklists/${id}`);
};
