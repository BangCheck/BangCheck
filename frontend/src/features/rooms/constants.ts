import type { RoomType } from '@/types';

/**
 * 거래방식 / 정렬 옵션 단일 소스(SSoT).
 * 기존: RoomsPage·MapPage·basic-info 등에 배열 리터럴이 산재 → 본 파일로 통합.
 * API enum 매핑은 services/room-mappers.ts(SORT_TO_API, RENT_TYPE_TO_API)가 담당.
 */

/** 필터 칩용 거래방식(전체 포함). */
export const TRANSACTION_FILTERS = ['전체', '전세', '월세', '단기임대'] as const;
export type TransactionFilter = (typeof TRANSACTION_FILTERS)[number];

/** 입력 폼용 거래방식(전체 제외 = RoomType과 동일 집합). */
export const TRANSACTION_TYPES: readonly RoomType[] = ['전세', '월세', '단기임대'];

/** 정렬 옵션 라벨 — services/room-mappers.ts의 SORT_TO_API 키와 정합 유지. */
export const SORT_OPTIONS = [
  '보증금 낮은순',
  '월세 낮은순',
  '관리비 낮은순',
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

/** 기본 정렬 — 매직스트링 비교 제거용. */
export const DEFAULT_SORT: SortOption = '보증금 낮은순';
