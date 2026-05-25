import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { ChecklistGuide } from '../../checklist-guides';

// Figma node 587:45164 (Component 157) — "확인 가이드 보기" 토글 버튼
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
      className="flex items-center gap-[6px] sm:gap-[10px] px-2 sm:px-3 py-1.5 rounded-[6px] border border-[#bfbfbf] cursor-pointer hover:bg-bg-gray-soft transition-colors shrink-0"
    >
      <Icon icon="ix:user-manual" className="size-[18px] text-text-main" />
      <span className="hidden sm:inline text-[14px] font-medium text-text-main leading-[1.3] whitespace-nowrap">
        확인 가이드 보기
      </span>
    </button>
  );
}

// Figma 587:43553 등 — 모달 다이얼로그로 표시
export function GuidePanel({ guide, onClose }: { guide: ChecklistGuide; onClose: () => void }) {
  const textSize = guide.variant === 'with-photos' ? 'text-[14px]' : 'text-[13px]';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={guide.guideTitle}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(0,0,0,0.5)]"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col gap-3 max-h-[90vh] w-full max-w-[640px] overflow-y-auto p-6 rounded-[8px] bg-white shadow-[0px_10px_24px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 flex items-center justify-center size-9 rounded-full hover:bg-bg-gray-soft transition-colors cursor-pointer"
        >
          <Icon icon="ic:round-close" className="size-6 text-text-main" />
        </button>

        {/* Title */}
        <p className="text-[18px] font-semibold text-[#232527] leading-[1.3] pr-10">
          {guide.guideTitle}
        </p>

        {/* Items */}
        <div className="flex flex-col gap-[15px] mt-2">
          {guide.guideItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Icon icon="lets-icons:check-fill" className="size-[18px] text-[#232527] shrink-0 mt-0.5" />
              <p className={cn('font-medium text-[#777] leading-[1.4]', textSize)}>{item}</p>
            </div>
          ))}
        </div>

        {/* Main guide photo (annotated composite) */}
        {guide.variant === 'with-photos' && guide.mainPhoto && (
          <div className="w-full mt-4 rounded-[6px] overflow-hidden">
            <img src={guide.mainPhoto} alt="가이드 사진" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Example photos — examplesPhoto가 있을 때만 표시 */}
        {guide.variant === 'with-photos' && guide.examplesPhoto && (
          <div className="flex flex-col sm:flex-row gap-2.5 mt-3">
            {(['left center', 'right center'] as const).map((pos, idx) => (
              <div
                key={idx}
                className="relative flex items-center justify-center h-[180px] sm:h-[200px] flex-1 bg-[#d9d9d9] rounded-[6px] overflow-hidden"
              >
                <img
                  src={guide.examplesPhoto}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: pos }}
                />
                <div className="absolute inset-0 bg-black/20" />
                <p className="relative text-[18px] font-medium text-white leading-[1.3] drop-shadow-sm">예시 사진</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
