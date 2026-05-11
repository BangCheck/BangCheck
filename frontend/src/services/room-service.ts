import { api } from '@/lib/api';
import type { Room, RoomDetail, RoomListItem, BasicInfoData, BuildingInfoData, InteriorCheckData, CustomMemoData, RoomFormState, ChecklistAnswers } from '@/types';
import {
  mapApiRoomToRoom,
  mapApiToForms,
  buildRoomPayload,
  mapAnswersToCheckAnswers,
  SORT_TO_API,
  RENT_TYPE_TO_API,
} from './room-mappers';
import type { ChecklistItemApi, RoomDetailApi } from './room-mappers';

export type { RoomFormState };

export const getRooms = async (rentType?: string, sort?: string): Promise<Room[]> => {
  const params: Record<string, string> = {};
  if (rentType && rentType !== '전체') params.rentType = RENT_TYPE_TO_API[rentType] ?? rentType;
  if (sort) params.sort = SORT_TO_API[sort] ?? sort;
  const response = await api.get<{ success: boolean; data: RoomListItem[] }>('/api/v1/rooms', { params });
  return response.data.data.map(mapApiRoomToRoom);
};

export const getReportRooms = async (): Promise<RoomDetail[]> => {
  const response = await api.get<{ success: boolean; data: RoomDetail[] }>('/api/v1/rooms');
  return response.data.data;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await api.delete(`/api/v1/rooms/${roomId}`);
};

export const getRoomDetail = async (roomId: string): Promise<RoomFormState> => {
  const res = await api.get<{ data: RoomDetailApi }>(`/api/v1/rooms/${roomId}`);
  return mapApiToForms(res.data.data);
};

export const createRoomWithChecklist = async (
  basic: BasicInfoData,
  building: BuildingInfoData,
  _interior: InteriorCheckData,
  custom: CustomMemoData,
  answers: ChecklistAnswers,
  items: ChecklistItemApi[],
): Promise<void> => {
  const checkAnswers = mapAnswersToCheckAnswers(answers, building, items);

  await api.post('/api/v1/rooms/check-results', {
    address: basic.address,
    ...buildRoomPayload(basic, building, checkAnswers, custom),
  });
};

export const updateRoomWithChecklist = async (
  roomId: string,
  basic: BasicInfoData,
  building: BuildingInfoData,
  _interior: InteriorCheckData,
  custom: CustomMemoData,
  answers: ChecklistAnswers,
  items: ChecklistItemApi[],
): Promise<void> => {
  const checkAnswers = mapAnswersToCheckAnswers(answers, building, items);

  await api.put(`/api/v1/rooms/${roomId}`, {
    address: basic.address,
    ...buildRoomPayload(basic, building, checkAnswers, custom),
  });
};
