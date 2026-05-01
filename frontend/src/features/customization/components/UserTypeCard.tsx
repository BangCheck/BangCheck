import React from 'react';
import { cn } from '@/lib/utils';
import { 
  IconTypeBug, 
  IconTypeMoon, 
  IconTypeSun, 
  IconTypeMute, 
  IconTypeHouse, 
  IconTypeLightning 
} from './Icons';

interface UserTypeCardProps {
  id: string;
  label: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

const IconMap: Record<string, React.FC<{ className?: string }>> = {
  bug: IconTypeBug,
  moon: IconTypeMoon,
  sun: IconTypeSun,
  mute: IconTypeMute,
  house: IconTypeHouse,
  lightning: IconTypeLightning,
};

export const UserTypeCard: React.FC<UserTypeCardProps> = ({
  label,
  description,
  icon,
  isSelected,
  onClick,
}) => {
  const IconComponent = IconMap[icon];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center p-6 rounded-[12px] border transition-all text-center w-full h-[180px] justify-center bg-white",
        isSelected
          ? "border-[#0A607D] shadow-[0px_8px_16px_rgba(10,96,125,0.12)] ring-1 ring-[#0A607D]"
          : "border-[#E2E2E2] shadow-[0px_4px_12px_rgba(0,0,0,0.03)] hover:border-[#BFBFBF] hover:shadow-[0px_6px_16px_rgba(0,0,0,0.06)]"
      )}
    >
      <div className={cn(
        "mb-5 flex items-center justify-center h-[50px] w-full transition-colors duration-200",
        isSelected ? "text-[#0A607D]" : "text-[#E2E2E2]"
      )}>
        {IconComponent && <IconComponent />}
      </div>
      <div className="space-y-1.5">
        <h3 className={cn(
          "text-[18px] font-bold leading-tight",
          isSelected ? "text-[#0A607D]" : "text-[#232527]"
        )}>
          {label}
        </h3>
        <p className={cn(
          "text-[13px] font-medium leading-[1.4] max-w-[140px] mx-auto",
          isSelected ? "text-[#0A607D]/80" : "text-[#777]"
        )}>
          {description}
        </p>
      </div>
    </button>
  );
};

