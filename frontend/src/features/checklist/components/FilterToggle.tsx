'use client';

import { cn } from '@/lib/utils';

interface FilterToggleProps {
  isOpen: boolean;
  summary?: { rooms: number; sections: number };
  onToggle: () => void;
  className?: string;
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04a1 1 0 0 0-.79 1.61z" />
    </svg>
  );
}

function ChevronUp() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function FilterToggle({ isOpen, summary, onToggle, className }: FilterToggleProps) {
  if (summary) {
    return (
      <div
        role="button"
        onClick={onToggle}
        className={cn(
          'inline-flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] border border-[#0a607d] cursor-pointer',
          className,
        )}
      >
        <FilterIcon />
        <div className="flex items-center gap-1">
          <span className="text-[14px] font-semibold leading-[1.3] text-brand-primary whitespace-nowrap">
            방 {summary.rooms}개, 섹션 {summary.sections}
          </span>
          <ChevronDown />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] border border-[#bfbfbf] cursor-pointer bg-white',
        className,
      )}
    >
      <FilterIcon />
      <div className="flex items-center gap-1">
        <span className="text-[14px] font-semibold leading-[1.3] text-text-main whitespace-nowrap">
          {isOpen ? '설정 닫기' : '설정 열기'}
        </span>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </div>
    </button>
  );
}
