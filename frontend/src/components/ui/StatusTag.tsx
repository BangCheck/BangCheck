'use client';

import { cn } from '@/lib/utils';

type StatusTagVariant = '처리완료' | '취소';

interface StatusTagProps {
  variant: StatusTagVariant;
  className?: string;
}

export function StatusTag({ variant, className }: StatusTagProps) {
  const isCompleted = variant === '처리완료';
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center px-2 py-px rounded-[4px] border w-[61px]',
        isCompleted ? 'bg-[#f5faf7] border-[#76be95]' : 'bg-[#fff0f0] border-[#fc9a9b]',
        className,
      )}
    >
      <span
        className={cn(
          'text-[12px] leading-5 whitespace-nowrap',
          isCompleted ? 'text-[#00873c]' : 'text-[#f83233]',
        )}
      >
        {variant}
      </span>
    </div>
  );
}
