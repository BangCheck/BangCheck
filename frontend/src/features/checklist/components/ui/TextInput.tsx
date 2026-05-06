import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          'h-[36px] w-full px-3 py-[6px] rounded-[6px] border bg-white outline-none',
          'text-[14px] font-medium text-[#232527]',
          'placeholder:text-[#A0A0A0]',
          'border-[#BFBFBF] focus:border-[#0A607D]',
          'transition-colors',
          'disabled:bg-[#F5F5F5] disabled:text-[#A0A0A0] disabled:cursor-not-allowed',
          className
        )}
      />
    );
  }
);

TextInput.displayName = 'TextInput';
export default TextInput;
