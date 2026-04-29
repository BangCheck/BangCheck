import React from 'react';
import { cn } from '@/lib/utils';

interface UserTypeCardProps {
  id: string;
  label: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

export const UserTypeCard: React.FC<UserTypeCardProps> = ({
  label,
  description,
  icon,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center p-6 rounded-[6px] border transition-all text-center w-full h-full bg-white",
        isSelected
          ? "border-[#0A607D] shadow-[0px_6px_8px_rgba(10,96,125,0.1)] ring-1 ring-[#0A607D]"
          : "border-[#E2E2E2] shadow-[0px_6px_8px_rgba(0,0,0,0.04)] hover:border-[#BFBFBF]"
      )}
    >
      <div className="text-[42px] mb-3 leading-none flex items-center justify-center h-[42px] w-[42px]">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className={cn(
          "text-[18px] font-semibold",
          isSelected ? "text-[#0A607D]" : "text-[#232527]"
        )}>
          {label}
        </h3>
        <p className="text-[12px] text-[#777] font-normal leading-[1.3]">
          {description}
        </p>
      </div>
    </button>
  );
};
