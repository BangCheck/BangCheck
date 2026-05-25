import { api } from '@/lib/api';

export interface AddressResult {
  roadAddr: string;
  jibunAddr: string;
  zipNo: string;
}

export const searchAddress = async (keyword: string): Promise<AddressResult[]> => {
  if (!keyword.trim()) return [];
  const response = await api.get<{ success: boolean; data: AddressResult[] }>(
    '/api/v1/address/search',
    { params: { keyword } },
  );
  return response.data.data;
};
