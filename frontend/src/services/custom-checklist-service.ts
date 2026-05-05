import { api } from '@/lib/api';
import type { ChecklistItemResponse, UserType } from '@/types';

// TODO(be): ApiResponse wrapper 검증 필요
// 다른 서비스는 api.get<ApiResponse<T>>(...).data.data 패턴을 사용하지만
// 이 엔드포인트가 ApiResponse wrapper를 반환하는지 실제 응답 구조 확인 후
// 필요하면 api.get<ApiResponse<ChecklistItemResponse[]>>(...).data.data 로 변경
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
