import React from 'react';
import { cn } from '@/lib/utils';

interface ChecklistItemToggleProps {
  label: string;
  icon?: string | React.ReactNode;
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const ChecklistItemToggle: React.FC<ChecklistItemToggleProps> = ({
  label,
  icon,
  isActive,
  onToggle,
  disabled = false,
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-[6px] border-2 transition-all w-full text-left drop-shadow-[0px_6px_8px_rgba(0,0,0,0.04)]',
        isActive
          ? 'bg-slot-b-bg border-brand-primary'
          : 'bg-white border-border-light hover:border-border-mute',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {icon && (
        <div className="flex items-center justify-center shrink-0 w-7 h-7 text-[18px]">
          {icon}
        </div>
      )}
      <span className="text-fluid-base font-semibold text-text-main leading-[1.3]">
        {label}
      </span>
    </button>
  );
};
