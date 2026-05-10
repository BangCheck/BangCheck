import { api } from '@/lib/api';
import type { ChecklistItemResponse } from '@/types';

export const getCustomizedItems = async (): Promise<ChecklistItemResponse[]> => {
  const response = await api.get<ChecklistItemResponse[]>('/api/checklist/items');
  return response.data;
};

export const selectUserType = async (userType: string): Promise<void> => {
  await api.post(`/api/checklist/types/${userType}`);
};

export const deselectUserType = async (userType: string): Promise<void> => {
  await api.delete(`/api/checklist/types/${userType}`);
};

export const saveSettings = async (disabledItemIds: number[]): Promise<void> => {
  await api.post('/api/checklist/items/settings', { disabledItemIds });
};

export const addCustomItem = async (itemName: string): Promise<void> => {
  await api.post('/api/checklist/items/custom', { itemName });
};

export const deleteCustomItem = async (customItemId: number): Promise<void> => {
  await api.delete(`/api/checklist/items/custom/${customItemId}`);
};
