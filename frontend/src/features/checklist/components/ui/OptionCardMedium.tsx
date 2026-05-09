import { cn } from '@/lib/utils';

type OptionCardMediumState = 'default' | 'selected' | 'active';

interface OptionCardMediumProps {
  icon: React.ReactNode;
  label: string;
  state?: OptionCardMediumState;
  onClick: () => void;
  className?: string;
}

export default function OptionCardMedium({
  icon,
  label,
  state = 'default',
  onClick,
  className,
}: OptionCardMediumProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-6 rounded-[6px] w-full',
        'shadow-[0px_6px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer',
        state === 'default' && 'bg-white border border-border-light',
        state === 'selected' && 'bg-white border-2 border-text-main',
        state === 'active' && 'bg-[#F8FEFA] border-2 border-[#22D455]',
        className
      )}
    >
      <div className="shrink-0 w-9 h-9 flex items-center justify-center">{icon}</div>
      <span className="text-[18px] font-semibold text-text-main">{label}</span>
    </button>
  );
}
