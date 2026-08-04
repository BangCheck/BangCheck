import type { ReactNode } from 'react';
import { ChevronRight } from '@/components/ui/ChevronRight';

type Props = {
  title: string;
  onBack: () => void;
  actions?: ReactNode;
  /**
   * Atlas 상세 캔버스가 이 영역을 카드와 잇기 위해 읽는 식별자.
   * 두 체크리스트 페이지가 같은 컴포넌트를 쓰므로 값은 페이지가 넘긴다 —
   * 여기 고정하면 두 페이지의 카드 id가 강제로 같아진다.
   */
  atlasNode?: string;
  atlasLabel?: string;
};

export function ChecklistPageHeader({ title, onBack, actions, atlasNode, atlasLabel }: Props) {
  return (
    <header
      className="sticky top-14 md:top-16 z-40 bg-white border-b border-border-light h-14 flex items-center px-4 gap-3"
      data-atlas-node={atlasNode}
      data-atlas-label={atlasLabel}
    >
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
