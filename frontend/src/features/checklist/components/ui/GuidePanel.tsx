import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { ChecklistGuide } from '../../checklist-guides';

// Figma node 587:45164 (Component 157) — "확인 가이드 보기" 고정 토글 버튼
export function GuideToggleButton({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="flex items-center gap-[10px] px-3 py-1.5 rounded-[6px] border border-[#bfbfbf] cursor-pointer hover:bg-bg-gray-soft transition-colors shrink-0"
    >
      <Icon icon="ix:user-manual" className="size-[18px] text-text-main" />
      <span className="flex items-center gap-1">
        <span className="text-[14px] font-medium text-text-main leading-[1.3]">
          확인 가이드 보기
        </span>
        <Icon
          icon="ic:round-navigate-next"
          className={cn(
            'size-6 text-text-main transition-transform',
            expanded ? '-rotate-90' : 'rotate-90',
          )}
        />
      </span>
    </button>
  );
}

// Figma 587:43553(채광) 등 — 펼침 시 카드 내부 가이드 패널
export function GuidePanel({ guide }: { guide: ChecklistGuide }) {
  const textSize = guide.variant === 'with-photos' ? 'text-[14px]' : 'text-[12px]';
  return (
    <div className="flex flex-col gap-[10px] mt-3 p-6 rounded-[6px] border border-[#e2e2e2] bg-white shadow-[0px_6px_8px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-[15px] pb-6">
        <p className="text-[16px] font-medium text-[#232527] leading-[1.3]">
          {guide.guideTitle}
        </p>
        {guide.guideItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Icon icon="lets-icons:check-fill" className="size-[18px] text-[#232527] shrink-0" />
            <p className={cn('font-medium text-[#777] leading-[1.3]', textSize)}>{item}</p>
          </div>
        ))}
      </div>
      {guide.variant === 'with-photos' && (
        <div className="flex gap-2.5">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="relative flex items-center justify-center h-[268px] w-[400px] bg-[#d9d9d9] rounded-[6px] overflow-hidden"
            >
              <p className="text-[24px] font-medium text-white leading-[1.3] z-10">예시 사진</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
