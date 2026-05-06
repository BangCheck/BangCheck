import { cn } from '@/lib/utils';

type OptionCardSmallState = 'default' | 'selected' | 'active';

interface OptionCardSmallProps {
  icon: React.ReactNode;
  label: string;
  state?: OptionCardSmallState;
  onClick: () => void;
  className?: string;
}

export default function OptionCardSmall({
  icon,
  label,
  state = 'default',
  onClick,
  className,
}: OptionCardSmallProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-6 rounded-[6px] w-full',
        'shadow-[0px_6px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer',
        state === 'default' && 'bg-white border border-[#E2E2E2]',
        state === 'selected' && 'bg-white border-2 border-[#232527]',
        state === 'active' && 'bg-[#F4F7FF] border-2 border-[#0A607D]',
        className
      )}
    >
      <div className="shrink-0 w-9 h-9 flex items-center justify-center">{icon}</div>
      <span className="text-[18px] font-semibold text-[#232527]">{label}</span>
    </button>
  );
}
