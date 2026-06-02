import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 만원 단위 정수를 억/천/백 단위 문자열로 변환.
 *  - >= 10000 (1억): "N억" 또는 "N억 M천"
 *  - >= 1000 (1천만): "N천" 또는 "N천 M백"
 *  - 그 외: "N,NNN만"
 *  (스펙: 22000 → "2억 2천", 10000 → "1억", 5000 → "5천")
 */
export function formatAmount(val: number): string {
  if (val <= 0) return '0';
  if (val >= 10000) {
    const uk = Math.floor(val / 10000);
    const chun = Math.floor((val % 10000) / 1000);
    return chun === 0 ? `${uk}억` : `${uk}억 ${chun}천`;
  }
  if (val >= 1000) {
    const chun = Math.floor(val / 1000);
    const baek = Math.floor((val % 1000) / 100);
    return baek === 0 ? `${chun}천` : `${chun}천 ${baek}백`;
  }
  return `${val.toLocaleString()}만`;
}

/** 생성일시 포맷터 — "YYYY.MM.DD HH:mm".
 *  RoomCard·MapPage 공통(기존 각자 보유한 동일 로직을 통합).
 *  파싱 불가한 입력은 원문 그대로 반환.
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${YYYY}.${MM}.${DD} ${HH}:${mm}`;
}

/** RoomCard·guest store 공통 포맷터 — 거래방식별 표기.
 *  전세: "전세 {dep}[/{mgmt}만]"
 *  월세/그 외: "{type} {dep}/{rent}/{mgmt|0}만"
 *  관리비가 별도(별도확인)인 경우 호출처에서 managementFee를 undefined로 전달.
 */
export function formatRoomPrice(
  type: string,
  deposit: number,
  rent: number,
  managementFee?: number,
): string {
  const dep = formatAmount(deposit);
  if (type === '전세') {
    return managementFee ? `전세 ${dep}/${managementFee}만` : `전세 ${dep}`;
  }
  return `${type} ${dep}/${formatAmount(rent)}/${managementFee ?? 0}만`;
}
