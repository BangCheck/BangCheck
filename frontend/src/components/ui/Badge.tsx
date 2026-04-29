'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'blue' | 'pink';

interface BadgeProps {
  variant?: BadgeVariant;
  children: string;
  className?: string;
}

export function Badge({ variant = 'blue', children, className }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center px-1 py-0.5 rounded-[2px]',
        variant === 'blue' ? 'bg-[#f4f7ff]' : 'bg-[#f9e8f0]',
        className,
      )}
    >
      <span
        className={cn(
          'text-[12px] font-semibold leading-[1.3] whitespace-nowrap',
          variant === 'blue' ? 'text-[#004cbd]' : 'text-[#461a2b]',
        )}
      >
        {children}
      </span>
    </div>
  );
}
