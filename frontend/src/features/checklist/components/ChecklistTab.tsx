'use client';

import { cn } from '@/lib/utils';

export type ChecklistTabId =
  | '기본정보'
  | '건물정보'
  | '옵션'
  | '내부상태'
  | '문제요소'
  | '안전생활'
  | '주변환경';

interface ChecklistTabProps {
  activeTab: ChecklistTabId;
  onTabChange: (tab: ChecklistTabId) => void;
  className?: string;
}

function IconMoney() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 14.5v1h-1v-.97c-1.71-.36-3.16-1.47-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V5.5h1v1.02c1.86.45 2.79 1.86 2.85 3.38H13.4c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.02.52 4.18 1.39 4.18 3.91-.01 1.83-1.38 2.83-3.13 3.11z" />
    </svg>
  );
}

function IconHouse() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function IconSofa() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 8h-1V6c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v5c0 .55.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h12v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1v-5c0-1.1-.9-2-2-2zM7 6h10v2H7V6zm13 9H4v-3h1c.55 0 1 .45 1 1h8c0-.55.45-1 1-1h1v3z" />
    </svg>
  );
}

function IconGraph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );
}

function IconTrain() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zM11 11H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 11h-5V6h5v5z" />
    </svg>
  );
}

const TABS: { id: ChecklistTabId; label: string; Icon: () => JSX.Element }[] = [
  { id: '기본정보', label: '기본 정보', Icon: IconMoney },
  { id: '건물정보', label: '건물 정보', Icon: IconHouse },
  { id: '옵션', label: '옵션', Icon: IconSofa },
  { id: '내부상태', label: '내부 상태', Icon: IconGraph },
  { id: '문제요소', label: '문제 요소', Icon: IconWarning },
  { id: '안전생활', label: '안전/생활', Icon: IconLock },
  { id: '주변환경', label: '주변 환경', Icon: IconTrain },
];

export function ChecklistTab({ activeTab, onTabChange, className }: ChecklistTabProps) {
  return (
    <div className={cn('flex border-b border-[#e2e2e2] overflow-x-auto', className)}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 px-4 py-3 whitespace-nowrap transition-colors min-w-fit',
              isActive
                ? 'border-b-2 border-[#232527]'
                : 'border-b-2 border-transparent hover:text-text-main',
            )}
          >
            <span className={cn('transition-colors', isActive ? 'text-text-main' : 'text-text-caption')}>
              <Icon />
            </span>
            <span
              className={cn(
                'text-[16px] font-bold leading-[1.3]',
                isActive ? 'text-text-main' : 'text-text-caption',
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
