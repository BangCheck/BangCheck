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
          'text-[14px] font-medium text-text-main',
          'placeholder:text-text-caption',
          'border-border-mute focus:border-brand-primary',
          'transition-colors',
          'disabled:bg-bg-gray disabled:text-text-caption disabled:cursor-not-allowed',
          className
        )}
      />
    );
  }
);

TextInput.displayName = 'TextInput';
export default TextInput;
