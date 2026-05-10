import type { ReactNode } from 'react';

export type StatusTone = 'danger' | 'safe' | 'warning';

const TONE_CLASS: Record<StatusTone, string> = {
  danger:
    'bg-[var(--color-status-danger-bg)] border-[var(--color-status-danger-border)] text-[var(--color-status-danger-text)]',
  safe: 'bg-[var(--color-status-safe-bg)] border-[var(--color-status-safe-border)] text-[var(--color-status-safe-text)]',
  warning:
    'bg-[var(--color-status-warning-bg)] border-[var(--color-status-warning-border)] text-[var(--color-status-warning-text)]',
};

type Props = {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
};

export function StatusBadge({ tone, children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[4px] border px-2 py-[2px] text-xs leading-[16.969px] font-normal ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
