import { cn } from '@/lib/utils';

interface SectionTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

export default function SectionTab({ label, active, onClick, className }: SectionTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-[6px] rounded-[4px] text-[14px] font-semibold whitespace-nowrap transition-colors cursor-pointer',
        active
          ? 'bg-bg-primary-soft border border-brand-primary text-brand-primary'
          : 'bg-bg-gray-soft border border-transparent text-text-mute',
        className
      )}
    >
      {label}
    </button>
  );
}
