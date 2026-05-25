import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 만원 단위 숫자를 억/천/백 단위 문자열로 변환.
 *  - >= 10000 (1억): "N억" 또는 "N억 M천"
 *  - >= 1000 (1천만): "N천" 또는 "N천 M백"
 *  - 그 외: "N,NNN만"
 *  (스펙: 22000 → "2억 2천", 10000 → "1억", 5000 → "5천")
 */
export function formatAmount(val: number | undefined | null): string {
  if (val === undefined || val === null || val <= 0) return '0';
  if (val >= 10000) {
    const uk = Math.floor(val / 10000);
    const chun = Math.floor((val % 10000) / 1000);
    if (chun === 0) return `${uk}억`;
    return `${uk}억 ${chun}천`;
  }
  if (val >= 1000) {
    const chun = Math.floor(val / 1000);
    const baek = Math.floor((val % 1000) / 100);
    if (baek === 0) return `${chun}천`;
    return `${chun}천 ${baek}백`;
  }
  return `${val.toLocaleString()}만`;
}
