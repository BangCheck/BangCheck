import { ROOM_TYPES } from '@/lib/constants';
import type { RoomType, SortOption } from '@/types';

/**
 * rooms 리스트(RoomsPage) 전용 필터·정렬 옵션.
 * - 거래방식 canonical 값은 도메인 중립 SSoT인 @/lib/constants(ROOM_TYPES). 여기서는 '전체'를 얹어 필터 칩용으로만 확장한다.
 * - 정렬 라벨↔API enum은 services/room-mappers.ts의 SORT_TO_API(Record<SortOption, RoomSort>)가 컴파일 타임에 강제한다.
 * - MapPage는 거리순 등 map 전용 정렬·단축 라벨('단기')을 별도로 소유한다(여기로 통합하지 않는다).
 */

/** 필터 칩용 거래방식('전체' + ROOM_TYPES). */
export const TRANSACTION_FILTERS: readonly (RoomType | '전체')[] = ['전체', ...ROOM_TYPES];
export type TransactionFilter = RoomType | '전체';

/** 정렬 옵션 라벨 — 타입은 @/types의 SortOption(= SORT_TO_API 키 집합)에 고정. */
export const SORT_OPTIONS: readonly SortOption[] = [
  '보증금 낮은순',
  '월세 낮은순',
  '관리비 낮은순',
];

/** 기본 정렬 — 매직스트링 비교 제거용. */
export const DEFAULT_SORT: SortOption = '보증금 낮은순';
