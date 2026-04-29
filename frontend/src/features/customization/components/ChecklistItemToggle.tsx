import React from 'react';
import { cn } from '@/lib/utils';
import { IconCheck } from './Icons';

interface ChecklistItemToggleProps {
  label: string;
  icon: string | React.ReactNode;
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
        "flex items-center gap-3.5 px-5 py-4 rounded-[10px] border transition-all w-full text-left group",
        isActive
          ? "bg-white border-[#0A607D] text-[#0A607D] shadow-[0px_4px_12px_rgba(10,96,125,0.08)] ring-[0.5px] ring-[#0A607D]"
          : "bg-white border-[#E2E2E2] text-[#232527] hover:border-[#BFBFBF] hover:shadow-[0px_2px_8px_rgba(0,0,0,0.04)]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "text-[22px] flex items-center justify-center transition-all",
        !isActive && "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[15px] font-bold transition-colors",
        !isActive && "text-[#A0A0A0]"
      )}>
        {label}
      </span>
      {isActive && (
        <div className="ml-auto flex items-center justify-center w-5 h-5 rounded-md bg-[#0A607D] animate-in zoom-in-50 duration-200">
          <IconCheck className="w-3 h-3" />
        </div>
      )}
    </button>
  );
};

