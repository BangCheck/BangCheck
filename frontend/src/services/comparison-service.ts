import { api } from '@/lib/api';
import type { ApiResponse, Room, RoomDetail } from '@/types';

export const getComparison = async (roomIds: string[]): Promise<Room[]> => {
  const response = await api.get<ApiResponse<Room[]>>('/api/v1/rooms/compare', {
    params: { ids: roomIds.join(',') },
  });
  return response.data.data;
};

// P-1: 로그인 사용자의 방 목록 + 기본 정보 조회
// 연동 조건: E09-S10 (Refresh token + Axios 인터셉터) 완료 후 활성화
export const getReportInfo = async (): Promise<RoomDetail[]> => {
  const response = await api.get<ApiResponse<RoomDetail[]>>('/api/v1/report/info');
  return response.data.data;
};

// P-2: 선택한 방 ID 목록으로 비교 리포트 생성
// 연동 조건: E09-S10 완료 + BE CORS 화이트리스트 머지 후 활성화
export const postReportCompare = async (roomIds: string[]): Promise<RoomDetail[]> => {
  const response = await api.post<ApiResponse<RoomDetail[]>>('/api/v1/report/compare', { roomIds });
  return response.data.data;
};
