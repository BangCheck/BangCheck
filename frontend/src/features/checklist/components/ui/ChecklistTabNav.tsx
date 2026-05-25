import type { RefObject } from 'react';
import { cn } from '@/lib/utils';
import { SECTION_TABS, type SectionId } from '@/features/checklist/checklist-constants';

type Props = {
  tabNavRef: RefObject<HTMLElement | null>;
  activeSection: SectionId;
  onScrollTo: (id: SectionId) => void;
  filter?: (id: SectionId) => boolean;
};

export function ChecklistTabNav({ tabNavRef, activeSection, onScrollTo, filter }: Props) {
  const tabs = filter ? SECTION_TABS.filter((t) => filter(t.id)) : SECTION_TABS;
  return (
    <nav
      ref={tabNavRef as RefObject<HTMLElement>}
      className="z-30 bg-white border-b border-border-light px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar"
    >
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          data-tab={id}
          onClick={() => onScrollTo(id)}
          className={cn(
            'shrink-0 px-4 py-1.5 rounded-[4px] text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap',
            activeSection === id
              ? 'bg-bg-primary-soft border border-brand-primary text-brand-primary'
              : 'bg-bg-gray-soft text-text-mute hover:bg-bg-gray-hover',
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
