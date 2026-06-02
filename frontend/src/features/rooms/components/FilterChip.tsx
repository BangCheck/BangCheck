import { cn } from '@/lib/utils';

/**
 * 필터/정렬 패널 공용 칩 버튼.
 * 기존: RoomsPage의 거래방식·정렬 드롭다운 3곳에 동일 스타일이 복붙돼 있던 것을 통합.
 * size: 'md'(데스크톱 개별 패널) | 'sm'(모바일 통합 패널).
 */
export function FilterChip({
  label,
  selected,
  onClick,
  size = 'md',
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  size?: 'md' | 'sm';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap',
        size === 'md' ? 'px-4 py-2 text-[13px]' : 'px-3 py-1.5 text-[12px]',
        selected
          ? 'border border-brand-primary text-brand-primary bg-white'
          : 'bg-bg-gray text-text-caption border border-transparent',
      )}
    >
      {label}
    </button>
  );
}
