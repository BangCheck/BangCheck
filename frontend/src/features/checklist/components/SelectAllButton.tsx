'use client';

import { cn } from '@/lib/utils';

interface SelectAllButtonProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

function CheckboxEmpty() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="16" height="16" rx="3" stroke="#BFBFBF" strokeWidth="1.5" />
    </svg>
  );
}

function CheckboxFilled() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="4" fill="#0A607D" />
      <path d="M4 9L7.5 12.5L14 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SelectAllButton({ checked = false, onChange, className }: SelectAllButtonProps) {
  return (
    <div
      role="button"
      onClick={() => onChange?.(!checked)}
      className={cn(
        'inline-flex items-center gap-2.5 h-8 px-4 py-2 rounded-[4px] border cursor-pointer select-none',
        checked ? 'border-[#232527]' : 'border-[#e2e2e2]',
        className,
      )}
    >
      {checked ? <CheckboxFilled /> : <CheckboxEmpty />}
      <span className="text-[12px] font-semibold leading-[1.3] text-text-main whitespace-nowrap">
        전체선택
      </span>
    </div>
  );
}
