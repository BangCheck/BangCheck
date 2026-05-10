import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 만원 단위 숫자를 억/천 단위 문자열로 변환. 1억 이상: "N억 M천", 미만: "N,NNN만" */
export function formatAmount(val: number | undefined | null): string {
  if (val === undefined || val === null) return '0';
  if (val >= 10000) {
    const uk = Math.floor(val / 10000);
    const chun = Math.floor((val % 10000) / 1000);
    if (chun === 0) return `${uk}억`;
    return `${uk}억 ${chun}천`;
  }
  return `${val.toLocaleString()}만`;
}
