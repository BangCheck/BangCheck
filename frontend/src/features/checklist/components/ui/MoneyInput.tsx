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
        focused || value ? 'border-[#0A607D]' : 'border-[#BFBFBF]',
        disabled && 'bg-[#F5F5F5] border-[#BFBFBF]',
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
          'placeholder:text-[#A0A0A0]',
          value ? 'text-[#232527]' : 'text-[#A0A0A0]',
          disabled && 'text-[#A0A0A0] cursor-not-allowed'
        )}
      />
      <span className="text-[14px] font-medium text-[#232527] shrink-0 ml-2">만원</span>
    </div>
  );
}
