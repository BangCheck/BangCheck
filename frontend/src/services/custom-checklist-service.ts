import { api } from '@/lib/api';
import type { ChecklistItemResponse, UserType } from '@/types';

export const getCustomizedItems = async (): Promise<ChecklistItemResponse[]> => {
  const response = await api.get<ChecklistItemResponse[]>('/api/v1/checklist/items');
  return response.data;
};

export const selectUserType = async (userType: string): Promise<void> => {
  await api.post(`/api/v1/checklist/types/${userType}`);
};

export const deselectUserType = async (userType: string): Promise<void> => {
  await api.delete(`/api/v1/checklist/types/${userType}`);
};

export const toggleItem = async (itemId: number): Promise<void> => {
  await api.patch(`/api/v1/checklist/items/${itemId}/toggle`);
};

export const addCustomItem = async (itemName: string): Promise<ChecklistItemResponse> => {
  const response = await api.post<ChecklistItemResponse>('/api/v1/checklist/items/custom', { itemName });
  return response.data;
};

export const deleteCustomItem = async (customItemId: number): Promise<void> => {
  await api.delete(`/api/v1/checklist/items/custom/${customItemId}`);
};
