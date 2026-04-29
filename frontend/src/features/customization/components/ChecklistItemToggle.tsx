import React from 'react';
import { cn } from '@/lib/utils';

interface ChecklistItemToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const ChecklistItemToggle: React.FC<ChecklistItemToggleProps> = ({
  label,
  isActive,
  onToggle,
  disabled = false,
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[14px] font-bold transition-all whitespace-nowrap",
        isActive
          ? "bg-white border-[#0A607D] text-[#0A607D]"
          : "bg-white border-[#E2E2E2] text-[#A0A0A0]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "w-4 h-4 rounded-sm flex items-center justify-center border",
        isActive ? "bg-[#0A607D] border-[#0A607D]" : "bg-white border-[#E2E2E2]"
      )}>
        {isActive && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {label}
    </button>
  );
};
