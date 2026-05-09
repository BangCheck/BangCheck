import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export default function SubmitButton({
  label = '저장하기',
  disabled,
  loading,
  onClick,
  type = 'button',
  className,
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'w-full flex items-center justify-center px-4 py-3 rounded-[6px]',
        'text-[14px] font-semibold text-white transition-colors cursor-pointer',
        disabled || loading ? 'bg-[#40839A]' : 'bg-brand-primary hover:bg-[#085570]',
        (disabled || loading) && 'cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          저장 중...
        </div>
      ) : (
        label
      )}
    </button>
  );
}
