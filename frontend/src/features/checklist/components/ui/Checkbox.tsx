import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export default function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn('flex items-center gap-2 cursor-pointer', className)}
    >
      <div className="flex items-start py-[3px] shrink-0">
        <div
          className={cn(
            'w-4 h-4 rounded-[2px] border flex items-center justify-center transition-colors',
            checked
              ? 'bg-brand-primary border-brand-primary'
              : 'bg-white border-border-mute'
          )}
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-[14px] font-normal leading-[22px] text-[rgba(0,0,0,0.88)] whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
