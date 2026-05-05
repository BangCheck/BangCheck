import { api } from '@/lib/api';
import type { ApiResponse, Checklist, ChecklistInput } from '@/types';

// 숫자만 추출하여 정수로 변환하는 헬퍼 함수 (빈 값이나 에러 시 default 반환)
const parseSafeInt = (val: string | undefined, defaultValue: number | null = 0): number | null => {
  if (!val) return defaultValue;
  const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// 날짜 형식을 YYYY-MM-DD로 통일하거나 null 반환
const sanitizeDate = (dateStr: string | undefined): string | null => {
  if (!dateStr) return null;
  // 숫자만 추출
  const digits = dateStr.replace(/[^0-9]/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return dateStr.includes('-') ? dateStr : null;
};

// 백엔드 엔티티와 필드명을 맞추기 위한 매핑 함수
const mapChecklistToRoomRequest = (input: ChecklistInput) => {
  const payload = {
    name: input.name || '이름 없음',
    address: input.address || '',
    rentType: input.type === '전세' ? 'JEONSE' : 'MONTHLY',
    deposit: parseSafeInt(input.deposit, 0),
    monthlyRent: parseSafeInt(input.rent, 0),
    maintenanceStatus: input.managementFee ? 'INCLUDED' : 'NONE',
    maintenanceFee: parseSafeInt(input.managementFee, 0),
    hasLoan: input.hasLoan === '있음',
    loanAmount: 0,
    canRegisterAddress: true,
    availableFrom: sanitizeDate(input.moveInDate),
    buildingType: 'ONE_ROOM',
    floor: parseSafeInt(input.floor, null),
    hasElevator: input.hasElevator === '있음',
    direction: input.direction === '남' ? 'SOUTH' : 
               input.direction === '동' ? 'EAST' : 
               input.direction === '서' ? 'WEST' : 'NORTH',
    memo: input.memo || '',
    
// 상세 점검 항목 (기본값 2: 보통)
    lighting: input.scores['채광'] === '좋음' ? 3 : (input.scores['채광'] === '보통' ? 2 : (input.scores['채광'] === '나쁨' ? 1 : 2)),
    noiseLevel: input.scores['방음'] === '좋음' ? 3 : (input.scores['방음'] === '보통' ? 2 : (input.scores['방음'] === '나쁨' ? 1 : 2)),
    waterPressure: input.scores['수압'] === '좋음' ? 3 : (input.scores['수압'] === '보통' ? 2 : (input.scores['수압'] === '나쁨' ? 1 : 2)),
    soundproof: input.scores['결로/곰팡이'] === '좋음' ? 3 : (input.scores['결로/곰팡이'] === '보통' ? 2 : (input.scores['결로/곰팡이'] === '나쁨' ? 1 : 2)),
    
    // 문제 요소
    hasMold: input.problems['곰팡이'] === '있음',
    hasLeak: input.problems['누수'] === '있음',
    hasBug: input.problems['벌레'] === '있음',
  };

  return payload;
};

export const listChecklists = async (): Promise<Checklist[]> => {
  const response = await api.get<ApiResponse<Checklist[]>>('/api/v1/rooms');
  return response.data.data;
};

export const getChecklist = async (id: string): Promise<Checklist> => {
  const response = await api.get<ApiResponse<Checklist>>(`/api/v1/rooms/${id}`);
  return response.data.data;
};

export const createChecklist = async (input: ChecklistInput): Promise<Checklist> => {
  const mappedData = mapChecklistToRoomRequest(input);
  const response = await api.post<ApiResponse<Checklist>>('/api/v1/rooms', mappedData);
  return response.data.data;
};

export const updateChecklist = async (id: string, input: ChecklistInput): Promise<Checklist> => {
  const mappedData = mapChecklistToRoomRequest(input);
  const response = await api.put<ApiResponse<Checklist>>(`/api/v1/rooms/${id}`, mappedData);
  return response.data.data;
};

export const deleteChecklist = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/rooms/${id}`);
};
