import type { ReactNode } from 'react';
import { ChevronRight } from '@/components/ui/ChevronRight';

type Props = {
  title: string;
  onBack: () => void;
  actions?: ReactNode;
};

export function ChecklistPageHeader({ title, onBack, actions }: Props) {
  return (
    <header className="sticky top-14 md:top-16 z-40 bg-white border-b border-border-light h-14 flex items-center px-4 gap-3">
      <button
        type="button"
        onClick={onBack}
        className="p-1 text-text-main cursor-pointer"
        aria-label="뒤로 가기"
      >
        <ChevronRight className="rotate-180 w-6 h-6" />
      </button>
      <h1 className="text-[16px] font-semibold text-text-main flex-1">{title}</h1>
      {actions}
    </header>
  );
}
