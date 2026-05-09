import { cn } from '@/lib/utils';

interface MoneyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  focused?: boolean;
  className?: string;
}

export default function MoneyInput({
  value,
  onChange,
  placeholder = '예 : 1000',
  disabled,
  focused,
  className,
}: MoneyInputProps) {
  return (
    <div
      className={cn(
        'h-[36px] w-full flex items-center justify-between px-3 py-[6px]',
        'rounded-[6px] border bg-white transition-colors',
        focused || value ? 'border-brand-primary' : 'border-border-mute',
        disabled && 'bg-bg-gray border-border-mute',
        className
      )}
    >
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex-1 min-w-0 outline-none bg-transparent',
          'text-[14px] font-medium',
          'placeholder:text-text-caption',
          value ? 'text-text-main' : 'text-text-caption',
          disabled && 'text-text-caption cursor-not-allowed'
        )}
      />
      <span className="text-[14px] font-medium text-text-main shrink-0 ml-2">만원</span>
    </div>
  );
}
