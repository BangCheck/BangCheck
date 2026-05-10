import { api } from '@/lib/api';
import type { ChecklistItemResponse } from '@/types';

export const getCustomizedItems = async (): Promise<ChecklistItemResponse[]> => {
  console.groupCollapsed('[GET] /api/checklist/items — 요청');
  console.log('called at:', new Date().toISOString());
  console.groupEnd();

  const response = await api.get<ChecklistItemResponse[]>('/api/checklist/items');

  console.groupCollapsed(`[GET] /api/checklist/items — 응답 (${response.data.length}건)`);
  console.table(
    response.data.map((i) => ({
      id: i.id,
      itemName: i.itemName,
      category: i.category,
      itemType: i.itemType,
      userType: i.userType,
      inputType: i.inputType,
      isEnabled: i.isEnabled,
      optionCount: i.options?.length ?? 0,
    }))
  );
  console.log('raw response.data:', response.data);
  console.groupEnd();

  return response.data;
};

export const getAllItemsForSettings = async (): Promise<ChecklistItemResponse[]> => {
  const response = await api.get<ChecklistItemResponse[]>('/api/checklist/items/all');
  return response.data;
};

export const selectUserType = async (userType: string): Promise<void> => {
  console.log('[POST] /api/checklist/types/' + userType);
  await api.post(`/api/checklist/types/${userType}`);
};

export const deselectUserType = async (userType: string): Promise<void> => {
  console.log('[DELETE] /api/checklist/types/' + userType);
  await api.delete(`/api/checklist/types/${userType}`);
};

export const saveSettings = async (disabledItemIds: number[]): Promise<void> => {
  console.groupCollapsed(`[POST] /api/checklist/items/settings — 송신 (disabled ${disabledItemIds.length}건)`);
  console.log('disabledItemIds:', disabledItemIds);
  console.log('payload:', { disabledItemIds });
  console.groupEnd();
  await api.post('/api/checklist/items/settings', { disabledItemIds });
  console.log('[POST] /api/checklist/items/settings — 응답 OK');
};

export const addCustomItem = async (itemName: string): Promise<void> => {
  console.log('[POST] /api/checklist/items/custom — payload:', { itemName });
  await api.post('/api/checklist/items/custom', { itemName });
};

export const deleteCustomItem = async (customItemId: number): Promise<void> => {
  console.log('[DELETE] /api/checklist/items/custom/' + customItemId);
  await api.delete(`/api/checklist/items/custom/${customItemId}`);
};
