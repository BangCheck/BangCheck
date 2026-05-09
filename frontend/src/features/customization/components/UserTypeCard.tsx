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
        "flex flex-col items-start p-6 rounded-[6px] border transition-all w-full bg-white drop-shadow-[0px_6px_8px_rgba(0,0,0,0.04)]",
        isSelected
          ? "bg-[#f4f7ff] border-2 border-[#0A607D]"
          : "border-[#E2E2E2] hover:border-[#BFBFBF]"
      )}
    >
      <div className={cn(
        "mb-3 transition-colors duration-200",
        isSelected ? "text-[#0A607D]" : "text-[#A0A0A0]"
      )}>
        {IconComponent && <IconComponent />}
      </div>
      <div className="space-y-1">
        <h3 className="text-[18px] font-semibold leading-tight text-[#232527]">
          {label}
        </h3>
        <p className="text-[12px] font-normal leading-[1.3] text-[#777]">
          {description}
        </p>
      </div>
    </button>
  );
};

