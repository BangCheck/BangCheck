import type { RoomType } from '@/types';

export const GUEST_ROOM_LIMIT = 2;
export const ROOM_LIMIT = 6;
export const STORAGE_KEY_ONBOARDING = 'onboarding_custom_checklist';
export const SESSION_KEY_LANDING_MODAL_SHOWN = 'landing_login_modal_shown';

/**
 * 거래방식 canonical 값(SSoT) — RoomType과 동일 집합.
 * 특정 도메인 소유가 아니므로(checklist 입력폼·rooms 필터·map 칩이 공유) 도메인 중립 위치에 둔다.
 * rooms 리스트 필터('전체' 포함)·정렬은 features/rooms/constants.ts, map 전용 칩/정렬은 MapPage 소유.
 */
export const ROOM_TYPES: readonly RoomType[] = ['전세', '월세', '단기임대'];
