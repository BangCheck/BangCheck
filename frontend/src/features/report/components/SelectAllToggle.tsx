import { Icon } from '@iconify/react';

type Props = {
  checked: boolean;
  onChange: () => void;
  label?: string;
  className?: string;
};

export function SelectAllToggle({ checked, onChange, label = '전체선택', className = '' }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`inline-flex h-8 items-center gap-2.5 rounded-[4px] border bg-white px-4 py-2 text-xs font-semibold text-text-main transition-colors
        ${checked ? 'border-text-main' : 'border-border-light'}
        ${className}
      `}
    >
      <Icon
        icon={checked ? 'mingcute:checkbox-fill' : 'mingcute:checkbox-line'}
        width={18}
        height={18}
        className={checked ? 'text-text-main' : 'text-text-caption'}
      />
      <span>{label}</span>
    </button>
  );
}
