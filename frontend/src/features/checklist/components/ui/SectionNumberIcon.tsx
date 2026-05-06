import { cn } from '@/lib/utils';

interface SectionNumberIconProps {
  number: number;
  className?: string;
}

export default function SectionNumberIcon({ number, className }: SectionNumberIconProps) {
  return (
    <div
      className={cn(
        'w-6 h-6 rounded-[4px] bg-[#232527] flex items-center justify-center shrink-0',
        className
      )}
    >
      <span className="text-white text-[12px] font-bold leading-none">{number}</span>
    </div>
  );
}
