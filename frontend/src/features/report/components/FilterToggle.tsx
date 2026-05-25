import { Icon } from '@iconify/react';

type Props = {
  open: boolean;
  onToggle: () => void;
  className?: string;
};

export function FilterToggle({ open, onToggle, className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={`inline-flex items-center gap-1.5 sm:gap-2.5 rounded-[6px] border border-border-mute px-2 sm:px-3 py-1.5 text-sm font-semibold text-text-main transition-colors hover:bg-bg-gray ${className}`}
    >
      <Icon icon="mage:filter-fill" width={18} height={18} aria-hidden />
      <span className="hidden sm:inline">{open ? '설정 닫기' : '설정 열기'}</span>
      <Icon
        icon="ic:round-navigate-next"
        width={20}
        height={20}
        aria-hidden
        className={`transition-transform ${open ? '-rotate-90' : 'rotate-90'}`}
      />
    </button>
  );
}
