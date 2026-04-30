'use client';

import { cn } from '@/lib/utils';

export const SECTIONS = ['기본정보', '건물정보', '옵션', '내부상태', '문제요소', '안전/생활', '나만의항목'] as const;
export type SectionKey = typeof SECTIONS[number];

interface Props {
  active: SectionKey[];
  onToggle: (section: SectionKey) => void;
}

export function SectionFilter({ active, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {SECTIONS.map(section => (
        <button
          key={section}
          onClick={() => onToggle(section)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
            active.includes(section)
              ? 'bg-[#0A607D] text-white border-[#0A607D]'
              : 'bg-white text-[#777] border-[#E2E2E2] hover:border-[#BFBFBF]'
          )}
        >
          {section}
        </button>
      ))}
    </div>
  );
}
